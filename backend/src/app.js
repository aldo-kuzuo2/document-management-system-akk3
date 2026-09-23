// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const documentsRouter = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(documentsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((error, request, response, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return response.status(413).json({ error: 'O arquivo excede o limite permitido' });
  }

  const statusCode = error.statusCode || 500;
  return response.status(statusCode).json({
    error: statusCode === 500 ? 'Erro interno do servidor' : error.message,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
