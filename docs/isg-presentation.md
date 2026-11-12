# Apresentação institucional ISG × Instituto

Experiência administrativa em `/isg/apresentacao`, com 20 slides, leitura vertical, biblioteca de aprofundamentos, console em janela separada e rascunho de até três compromissos. O console usa `/isg/apresentacao/console` e deve ser aberto pelo controle da apresentação.

## Execução para ensaio local

Requisitos: Node.js 22 ou superior e npm. O `package-lock.json` foi reconciliado com as dependências que já estavam declaradas. Os dois lockfiles Bun foram preservados. Não há alteração do instrumento nem do cálculo.

```bash
npm ci
read -rsp 'Credencial local de resultados: ' ISG_RESULTS_ADMIN_PASSWORD
export ISG_RESULTS_ADMIN_PASSWORD
read -rsp 'Credencial local diferente para a apresentação: ' ISG_RESULTS_IFT_PASSWORD
export ISG_RESULTS_IFT_PASSWORD
npm run dev:isg-presentation
```

Abra `http://127.0.0.1:8080/isg/apresentacao` e informe a credencial escolhida no terminal. O script executa o handler real da função `isg-results`, com sessões HMAC e vencimento, em loopback. Não grava nem imprime a credencial. O processo Vite recebe apenas uma chave pública fictícia e a URL local. Nenhuma URL ou chave de banco é disponibilizada ao handler local; consultar o agregado atual nesse modo retorna indisponibilidade.

Para a instalação já configurada com Supabase, use `npm run dev`. Preserve a secret atual `ISG_RESULTS_ADMIN_PASSWORD` para `/isg/resultados`. Configure `ISG_RESULTS_IFT_PASSWORD` com um valor novo, diferente da secret administrativa e de qualquer código de acesso já usado no frontend; nunca coloque nenhuma das credenciais no frontend, no repositório, no prompt ou em logs. O backend aceita `scope: "results"` e emite sessão assinada com papel `admin`, ou `scope: "presentation"` e emite papel `ift`. As sessões têm chaves separadas no navegador. A operação `validate-session` aceita somente o papel `ift`; a operação de agregados valida a assinatura pela secret correspondente ao papel. Se as duas secrets tiverem valores iguais, o login de apresentação é recusado. A função hospedada `isg-results` precisa ser atualizada com este código, e ambas as secrets devem estar configuradas, antes de publicar o frontend correspondente. A mudança não altera aplicação de respostas, instrumento ou cálculo dos escores.

## Fonte histórica e confidencialidade

Selecione **Carregar retrato documental → Selecionar arquivo histórico**. O JSON agregado deve obedecer ao contrato em `src/features/isg-presentation/data/presentation-schema.ts`. O arquivo histórico real preparado nesta sessão fica fora do checkout; sua localização foi entregue separadamente ao operador. Não copie o arquivo para o projeto, fixtures, documentação, `public/`, Git, issues ou CI.

O contrato separa `historical_report`, `current_aggregate` e `synthetic_demo`. Não há atualização automática do histórico, recálculo de escore ou certificação da origem do JSON. Estrutura validada não significa origem autenticada. Uma troca explícita substitui a fonte e limpa a pactuação. O agregado atual é congelado em memória e só é consultado por ação do operador.

As 32 questões e suas médias foram conferidas localmente contra o documento confidencial, sem incluir esses valores no código ou nos testes publicados. O painel já existente na raiz do repositório pertence a outro retrato e diverge do anexo usado nesta entrega. Nenhum desses documentos foi incorporado aos assets da apresentação. A imagem da capa é uma criação ilustrativa nova e não foi extraída do PDF; as marcas vieram das URLs institucionais públicas informadas.

Resultados, arquivos, rascunhos e notas permanecem em memória. Nenhum armazenamento de resultados foi adicionado. As sessões de resultados e apresentação usam chaves separadas no `sessionStorage`. Logout e expiração conhecida limpam apenas a sessão do perfil correspondente, revogam a URL local do PDF e avisam as outras janelas. O mecanismo HMAC existente não implementa revogação individual de tokens no servidor: o encerramento limpa o navegador e tokens emitidos vencem no prazo configurado. Não houve mudança de infraestrutura para adicionar revogação.

O PDF institucional pode ser selecionado pela biblioteca e visto em iframe com URL `blob:` local. A seleção não envia seu conteúdo ao servidor. O documento original e a impressão da apresentação são operações distintas.

