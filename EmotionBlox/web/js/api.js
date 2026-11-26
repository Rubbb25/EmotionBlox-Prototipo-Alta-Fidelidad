// Cliente de la API (fetch). Los errores llevan un mensaje amable listo para mostrar (heurística H9).
export class ApiError extends Error {
  constructor(message, { status = 0, field = null, network = false } = {}) {
    super(message); this.status = status; this.field = field; this.network = network;
  }
}

const tokens = { parent: null, admin: null };
export const setToken = (role, t) => { tokens[role] = t; try { sessionStorage.setItem('eb_tok_' + role, t || ''); } catch { /* ok */ } };
export const getToken = (role) => { if (tokens[role] == null) { try { tokens[role] = sessionStorage.getItem('eb_tok_' + role) || null; } catch { /* ok */ } } return tokens[role]; };

async function call(method, url, body, role) {
  const headers = { 'Content-Type': 'application/json' };
  const tok = role ? getToken(role) : null;
  if (tok) headers.Authorization = 'Bearer ' + tok;
  let res;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError('No pudimos conectarnos. Revisa que el servidor esté encendido e inténtalo otra vez.', { network: true });
  }
  let data = null;
  try { data = await res.json(); } catch { /* sin cuerpo */ }
  if (!res.ok) throw new ApiError((data && data.error) || 'Algo salió mal. Inténtalo otra vez.', { status: res.status, field: data && data.field });
  return data;
}

export const api = {
  get: (u, role) => call('GET', u, undefined, role),
  post: (u, b, role) => call('POST', u, b || {}, role),
  put: (u, b, role) => call('PUT', u, b || {}, role),
  del: (u, role) => call('DELETE', u, undefined, role),
};
