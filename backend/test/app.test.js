const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { after, test } = require('node:test');
const assert = require('node:assert/strict');

const storageDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDir;
const app = require('../src/app');

let server;

async function serverUrl() {
  if (!server) {
    server = app.listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
  }
  return `http://127.0.0.1:${server.address().port}`;
}

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
  await fsPromises.rm(storageDir, { recursive: true, force: true });
});

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('faz upload, lista e baixa um documento', async () => {
  const form = new FormData();
  form.append('file', new Blob(['conteudo de teste'], { type: 'text/plain' }), 'teste.txt');
  const baseUrl = await serverUrl();

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'user-1' },
    body: form,
  });
  assert.equal(uploadResponse.status, 201);
  const uploadedDocument = await uploadResponse.json();

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'user-1' },
  });
  assert.equal(listResponse.status, 200);
  assert.equal((await listResponse.json()).documents[0].id, uploadedDocument.id);

  const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`, {
    headers: { 'X-User-Id': 'user-1' },
  });
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'conteudo de teste');
});
