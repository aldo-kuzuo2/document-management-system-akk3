class DocumentsController {
  constructor(service) {
    this.service = service;
    this.upload = this.upload.bind(this);
    this.list = this.list.bind(this);
    this.download = this.download.bind(this);
  }

  getOwner(request) {
    const owner = request.get('X-User-Id');
    if (!owner) {
      const error = new Error('O cabeçalho X-User-Id é obrigatório');
      error.statusCode = 400;
      throw error;
    }
    return owner;
  }

  async upload(request, response) {
    const owner = this.getOwner(request);
    if (!request.file) {
      const error = new Error('O arquivo é obrigatório');
      error.statusCode = 400;
      throw error;
    }

    const { storedName, ...document } = await this.service.upload(request.file, owner);
    response.status(201).json(document);
  }

  list(request, response) {
    const documents = this.service.list(this.getOwner(request));
    response.json({
      documents: documents.map(({ storedName, ...document }) => document),
    });
  }

  download(request, response) {
    const document = this.service.getDownload(request.params.id, this.getOwner(request));
    response.download(document.filePath, document.originalName, (error) => {
      if (error && !response.headersSent) {
        response.status(500).json({ error: 'Não foi possível baixar o documento' });
      }
    });
  }
}

module.exports = DocumentsController;