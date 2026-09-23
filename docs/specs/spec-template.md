# Especificação - Document Management System

> Modelo de especificação (spec) para orientar o desenvolvimento guiado por
> especificação (Spec Driven Development). Preencha cada seção com o apoio do
> Plan Mode do GitHub Copilot durante o Passo 1.

## 1. Objetivo

Descreva em uma frase o que o sistema deve entregar.

## 2. Escopo

### Dentro do escopo

- Upload de documentos
- Listagem de documentos
- Download de documentos
- Gestão simples por usuário

### Fora do escopo

- Armazenamento externo ou em nuvem
- Versionamento de documentos

## 3. Requisitos funcionais

| ID    | Requisito                                            |
| ----- | ---------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento                   |
| RF-02 | O usuário pode listar os documentos enviados         |
| RF-03 | O usuário pode baixar um documento pelo identificador|

## 4. Requisitos não funcionais

| ID     | Requisito                                                   |
| ------ | ----------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via multer            |
| RNF-02 | Metadados mantidos em memória nesta fase                    |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor)          |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                          |
| ------------ | ------ | ---------------------------------- |
| id           | string | Identificador único do documento   |
| originalName | string | Nome original do arquivo enviado   |
| size         | number | Tamanho em bytes                   |
| uploadedAt   | string | Data/hora do upload (ISO 8601)     |
| owner        | string | Identificador do usuário dono      |

## 6. Contratos de API

### POST /upload

- Entrada: arquivo (multipart/form-data)
- Saída: metadados do documento criado

### GET /documents

- Saída: lista de metadados de documentos

### GET /documents/:id/download

- Saída: conteúdo binário do arquivo

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples (routes, controllers, services, repositories)
- Frontend baseado em componentes (React)
- Armazenamento local apenas

## 8. Plano de execução

Liste as etapas na ordem de implementação (gerado no Passo 1).

1. **Especificação**
	- Consolidar requisitos funcionais e não funcionais, modelo de dados,
	  contratos de API, decisões arquiteturais e critérios de aceite.
	- Entregável: `docs/specs/dms-spec.md`.

2. **Infraestrutura e configuração do backend**
	- Configurar Express, `PORT`, diretório de armazenamento local e limite de
	  upload por variáveis de ambiente.
	- Manter o endpoint `GET /health`.

3. **Repositórios**
	- Implementar o armazenamento físico com `multer.diskStorage` em
	  `backend/storage`.
	- Implementar o repositório em memória dos metadados dos documentos.
	- Gerar nomes internos seguros e evitar acesso arbitrário ao filesystem.

4. **Serviços de negócio**
	- Implementar upload, listagem por usuário e download.
	- Validar existência do documento e propriedade por usuário.
	- Tratar limpeza de arquivos quando o registro do metadado falhar.

5. **Controllers e rotas**
	- Publicar `POST /upload`, `GET /documents` e
	  `GET /documents/:id/download`.
	- Validar entrada HTTP, headers, multipart, parâmetros e códigos de erro.

6. **Testes do backend**
	- Cobrir health check, upload válido e inválido, listagem, download,
	  documento inexistente e isolamento entre usuários.

7. **Serviços do frontend**
	- Implementar chamadas `fetch` para a API usando o prefixo `/api`.
	- Converter respostas de erro em estados tratáveis pela interface.

8. **Componentes e tela do frontend**
	- Criar seleção e envio de arquivos, listagem de documentos e ação de
	  download.
	- Exibir estados de carregamento, sucesso, lista vazia e erro.

9. **Integração e validação final**
	- Validar o proxy do Vite, o fluxo completo entre frontend e backend, o
	  build do frontend e a suíte de testes do backend.
	- Confirmar que os arquivos continuam armazenados exclusivamente no
	  filesystem local e que os metadados permanecem em memória.
