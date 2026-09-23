---
description: 'Cria uma camada backend completa para um recurso, seguindo a Clean Architecture simples do projeto.'
applyTo: '**/*.prompt.md'
name: scaffold-camada
agent: agent
argument-hint: 'Nome do recurso em inglês, por exemplo documents'
---

# Scaffold de Camada do Backend

## Missão

Implemente a camada backend do recurso `${input:recurso:documents}` seguindo a
Clean Architecture simples definida no repositório.

## Escopo e pré-condições

- Leia `.github/copilot-instructions.md`, `docs/specs/dms-spec.md` se existir e
  os arquivos próximos do recurso antes de editar.
- Confirme endpoints, campos, regras de negócio e códigos de erro na
  especificação. Preserve a compatibilidade existente em caso de conflito.
- O backend usa CommonJS, JavaScript sem TypeScript, Express e o runner nativo
  de testes do Node.
- Não altere frontend, dependências ou arquivos fora de `backend/src` e dos
  testes diretamente relacionados sem necessidade explícita.

## Entradas

- Recurso: `${input:recurso:documents}`.
- Contexto: requisitos, contratos e implementações existentes no repositório.
- Se o nome do recurso estiver vazio, inválido ou não estiver em inglês,
  solicite um nome válido e pare sem criar arquivos.

## Fluxo de execução

1. Inspecione a estrutura atual, os testes e as rotas existentes. Não
	sobrescreva mudanças do usuário.
2. Gere, quando aplicável, estes arquivos em `backend/src`:
	- `routes/${input:recurso}.routes.js`: registra endpoints e delega ao
	  controller.
	- `controllers/${input:recurso}.controller.js`: valida entrada HTTP e
	  formata respostas.
	- `services/${input:recurso}.service.js`: concentra regras de negócio e
	  não depende diretamente de objetos HTTP.
	- `repositories/${input:recurso}.repository.js`: encapsula persistência e
	  acesso a recursos externos.
3. Conecte as dependências na rota ou em um módulo de composição, mantendo o
	fluxo `routes -> controllers -> services -> repositories`.
4. Registre o roteador no ponto de entrada somente se ele ainda não estiver
	registrado.
5. Para recursos de documentos ou upload, use obrigatoriamente
	`multer.diskStorage` e grave arquivos somente no filesystem local da
	aplicação, preferencialmente em `backend/storage`. Mantenha metadados em
	memória quando essa for a regra atual do projeto.
6. Gere nomes físicos seguros. Não derive caminhos diretamente de entradas do
	usuário e não exponha detalhes internos do filesystem nas respostas.
7. Trate erros nos limites do sistema e use códigos HTTP coerentes com os
	contratos existentes.
8. Adicione ou atualize testes focados no comportamento do recurso, sem
	remover testes existentes.

## Expectativas de implementação

- Use funções pequenas, nomes descritivos e módulos CommonJS.
- Preserve APIs públicas e convenções locais.
- Evite abstrações, dependências e arquivos de configuração desnecessários.
- Não use provedores externos de armazenamento, banco de dados ou serviços de
  upload.
- Não faça commits, resets, branches ou alterações destrutivas.

## Saída esperada

Entregue:

- Os arquivos da camada criados ou atualizados em `backend/src`.
- O roteador registrado no app quando necessário.
- Testes focados para os contratos implementados.
- Um resumo curto dos arquivos alterados, decisões e comandos de validação.

## Validação

Execute a validação mais específica disponível e depois a suíte backend:

1. Verifique que todos os módulos podem ser carregados sem erro de sintaxe.
2. Execute `npm test` dentro de `backend`.
3. Para endpoints HTTP, valide o caminho de sucesso, entrada inválida e
	acesso a recurso inexistente ou não autorizado, quando aplicável.
4. Pare e informe o erro se a validação falhar após uma tentativa de correção
	local. Não ignore falhas nem declare sucesso sem registrar o resultado.