## Operação da reunião

1. Confira fonte, data, status e condição de transcrição antes de projetar. Demonstração fica marcada como fictícia.
2. Use anterior/próximo ou o índice. No conteúdo do deck, setas e PageUp/PageDown navegam. Inputs e diálogos suspendem os atalhos; não há atalhos por letras ou avanço automático.
3. Abra o CTA de cada slide ou a biblioteca. Escape e os botões fecham o diálogo e restauram o foco ao acionador. A tabela de questões oferece busca por ID ou enunciado e rolagem por teclado quando necessária.
4. Alterne para leitura para consulta vertical; em telas estreitas esse é o modo inicial. A redução de movimento segue a preferência do sistema e tem controle explícito.
5. Abra o console pelo ícone de monitor. Cada janela confirma autorização no servidor. O canal transmite somente IDs de navegação, modo e tipo da fonte, com schema estrito; não transmite tokens, dados ou notas. O cronômetro é manual e o roteiro completo orienta uma reunião de 60 minutos. Compartilhe apenas a janela da apresentação. Pop-up bloqueado oferece notas locais visíveis naquela janela.
6. Nas fichas, leve uma frente ao quadro ou selecione diretamente até três frentes. Os campos começam vazios. Defina ação, responsável por função, prazo, recurso, primeira entrega, evidência e próxima devolutiva. Os prazos do ciclo de 90 dias começam na pactuação.
7. Revise o texto, marque a confirmação e baixe Markdown/JSON ou imprima. O texto é **rascunho de pactuação**; nada é enviado, agendado ou salvo em banco. Sair ou recarregar perde o rascunho. Alterações não exportadas acionam aviso de saída do navegador.

## Arquitetura e decisões

| Opção                     | Decisão            | Motivo                                                               |
| ------------------------- | ------------------ | -------------------------------------------------------------------- |
| Página longa              | Modo Leitura       | Consulta individual e móvel com o mesmo conteúdo.                    |
| Deck React                | Percurso principal | Integração com roteamento, autorização e componentes existentes.     |
| Outro framework de slides | Não acrescentado   | As interações solicitadas foram implementadas com o stack existente. |

As rotas são lazy e não entram na navegação pública ou sitemap. `robots.txt` e metatag indicam `noindex, nofollow`; a metatag e o título anteriores são restaurados ao sair. Esses metadados não são o controle de acesso. A barra lateral já excluía as rotas `/isg`, portanto não precisou ser alterada.

| Arquivo ou área                                | Responsabilidade                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/pages/IsgPresentation.tsx`, `src/App.tsx` | Entrada e rotas sob demanda.                                                                |
| `src/features/isg-presentation/data/`          | Schema, adaptação sem recálculo, demonstração fictícia, pactuação e mensagens do console.   |
| `src/features/isg-presentation/content/`       | 20 momentos editoriais, notas de fala, aprofundamentos e propostas.                         |
| `src/features/isg-presentation/components/`    | Slides, gráfico/tabela, biblioteca, impressão, console e quadro.                            |
| `src/features/isg-presentation/hooks/`         | Autorização, expiração, limpeza e metadados.                                                |
| `src/features/isg-presentation/styles/`        | Tema local, projeção, reflow, redução de movimento e impressão.                             |
| `supabase/functions/isg-results/`              | Validação de sessão sem leitura da base; respostas com `no-store`.                          |
| `src/lib/isgAggregate.ts`                      | Aviso de encerramento para todas as janelas; protocolo administrativo existente preservado. |
| `scripts/isg-presentation-preview.mjs`         | Ensaio local do handler real sem disponibilizar acesso ao banco.                            |
| `tests/isg-presentation.spec.ts`               | Fluxos de navegador com rede externa bloqueada e dados fictícios.                           |

## Validação e limites

```bash
npm test
npx tsc -p tsconfig.app.json --noEmit
npx eslint src/features/isg-presentation src/pages/IsgPresentation.tsx src/lib/isgAggregate.ts tests/isg-presentation.spec.ts playwright.config.ts
npx playwright install chromium
npx playwright test tests/isg-presentation.spec.ts
npm run build
```

Para usar Chromium já instalado, defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` no comando de Playwright. O arquivo anterior de configuração importava um pacote não declarado; foi substituído pela configuração da dependência oficial já declarada.

