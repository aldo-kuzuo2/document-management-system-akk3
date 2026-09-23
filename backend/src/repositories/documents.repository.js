const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');

class DocumentsRepository {
  constructor(storageDir) {
    this.storageDir = storageDir;
    this.documents = new Map();
    fs.mkdirSync(storageDir, { recursive: true });
  }

  create(metadata) {
    this.documents.set(metadata.id, metadata);
    return metadata;
  }

  findById(id) {
    return this.documents.get(id);
  }

  findByOwner(owner) {
    return [...this.documents.values()].filter((document) => document.owner === owner);
  }

  getFilePath(document) {
    return path.join(this.storageDir, document.storedName);
  }

  async removeFile(filePath) {
    await fsPromises.unlink(filePath).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

module.exports = DocumentsRepository;