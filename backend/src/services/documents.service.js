const DocumentQueryService = require('./document-query.service');
const DocumentUploadService = require('./document-upload.service');

class DocumentsService {
  constructor(repository, dependencies = {}) {
    this.uploadService = new DocumentUploadService(repository, dependencies);
    this.queryService = new DocumentQueryService(repository);
  }

  upload(file, owner) {
    return this.uploadService.execute(file, owner);
  }

  list(owner) {
    return this.queryService.listByOwner(owner);
  }

  getDownload(id, owner) {
    return this.queryService.getDownload(id, owner);
  }
}

module.exports = DocumentsService;