Resultados desta revisão:

- Base antes da apresentação: 53 testes aprovados; checagem de tipos e build aprovados; lint global com 64 erros e 16 avisos preexistentes.
- Após a implementação: 74 testes unitários aprovados; 13 fluxos Playwright aprovados; checagem de tipos, lint do código novo e build aprovados.
- Cinco verificações HTTP executadas contra o handler real local: senha incorreta recusada, emissão de sessão assinada, confirmação de acesso, token alterado recusado e indisponibilidade da base sem bindings. Nenhum token foi incluído nas evidências.
- O comando completo de ensaio foi iniciado e o histórico privado foi conferido no navegador com sessão assinada pelo handler real local. Global, médias e enunciados foram comparados sem screenshots ou logs dos valores, sem envio do arquivo e sem consulta à base. Recarregar descartou o retrato, mantendo apenas a sessão administrativa existente.
- Paridade do histórico verificada localmente para base, global, fatores, domínios, médias e enunciados, e validação Zod do arquivo privado. As pendências metodológicas continuam pendentes; paridade de transcrição não é homologação científica.
- Inspeção visual em 360×800, 390×844, 768×1024, 1024×768, 1366×768 e 1920×1080; reflow adicional a 320 CSS px e viewport equivalente a 200% em 1366 px. Não foi declarada verificação de zoom nativo em todos os navegadores.
- Axe em cenários de deck e diálogo de questões em desktop e mobile: nenhuma violação após correções. Teclado, foco, retorno ao acionador e pausa de atalhos exercitados também no navegador. Isso não constitui certificação WCAG.
- Impressão sintética conferida com texto selecionável, os 20 momentos, questões, metodologia, fontes e rascunho; notas do representante excluídas.
- Imagem maior da capa em WebP abaixo de 110 KB. A rota tem chunk próprio. O aviso de bundle principal grande já existia; não houve refatoração global. LCP/CLS de campo e INP não foram coletados nem declarados como atingidos.
- O lint global permanece com 64 erros preexistentes; a última execução registrou 15 avisos. Esses problemas não foram tratados por uma refatoração do produto inteiro.

As evidências em `docs/evidence/isg-presentation/` usam somente a demonstração fictícia. Relatórios de execução do Playwright ficam ignorados pelo Git. Backend hospedado, credencial real, versão efetiva da coleta e implantação não foram validados em produção; não houve consulta a respostas individuais ou à base de produção.

## Revisão por perspectivas

| Perspectiva    | Critério                                                            | Evidência                                                                                                 | Pendência                                                                                                         |
| -------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Método         | Separar observação, interpretação e proposta                        | Fonte discriminada, médias preservadas, ausência nula e pendências documentais carregadas com o histórico | Reconciliação de versão, precisão, denominadores e mapa de domínios pela equipe responsável.                      |
| Comunicação    | Uma pergunta e um limite por slide                                  | 20 momentos com fonte contextual e CTAs funcionais                                                        | Revisão institucional do discurso antes da reunião.                                                               |
| Aprendizagem   | Antecipação, explicação e retomada                                  | Pergunta de compreensão voluntária, roteiro e notas com 60–100 palavras                                   | Eficácia dessa adaptação não foi avaliada experimentalmente.                                                      |
| Design         | Identidade conjunta e composições distintas                         | Marcas oficiais locais, imagem ilustrativa, barras, pares de itens e linha do tempo                       | Aceite institucional dos ativos e ensaio no projetor real.                                                        |
| Acessibilidade | Operação por teclado, foco e reflow                                 | Playwright, inspeção visual e axe nos cenários descritos                                                  | Leitor de tela e parque completo de navegadores não auditados.                                                    |
| Engenharia     | Acesso confirmado no servidor, dados em memória e falhas explícitas | Testes de contrato, sessão, fluxos e handler real local                                                   | Implantar e testar a operação hospedada após autorização; manter as limitações de sessão existentes documentadas. |

## Ensaio do representante

Abra a fonte correta; confira data, status e condição de transcrição; teste teclado, índice, biblioteca e retorno dos diálogos; confirme o console e o compartilhamento apenas da projeção; mantenha som desativado (a experiência não reproduz áudio); verifique links, enquadramento no projetor, redução de movimento e encerramento. Faça uma pactuação fictícia e confira a exportação antes de trabalhar com acordos reais.
