# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários enviem, consultem e baixem documentos armazenados localmente, com metadados mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de documentos.
- Armazenamento físico local em `backend/storage`.
- Listagem dos documentos pertencentes ao usuário.
- Download de documentos pelo identificador.
- Gestão simples por usuário.
- Interface React para upload, listagem e download.

### Fora do escopo

- Autenticação e autorização completas.
- Armazenamento externo ou em nuvem.
- Persistência de metadados em banco de dados.
- Versionamento, edição ou exclusão de documentos.
- Compartilhamento entre usuários.
- Pré-visualização ou conversão de arquivos.
- Paginação e busca avançada.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode selecionar e enviar um documento. |
| RF-02 | O backend deve aceitar upload via `multipart/form-data`, no campo `file`. |
| RF-03 | Cada documento recebe um identificador único. |
| RF-04 | O sistema deve registrar nome original, tamanho, data de upload e dono. |
| RF-05 | O usuário pode listar seus documentos. |
| RF-06 | O usuário pode baixar um documento existente pelo identificador. |
| RF-07 | O sistema deve rejeitar requisições sem arquivo. |
| RF-08 | O sistema deve rejeitar documentos inexistentes ou pertencentes a outro usuário. |
| RF-09 | A interface deve informar estados de carregamento, sucesso e erro. |
| RF-10 | O sistema deve expor `GET /health` para verificação de disponibilidade. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados no filesystem local usando `multer.diskStorage`. |
| RNF-02 | O diretório padrão de armazenamento deve ser `backend/storage`. |
| RNF-03 | Os metadados devem permanecer em memória nesta fase. |
| RNF-04 | A perda dos metadados após reinício deve ser aceita e documentada. |
| RNF-05 | As configurações operacionais devem ser obtidas por variáveis de ambiente. |
| RNF-06 | O backend deve seguir `routes -> controllers -> services -> repositories`. |
| RNF-07 | O frontend deve usar React, componentes funcionais e `fetch`. |
| RNF-08 | As chamadas do frontend devem usar o prefixo `/api`. |
| RNF-09 | Erros de entrada, upload e filesystem devem ser tratados nas bordas do sistema. |
| RNF-10 | Entradas de rota não podem permitir acesso arbitrário ao filesystem. |

## 5. Modelo de dados

### Metadado do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único e opaco do documento. |
| `originalName` | string | Sim | Nome original do arquivo enviado. |
| `storedName` | string | Sim | Nome interno seguro usado no filesystem. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload em ISO 8601. |
| `owner` | string | Sim | Identificador do usuário dono. |

Os metadados são mantidos em uma coleção em memória indexada por `id`. O caminho
físico deve ser derivado do `storedName` controlado pelo sistema, nunca diretamente
de `originalName` ou de entrada livre da URL.

### Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do backend. |
| `STORAGE_DIR` | `backend/storage` | Diretório local dos arquivos. |
| `MAX_FILE_SIZE` | definido pela aplicação | Limite máximo do upload em bytes. |

## 6. Contratos de API

Todas as respostas são JSON, exceto downloads. O usuário é identificado pelo
cabeçalho `X-User-Id`.

### GET /health

Resposta `200`:

```json
{ "status": "ok" }
```

### POST /upload

Entrada:

- `Content-Type: multipart/form-data`
- Campo obrigatório: `file`
- Cabeçalho obrigatório: `X-User-Id`

Resposta `201` com os metadados do documento criado:

```json
{
  "id": "document-id",
  "originalName": "relatorio.pdf",
  "size": 2048,
  "uploadedAt": "2026-09-23T12:00:00.000Z",
  "owner": "user-123"
}
```

Erros: `400` para usuário ou arquivo ausente, `413` para arquivo acima do limite
e `500` para falha inesperada de armazenamento.

### GET /documents

Entrada: cabeçalho obrigatório `X-User-Id`.

Resposta `200`:

```json
{
  "documents": [
    {
      "id": "document-id",
      "originalName": "relatorio.pdf",
      "size": 2048,
      "uploadedAt": "2026-09-23T12:00:00.000Z",
      "owner": "user-123"
    }
  ]
}
```

A resposta contém somente documentos pertencentes ao usuário solicitante.
Informações internas como `storedName` não são expostas ao frontend.

### GET /documents/:id/download

Entrada: cabeçalho obrigatório `X-User-Id`.

Respostas:

- `200` com o conteúdo binário e `Content-Disposition` usando o nome original.
- `404` se o documento não existir.
- `403` se o documento pertencer a outro usuário.
- `500` para falha de leitura do arquivo.

### Formato de erro

```json
{
  "error": "Descrição pública do erro"
}
```

As mensagens não devem expor caminhos internos ou detalhes do filesystem.

## 7. Decisões arquiteturais

- `routes/` registra endpoints e encaminha requisições.
- `controllers/` valida entrada HTTP e formata respostas.
- `services/` concentra regras de negócio, ownership e download.
- `repositories/` encapsula metadados em memória e operações no filesystem.
- `multer.diskStorage` grava arquivos somente no diretório local configurado.
- O nome físico do arquivo é gerado pelo sistema para evitar colisões e path traversal.
- O frontend acessa o backend através do proxy Vite `/api`.
- Não será introduzido banco de dados, autenticação ou armazenamento externo.
- Falhas após o upload físico devem tentar remover o arquivo parcialmente criado.

## 8. Plano de execução

1. **Especificação**
   - Consolidar requisitos, modelo de dados, contratos, decisões arquiteturais e critérios de aceite.
   - Entregável: `docs/specs/dms-spec.md`.

2. **Infraestrutura e configuração do backend**
   - Configurar Express, `PORT`, diretório local, limite de upload e tratamento de erros.
   - Manter o endpoint `GET /health`.

3. **Repositórios**
   - Implementar `multer.diskStorage` e o repositório em memória dos metadados.
   - Gerar nomes internos seguros e impedir acesso arbitrário ao filesystem.

4. **Serviços de negócio**
   - Implementar upload, listagem por usuário e download.
   - Validar existência, ownership e limpeza de arquivos em caso de falha.

5. **Controllers e rotas**
   - Publicar `POST /upload`, `GET /documents` e `GET /documents/:id/download`.
   - Validar headers, multipart, parâmetros, respostas e códigos de erro.

6. **Testes do backend**
   - Cobrir health check, upload válido e inválido, listagem, download, 404 e isolamento entre usuários.
   - Executar com `npm test`.

7. **Serviços do frontend**
   - Implementar chamadas `fetch` usando o prefixo `/api`.
   - Converter erros HTTP em estados tratáveis pela interface.

8. **Componentes e tela do frontend**
   - Criar seleção e envio de arquivos, listagem e ação de download.
   - Exibir carregamento, sucesso, lista vazia e erro.

9. **Integração e validação final**
   - Validar o proxy do Vite, o fluxo completo, o build do frontend e os testes do backend.
   - Confirmar armazenamento exclusivamente local e metadados em memória.

## 9. Critérios gerais de aceite

- Upload, listagem filtrada por usuário e download local funcionam conforme os contratos.
- O backend respeita `routes -> controllers -> services -> repositories`.
- O frontend usa o proxy `/api` e apresenta os principais estados da operação.
- `npm test` passa no backend e `npm run build` passa no frontend.
- Nenhum armazenamento externo é utilizado.
