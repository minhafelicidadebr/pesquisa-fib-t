# FIB-A · Turma do Bem

## Entrega

Módulo independente na rota `/turma-do-bem/fib-a`, com 29 perguntas para estudantes, revisão de respostas, resultado individual, demonstração sintética, PDF A4 de três páginas e QR Code SVG/PNG. Tema visual provisório próprio, sem ativos oficiais inventados ou identidade ISG.

## Decisão ToT e fontes

| Alternativa | Decisão e evidência |
| --- | --- |
| Alterar a matriz/rotas ISG existentes | Rejeitada. A FIB-T ocupacional tem 32 itens; seu fluxo possui autenticação, IA e persistência próprias. |
| Somar médias dos três fatores como sugerido no anexo | Substituída pela instrução posterior do solicitante: preservar o método computacional do app. |
| Novo instrumento FIB-A e novo endpoint com o cálculo do app | Implementada. Matriz separada, regra de cálculo preservada e compartilhamento do mesmo módulo puro entre web e servidor. |

Fonte dos textos: `FIB - Alunos - Formulario Inspirado no FIB-T - 2026 .md`, SHA-256 `4978e3992af3d8a4ea605f71637dc719150f0d68b66436376e1087f8b05cc637`. Os 29 textos foram conferidos integralmente com o anexo. O link privado NotebookLM e o PDF confidencial ISG não fazem parte da entrega.

FIB-A versão técnica `0.1.0`, motor `1.0.0`. A versão identifica a adaptação de software, sem afirmar validade psicométrica ou comparabilidade com a FIB-T ocupacional.

## Cálculo

- Respostas inteiras 0–4, sem pré-seleção ou itens invertidos; exatamente 29 IDs distintos e válidos.
- Nove domínios: médias de seus itens, com duas casas decimais.
- Três fatores: médias dos próprios itens; quantidades 9, 15 e 5, com duas casas.
- Global: média dos nove domínios já arredondados, normalizados por 4, multiplicada por 100 e arredondada para uma casa. Não é média dos 29 itens nem dos três fatores, soma de médias ou percentual de felicidade.
- Mesmo arredondamento e ordem de operações da FIB-T do app. Instrumento, textos e matriz têm identificação e hashes próprios no manifesto.

A matriz e as regras ficam em `supabase/functions/_shared/fiba.ts`. O cliente reexporta esse arquivo em `src/domain/fiba/index.ts`. Não há dois motores independentes a manter. O resultado real precisa ter manifesto server-side válido; a demonstração usa `client_preview` e identifica os dados sintéticos na tela, no nome do PDF e em todas as páginas.

## Dados e segurança

O frontend mantém respostas e resultado em memória da sessão. Não coleta identificadores, não usa armazenamento persistente e não envia sessão de usuário no pedido de cálculo. PDF e QR são gerados no dispositivo, sem serviços terceiros de geração. As fontes Liberation distribuídas sob SIL OFL são locais e incorporadas no PDF; licença incluída junto dos arquivos.

A nova função `fiba-student-score` não usa banco, service role, autenticação ISG/IFT, IA, chamadas externas ou logs de payload. Valida origem de navegador, método, JSON, instrumento, versão, campos permitidos e tamanho máximo de 8 KiB. Respostas têm `Cache-Control: no-store`.

O endpoint é público por finalidade: calcula respostas de um formulário acessível sem login e não concede acesso a dados armazenados. `verify_jwt = false` aplica-se somente a essa função nova. CORS não é autenticação. A contenção de rajadas é por instância, sem armazenar IP ou identificadores; não constitui um limite distribuído e deve ser monitorada no dimensionamento do evento. A infraestrutura pode manter registros operacionais de acesso; a interface não promete anonimato absoluto.

## Publicação no Lovable

O desenvolvimento partiu da `main` remota `337c801`, na branch `feat/turma-do-bem-fiba`. A autorização do solicitante inclui atualizar o GitHub; ele fará a publicação em sua própria conta Lovable. O projeto histórico `d9387b69-66a4-423a-814e-9744580de58e` retornou 404 no conector desta sessão, e o projeto Supabase do app não está entre os projetos acessíveis pelo conector Supabase desta sessão. Por isso, publicar o frontend e implantar a função não são operações verificadas aqui.

Depois de sincronizar a `main`:

1. Implantar **somente a função nova `fiba-student-score`**, incluindo seus imports `_shared/fiba.ts` e `_shared/fiba-handler.ts`, com `verify_jwt = false` conforme `supabase/config.toml`. A função não requer nova senha ou secret para funcionar no domínio principal.
2. Os padrões de CORS incluem `https://pesquisadefelicidade.com.br` e `https://www.pesquisadefelicidade.com.br`. Para outro domínio/preview, configurar `FIBA_ALLOWED_ORIGINS` com a lista completa de origens autorizadas separadas por vírgula; a variável substitui os padrões. Não usar wildcard.
3. Publicar a versão atual do frontend. Uma publicação somente do frontend não comprova que a função foi implantada.
4. Abrir `/turma-do-bem/fib-a`, conferir a demonstração e fazer uma submissão sintética completa antes do evento. Conferir PDF, valores e recuperação de erro. Não usar respostas de participantes nessa revisão.
5. No domínio publicado, usar “Compartilhar acesso” para baixar QR definitivo. O QR usa a origem atual; arquivos gerados em localhost/preview são apenas de revisão.

Texto breve para o chat Lovable, se a implantação da função não ocorrer pela sincronização:

> Sincronize a main do GitHub minhafelicidadebr/pesquisa-fib-t. O módulo Turma do Bem já está implementado em /turma-do-bem/fib-a. Implante apenas a nova Edge Function fiba-student-score com seus imports _shared/fiba.ts e _shared/fiba-handler.ts e verify_jwt=false, conforme o repositório. Não regenere o código, não altere ISG/IFT, tabelas ou secrets. Confira uma submissão sintética com todos os 29 valores iguais a 2: global 50,0 e fatores/domínios 2,00. Depois publique a versão atual.

Antes da divulgação pública, confirmar os ativos oficiais e as informações institucionais do aviso de participação/privacidade, o público/faixa etária e a referência à instituição de ensino. O design atual não se apresenta como identidade visual oficial da Turma do Bem. Não há painel ou armazenamento agregado do evento nesta entrega.

## Verificações locais

- TypeScript e ESLint dos arquivos novos passaram.
- 73 testes de domínio e regressão: FIB-A, motor/paridade FIB-T e piloto ISG passaram. O conjunto FIB-A tem 21 testes e foi repetido após os ajustes finais de validação.
- Sete testes Playwright/Chromium passaram: larguras 320/360/390/768/1366 px, ausência de resposta pré-selecionada, valor zero válido, erro de pergunta incompleta, fluxo com 29 respostas, edição, recuperação de falha, resultado, PDF, encerramento, demonstração e QR. A integração do navegador usa resposta de servidor simulada; o handler foi exercitado diretamente com Request/Response em testes locais.
- Os dois testes de download foram repetidos após incorporar as fontes ao PDF e passaram.
- PDF conferido por extração de texto e renderização: três páginas A4, fontes incorporadas, acentos corretos, valores coerentes com a tela e sem ativos ISG. Artefatos de teste têm dados sintéticos e ficam fora do Git.
- Safari/iOS, dispositivos físicos, leitura do QR por câmera e função em produção ainda precisam de verificação no ambiente de publicação. Não foram acessadas respostas reais.
