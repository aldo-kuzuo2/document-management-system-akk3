const API_PREFIX = '/api';

async function parseResponse(response) {
  if (response.ok) {
    return response;
  }

  const body = await response.json().catch(() => ({}));
  throw new Error(body.error || 'Não foi possível concluir a operação');
}

function userHeaders(userId) {
  return { 'X-User-Id': userId };
}

export async function listDocuments(userId) {
  const response = await fetch(`${API_PREFIX}/documents`, {
    headers: userHeaders(userId),
  });
  const validResponse = await parseResponse(response);
  const body = await validResponse.json();
  return body.documents;
}

export async function uploadDocument(file, userId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    headers: userHeaders(userId),
    body: formData,
  });
  const validResponse = await parseResponse(response);
  return validResponse.json();
}

export async function downloadDocument(documentId, userId) {
  const response = await fetch(`${API_PREFIX}/documents/${documentId}/download`, {
    headers: userHeaders(userId),
  });
  const validResponse = await parseResponse(response);
  return validResponse.blob();
}