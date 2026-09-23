const assert = require('node:assert/strict');
const { test } = require('node:test');

const DocumentsService = require('../src/services/documents.service');

function createRepository(documents = []) {
  const storedDocuments = new Map(documents.map((document) => [document.id, document]));
  const removedFiles = [];

  return {
    removedFiles,
    create(metadata) {
      storedDocuments.set(metadata.id, metadata);
      return metadata;
    },
    findById(id) {
      return storedDocuments.get(id);
    },
    findByOwner(owner) {
      return [...storedDocuments.values()].filter((document) => document.owner === owner);
    },
    getFilePath(document) {
      return `/storage/${document.storedName}`;
    },
    async removeFile(filePath) {
      removedFiles.push(filePath);
    },
  };
}

test('cria metadados de upload por meio do serviço especializado', async () => {
  const repository = createRepository();
  const service = new DocumentsService(repository, {
    createId: () => 'document-1',
    getCurrentTime: () => '2026-09-23T00:00:00.000Z',
  });

  const document = await service.upload({
    originalname: 'report.pdf',
    filename: 'document-1.pdf',
    path: '/storage/document-1.pdf',
    size: 42,
  }, 'user-1');

  assert.deepStrictEqual(document, {
    id: 'document-1',
    originalName: 'report.pdf',
    storedName: 'document-1.pdf',
    size: 42,
    uploadedAt: '2026-09-23T00:00:00.000Z',
    owner: 'user-1',
  });
});

test('lista somente os documentos do usuário', () => {
  const repository = createRepository([
    { id: 'one', owner: 'user-1' },
    { id: 'two', owner: 'user-2' },
  ]);
  const service = new DocumentsService(repository);

  assert.deepStrictEqual(service.list('user-1').map((document) => document.id), ['one']);
});

test('impede download de documento de outro usuário', () => {
  const repository = createRepository([{ id: 'one', owner: 'user-1', storedName: 'one.pdf' }]);
  const service = new DocumentsService(repository);

  assert.throws(() => service.getDownload('one', 'user-2'), (error) => {
    assert.equal(error.statusCode, 403);
    return true;
  });
});

test('remove o arquivo quando o registro dos metadados falha', async () => {
  const repository = createRepository();
  repository.create = () => {
    throw new Error('falha de persistência');
  };
  const service = new DocumentsService(repository);
  const file = { originalname: 'report.pdf', filename: 'report.pdf', path: '/tmp/report.pdf', size: 10 };

  await assert.rejects(() => service.upload(file, 'user-1'), /falha de persistência/);
  assert.deepStrictEqual(repository.removedFiles, ['/tmp/report.pdf']);
});