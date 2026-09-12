export class BoardApiError extends Error {
  constructor(status, code, message){ super(message); this.status=status; this.code=code; }
}

async function parse(response){
  const payload = await response.json().catch(() => null);
  if(!response.ok){ throw new BoardApiError(response.status, payload?.code ?? 'HTTP_ERROR', payload?.message ?? `HTTP ${response.status}`); }
  return payload;
}

export const BoardApiClient = {
  async create(name){
    // TODO LAB-05: keep HTTP details in this module only.
    const response = await fetch('/api/boards',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
    return parse(response);
  },
  async load(id){
    // TODO LAB-05: validate id and translate non-2xx responses consistently.
    const response = await fetch(`/api/boards/${encodeURIComponent(id)}`);
    return parse(response);
  },
  async save(board){
    // TODO LAB-05: PUT the complete board state; do not invent /move or /draw endpoints.
    const response = await fetch(`/api/boards/${encodeURIComponent(board.id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:board.name,elements:board.elements})});
    return parse(response);
  }
};
