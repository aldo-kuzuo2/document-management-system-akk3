class DocumentQueryService {
  constructor(repository) {
    this.repository = repository;
  }

  listByOwner(owner) {
    return this.repository.findByOwner(owner);
  }

  getDownload(id, owner) {
    const document = this.repository.findById(id);

    if (!document) {
      throw this.createError('Documento não encontrado', 404);
    }

    if (document.owner !== owner) {
      throw this.createError('Acesso negado', 403);
    }

    return {
      ...document,
      filePath: this.repository.getFilePath(document),
    };
  }

  createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }
}

module.exports = DocumentQueryService;