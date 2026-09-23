const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const multer = require('multer');

const DocumentsRepository = require('../repositories/documents.repository');
const DocumentsService = require('../services/documents.service');
const DocumentsController = require('../controllers/documents.controller');

const storageDir = process.env.STORAGE_DIR
  ? path.resolve(process.cwd(), process.env.STORAGE_DIR)
  : path.resolve(__dirname, '../../storage');
const repository = new DocumentsRepository(storageDir);
const service = new DocumentsService(repository);
const controller = new DocumentsController(service);
const storage = multer.diskStorage({
  destination: storageDir,
  filename: (request, file, callback) => {
    callback(null, `${crypto.randomUUID()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

const router = express.Router();
router.post('/upload', upload.single('file'), controller.upload);
router.get('/documents', controller.list);
router.get('/documents/:id/download', controller.download);

module.exports = router;