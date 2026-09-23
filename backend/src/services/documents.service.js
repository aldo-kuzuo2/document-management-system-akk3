const crypto = require('node:crypto');

class DocumentsService {
  constructor(repository) {
    this.repository = repository;
  }

  async upload(file, owner) {
    const metadata = {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
    };

    try {
      return this.repository.create(metadata);
    } catch (error) {
      await this.repository.removeFile(file.path);
      throw error;
    }
  }

  list(owner) {
    return this.repository.findByOwner(owner);
  }

  getDownload(id, owner) {
    const document = this.repository.findById(id);

    if (!document) {
      const error = new Error('Documento não encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (document.owner !== owner) {
      const error = new Error('Acesso negado');
      error.statusCode = 403;
      throw error;
    }

    return {
      ...document,
      filePath: this.repository.getFilePath(document),
    };
  }
}

module.exports = DocumentsService;