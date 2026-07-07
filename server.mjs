import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {extname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const supabaseRestUrl = (process.env.SUPABASE_REST_URL || '').replace(/\/$/, '');
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
const supabaseAuthUrl = supabaseRestUrl.replace('/rest/v1', '/auth/v1');

const tables = {
  inbox: 'inbox',
  bankAccounts: 'bank_accounts',
  records: 'records',
  modules: 'module_records'
};

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function send(res, status, body, headers={}){
  res.writeHead(status, headers);
  res.end(body);
}

async function bodyJson(req){
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if(!chunks.length) return null;
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function mapPayload(resource, data){
  if(resource === 'bankAccounts'){
    return {
      id: data.id,
      name: data.name,
      type: data.type || 'bank',
      book_balance: Number(data.bookBalance ?? data.book_balance ?? 0),
      statement_balance: Number(data.statementBalance ?? data.statement_balance ?? 0),
      status: data.status || 'نشط'
    };
  }
  if(resource === 'records'){
    return {
      id: data.id,
      type: data.type,
      account_id: data.accountId || data.account_id || null,
      file_name: data.fileName || data.file_name || null,
      status: data.status || 'مسودة'
    };
  }
  if(resource === 'modules'){
    return {
      id: data.id,
      module: data.module,
      title: data.title || data.name || data.id,
      status: data.status || 'مسودة',
      project: data.project || '',
      description: data.description || '',
      total: data.total || '0.00 ﷼',
      source_inbox_id: data.sourceInboxId || data.source_inbox_id || null
    };
  }
  if(resource === 'inbox'){
    return {
      id: data.id,
      title: data.title,
      sender: data.from || data.sender || '',
      time_label: data.time || data.time_label || '',
      type: data.type,
      status: data.status,
      priority: data.priority,
      assignee: data.assignee,
      project: data.project,
      attachment: data.attachment || '—',
      suggested: data.suggested || '',
      body: data.body || '',
      activity: data.activity || []
    };
  }
  return data;
}

async function proxyApi(req, res, url){
  if(!supabaseRestUrl || !supabaseAnonKey) {
    return send(res, 500, JSON.stringify({error:'Supabase environment variables are missing'}), {'Content-Type':mime['.json']});
  }

  const parts = url.pathname.split('/').filter(Boolean);
  const resource = parts[1];
  const id = parts[2];
  const table = tables[resource];
  if(!table) return send(res, 404, JSON.stringify({error:'Unknown resource'}), {'Content-Type':mime['.json']});

  const auth = req.headers.authorization || '';
  if(!auth.startsWith('Bearer ')) {
    return send(res, 401, JSON.stringify({error:'Missing user token'}), {'Content-Type':mime['.json']});
  }

  let target = `${supabaseRestUrl}/${table}`;
  const headers = {
    apikey: supabaseAnonKey,
    Authorization: auth,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };
  const init = {method:req.method, headers};

  if(req.method === 'GET'){
    target += id ? `?id=eq.${encodeURIComponent(id)}&select=*` : '?select=*';
  }else if(req.method === 'POST'){
    target += '?select=*';
    init.body = JSON.stringify(mapPayload(resource, await bodyJson(req)));
  }else if(req.method === 'PUT' || req.method === 'PATCH'){
    if(!id) return send(res, 400, JSON.stringify({error:'Missing id'}), {'Content-Type':mime['.json']});
    init.method = 'PATCH';
    target += `?id=eq.${encodeURIComponent(id)}`;
    init.body = JSON.stringify(mapPayload(resource, await bodyJson(req)));
  }else if(req.method === 'DELETE'){
    if(!id) return send(res, 400, JSON.stringify({error:'Missing id'}), {'Content-Type':mime['.json']});
    target += `?id=eq.${encodeURIComponent(id)}`;
    headers.Prefer = 'return=minimal';
  }else{
    return send(res, 405, JSON.stringify({error:'Method not allowed'}), {'Content-Type':mime['.json']});
  }

  const upstream = await fetch(target, init);
  const text = await upstream.text();
  send(res, upstream.status, text || '{}', {'Content-Type': upstream.headers.get('content-type') || mime['.json']});
}

async function requireAdmin(req){
  if(!supabaseRestUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    throw new Error('Admin server environment is missing SUPABASE_SERVICE_ROLE_KEY');
  }
  const auth = req.headers.authorization || '';
  if(!auth.startsWith('Bearer ')) throw new Error('Missing user token');

  const userRes = await fetch(`${supabaseAuthUrl}/user`, {
    headers:{apikey:supabaseAnonKey, Authorization:auth}
  });
  const user = await userRes.json();
  if(!userRes.ok || !user?.id) throw new Error('Invalid user token');

  if(adminEmails.includes(String(user.email || '').toLowerCase())) return user;

  const profileRes = await fetch(`${supabaseRestUrl}/profiles?id=eq.${encodeURIComponent(user.id)}&select=role,email`, {
    headers:{
      apikey:supabaseServiceRoleKey,
      Authorization:`Bearer ${supabaseServiceRoleKey}`
    }
  });
  const profiles = await profileRes.json();
  const profile = Array.isArray(profiles) ? profiles[0] : null;
  if(profile?.role !== 'admin') throw new Error('Admin role is required');
  return user;
}

async function proxyAdmin(req, res, url){
  try{
    await requireAdmin(req);
    if(url.pathname === '/admin/users' && req.method === 'GET'){
      const upstream = await fetch(`${supabaseAuthUrl}/admin/users`, {
        headers:{
          apikey:supabaseServiceRoleKey,
          Authorization:`Bearer ${supabaseServiceRoleKey}`
        }
      });
      const data = await upstream.json();
      const users = (data.users || []).map(u => ({
        id:u.id,
        email:u.email,
        name:u.user_metadata?.name || u.raw_user_meta_data?.name || '',
        role:u.user_metadata?.role || u.raw_user_meta_data?.role || 'user',
        email_confirmed_at:u.email_confirmed_at,
        last_sign_in_at:u.last_sign_in_at,
        created_at:u.created_at
      }));
      return send(res, upstream.status, JSON.stringify(users), {'Content-Type':mime['.json']});
    }

    if(url.pathname === '/admin/users/invite' && req.method === 'POST'){
      const body = await bodyJson(req);
      const upstream = await fetch(`${supabaseAuthUrl}/admin/invite`, {
        method:'POST',
        headers:{
          apikey:supabaseServiceRoleKey,
          Authorization:`Bearer ${supabaseServiceRoleKey}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({
          email:body.email,
          data:{name:body.name || '', role:body.role || 'viewer'}
        })
      });
      const text = await upstream.text();
      return send(res, upstream.status, text || '{}', {'Content-Type': upstream.headers.get('content-type') || mime['.json']});
    }

    return send(res, 404, JSON.stringify({error:'Unknown admin endpoint'}), {'Content-Type':mime['.json']});
  }catch(err){
    return send(res, 403, JSON.stringify({error:err.message || 'Admin access denied'}), {'Content-Type':mime['.json']});
  }
}

async function serveStatic(req, res, url){
  let filePath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  filePath = normalize(filePath).replace(/^(\.\.[/\\])+/, '');
  const absolute = join(root, filePath);
  if(!absolute.startsWith(root)) return send(res, 403, 'Forbidden');
  const finalPath = existsSync(absolute) ? absolute : join(root, 'index.html');
  const ext = extname(finalPath);
  const body = await readFile(finalPath);
  send(res, 200, body, {'Content-Type': mime[ext] || 'application/octet-stream'});
}

createServer(async (req, res) => {
  try{
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if(url.pathname === '/health') return send(res, 200, JSON.stringify({ok:true}), {'Content-Type':mime['.json']});
    if(url.pathname.startsWith('/admin/')) return proxyAdmin(req, res, url);
    if(url.pathname.startsWith('/api/')) return proxyApi(req, res, url);
    return serveStatic(req, res, url);
  }catch(err){
    send(res, 500, JSON.stringify({error:err.message || 'Server error'}), {'Content-Type':mime['.json']});
  }
}).listen(port, () => {
  console.log(`Tasneef ERP is running on http://localhost:${port}`);
});
