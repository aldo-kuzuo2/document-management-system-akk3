const crypto = require('node:crypto');

class DocumentUploadService {
  constructor(repository, dependencies = {}) {
    this.repository = repository;
    this.createId = dependencies.createId || crypto.randomUUID;
    this.getCurrentTime = dependencies.getCurrentTime || (() => new Date().toISOString());
  }

  async execute(file, owner) {
    const metadata = {
      id: this.createId(),
      originalName: file.originalname,
      storedName: file.filename,
      size: file.size,
      uploadedAt: this.getCurrentTime(),
      owner,
    };

    try {
      return this.repository.create(metadata);
    } catch (error) {
      await this.repository.removeFile(file.path);
      throw error;
    }
  }
}

module.exports = DocumentUploadService;