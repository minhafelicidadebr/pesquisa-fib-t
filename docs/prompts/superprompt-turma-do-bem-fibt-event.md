# Superprompt de desenvolvimento — FIB-A no evento Turma do Bem

> Versão revisada em 16/11/2026, incluindo avanço automático e correção da geração do resultado. Este prompt substitui a versão anterior deste arquivo.
> Diretriz do solicitante: usar as 29 perguntas do formulário de alunos e preservar o método de cálculo e as escalas da FIB-T implementada no app. A fórmula global sugerida no anexo é substituída por essa diretriz explícita.

## 1. Missão e escopo

Atue como profissional sênior de produto, UX, acessibilidade, pesquisa aplicada e engenharia React/TypeScript/Supabase. Desenvolva, no repositório `minhafelicidadebr/pesquisa-fib-t`, um módulo próprio para estudantes de Odontologia participantes de um evento do projeto Turma do Bem.

Entregue este fluxo: QR Code → apresentação da pesquisa → informações de participação → questionário de 29 itens → revisão → conclusão → resultado individual → PDF para baixar ou compartilhar no celular.

O instrumento desta aplicação é identificado como **FIB-A — Felicidade Interna Bruta do Aluno**, adaptado e inspirado na FIB-T. Preserve as perguntas do anexo e aplique o método computacional da FIB-T do app, com versão própria para essa combinação. Não identifique esta versão como a FIB-T ocupacional original nem declare equivalência psicométrica entre as versões.

Trabalhe com autonomia no desenvolvimento, prepare uma implementação concreta e verificável e apresente as pendências de publicação ao final. A escolha de preservar o cálculo do app foi expressamente autorizada pelo solicitante: não peça confirmação novamente para essa escolha. Não condicione o desenvolvimento inteiro à validação do instrumento ocupacional; o formulário de alunos é a fonte autorizada das perguntas desta adaptação.

## 2. Fontes, precedência e fatos verificados

### Fonte das perguntas

Documento lido integralmente: `FIB - Alunos - Formulario Inspirado no FIB-T - 2026 .md`.

SHA-256 dos bytes do anexo recebido: `4978e3992af3d8a4ea605f71637dc719150f0d68b66436376e1087f8b05cc637`.

Esse hash identifica o arquivo de origem; não é o hash da matriz nem comprovação de validação científica. O link NotebookLM presente no anexo não foi consultado e não constitui, por si só, referência científica verificada. Não publique esse link no formulário ou PDF.

### Precedência

1. Instrução explícita do solicitante: preservar o método e as escalas da FIB-T do app, adaptados aos itens do anexo.
2. Anexo: fonte dos 29 textos, resposta Likert, associação item–domínio–fator e nomes dos fatores.
3. Código vigente: evidência da fórmula, validação, arredondamento e rastreabilidade computacionais da FIB-T.
4. Este prompt: decisões de engenharia, UX, layout e critérios de aceite para aplicar as fontes anteriores.

O anexo sugere um escore bruto pela soma das médias dos fatores. **Essa regra global não será implementada.** A instrução posterior do solicitante determina resultado global de 0 a 100 pela média dos nove domínios normalizados, conforme o app. Registre a diferença na documentação técnica, sem atribuir ao anexo uma fórmula que ele não contém.

### Estado observado do repositório — conferir novamente antes de editar

A inspeção local ocorreu no commit `74e9728`, branch `fix/separate-ift-presentation-credential-20261112`. Isso não comprova o estado atual da `main` remota ou da produção. Não desenvolva a partir dessa branch antiga sem antes conferir a base remota e preservar o trabalho existente.

| Evidência local | Implicação para a implementação |
| --- | --- |
| App Vite, React 18, TypeScript, React Router e Tailwind; rotas em `src/App.tsx` | Acrescentar módulo de rota com carregamento sob demanda e estilos próprios. |
| `src/domain/fibt/instrument.ts` contém FIB-T 1.1.0, 32 itens e matriz própria | Não substituir seus itens pelos 29 do anexo. Criar instrumento FIB-A separado. |
| `src/domain/fibt/scoring-engine.ts`, `validators.ts` e `manifest.ts` | Preservar as regras de cálculo e rastreabilidade, aplicadas à nova matriz de 29 itens. |
| Espelho de cálculo em `supabase/functions/_shared/fibt-engine.ts` | Evitar divergência entre cálculo web e servidor; não alterar o comportamento FIB-T existente. |
| `src/lib/isgResult.ts` chama `fibia-chat` com `cohort: "isg"` | Não reutilizar esse envio para estudantes. |
| `supabase/functions/fibia-chat/index.ts` inclui IA e persistência ISG | Criar endpoint específico, sem IA e sem persistência de respostas por padrão. |
| `src/lib/isgPdf.ts` e `isgPdfKit.ts` importam configuração e identidade ISG | Usar a organização informativa como referência, com implementação visual própria e sem imports de marca ISG. |
| `jspdf` e `qrcode` já constam em `package.json` | Avaliar as dependências instaladas antes de adicionar bibliotecas. |

Confira o estado real do código; se houver mudanças desde a inspeção, informe o conflito e atualize o plano com evidência. Não invente fatos sobre produção, deploy ou banco.

## 3. Decisão ToT — árvore de alternativas

Compare as opções por fidelidade das perguntas, fidelidade do cálculo, isolamento dos dados, risco de regressão e esforço de manutenção. Entregue uma tabela curta com evidências e decisão, sem expor raciocínio interno passo a passo.

| Alternativa | Decisão orientadora |
| --- | --- |
| Trocar perguntas e marca diretamente nos arquivos ISG/FIB-T | Rejeitar: mistura instrumentos e ameaça fluxos já existentes. |
| Implementar literalmente a soma das três médias indicada no anexo | Rejeitar: conflita com a orientação expressa de manter a metodologia computacional do app. |
| Criar módulo FIB-A próprio com a matriz do anexo e a mesma regra de cálculo da FIB-T do app | Adotar: preserva as perguntas, as escalas e o método computacional solicitado, com rastreabilidade e isolamento. |

Priorize um módulo independente no mesmo app, com cálculo individual no dispositivo pelo módulo puro compartilhado. O endpoint de cálculo é opcional e não deve bloquear o relatório individual. Um domínio ou projeto Supabase separado é outra decisão de infraestrutura; não crie nem migre infraestrutura sem necessidade e autorização.

## 4. Instrumento canônico FIB-A — 29 itens

Crie uma única fonte da verdade para texto, id, domínio, fator, escala e versão. Não distribua cópias da matriz por componentes, PDF e funções. Não altere redação, ordem, referência temporal ou sentido dos itens. A remoção dos escapes de Markdown é apenas normalização de formato.

### Escala de resposta

Uma resposta por item. Valores inteiros, sem inversão de itens:

| Valor | Rótulo |
| --- | --- |
| 0 | Discordo totalmente |
| 1 | Discordo parcialmente |
| 2 | Não concordo e nem discordo (Neutro) |
| 3 | Concordo parcialmente |
| 4 | Concordo totalmente |

Não pré-selecione o valor 2. O valor 0 é uma resposta válida e nunca deve ser tratado como ausência. O item 14 já expressa uma condição favorável; a palavra “não” não autoriza inverter sua pontuação.

### Fator 1 — Padrão de Vida, Educação e Cultura

| ID | Domínio | Texto exato |
| --- | --- | --- |
| 1 | Padrão de Vida | Minha situação atual (ou familiar) me permite ter uma vida com dignidade. |
| 2 | Padrão de Vida | Consigo realizar projetos de longo prazo que envolvem algum investimento (como curso, viagem ou aquisição de um bem). |
| 3 | Padrão de Vida | Nos últimos 12 meses fiz ao menos uma viagem de lazer. |
| 4 | Educação | Nos últimos 12 meses experimentei realização pessoal (nos estudos ou vida). |
| 5 | Educação | Nos últimos 12 meses estive engajado em algum tipo de treinamento formal (como a própria escola, cursos técnicos, idiomas, etc.). |
| 6 | Educação | Me sinto incentivado(a) a aprender e aplicar novos conhecimentos na escola. |
| 7 | Cultura | Nos últimos 12 meses adquiri e/ou li livros (não obrigatórios pela escola). |
| 8 | Cultura | Nos últimos 12 meses assisti a filmes e/ou documentários (culturais, educativos). |
| 9 | Cultura | Nos últimos 12 meses fui a exposições de arte ou eventos culturais. |

### Fator 2 — Bem-Estar

| ID | Domínio | Texto exato |
| --- | --- | --- |
| 10 | Bem-Estar Psicológico | Sinto que minha vida (ou meus estudos) tem propósito e valor. |
| 11 | Bem-Estar Psicológico | Em minha rotina atual, experimento mais emoções positivas que negativas. |
| 12 | Bem-Estar Psicológico | Considero-me uma pessoa feliz. |
| 13 | Bem-Estar Psicológico | Estou satisfeito com minha saúde emocional. |
| 14 | Bem-Estar Psicológico | O estresse (escolar, social) não compromete meu bem-estar. |
| 15 | Saúde | Em geral, minhas horas de sono são suficientes para meu repouso. |
| 16 | Saúde | Realizo exercícios físicos regularmente. |
| 17 | Saúde | Meu peso é considerado saudável. |
| 18 | Uso do Tempo | Consigo administrar meu tempo, mantendo uma rotina equilibrada entre estudos e lazer. |
| 19 | Uso do Tempo | Tenho tempo suficiente para descansar e me recuperar. |
| 20 | Vitalidade Comunitária | Considero que tenho uma rede de apoio social e afetivo caso enfrente um problema. |
| 21 | Vitalidade Comunitária | Minha rotina prevê tempo para estar com os amigos. |
| 22 | Vitalidade Comunitária | Me sinto parte integrante da equipe/turma em que estudo. |
| 23 | Meio Ambiente | Tenho práticas diárias de responsabilidade ambiental, como uso racional de água e energia e separação do lixo. |
| 24 | Meio Ambiente | Sinto-me engajado(a) em iniciativas de responsabilidade socioambiental. |

### Fator 3 — Governança (Satisfação com a Escola)

| ID | Domínio | Texto exato |
| --- | --- | --- |
| 25 | Governança | Confio nos gestores/diretores da escola. |
| 26 | Governança | A escola valoriza a conduta ética dos alunos e professores. |
| 27 | Governança | Tenho direito de liberdade de expressão e opinião na escola. |
| 28 | Governança | Considero a comunicação interna da escola (entre alunos e coordenação) eficaz. |
| 29 | Governança | Acredito que as decisões da escola são tomadas com ética e transparência. |

### Mapa obrigatório

| Domínio | IDs | Quantidade | Fator |
| --- | --- | --- | --- |
| Padrão de Vida | 1–3 | 3 | 1 |
| Educação | 4–6 | 3 | 1 |
| Cultura | 7–9 | 3 | 1 |
| Bem-Estar Psicológico | 10–14 | 5 | 2 |
| Saúde | 15–17 | 3 | 2 |
| Uso do Tempo | 18–19 | 2 | 2 |
| Vitalidade Comunitária | 20–22 | 3 | 2 |
| Meio Ambiente | 23–24 | 2 | 2 |
| Governança | 25–29 | 5 | 3 |

Total: **29 itens, nove domínios, três fatores; contagens por fator: 9, 15 e 5**. Os números dos itens não têm o mesmo significado dos IDs FIB-T originais; nunca reaproveite o mapa ocupacional para estas respostas.

Os itens sobre escola ou instituição de ensino se referem à instituição onde o aluno estuda. Não substitua “escola” por “Turma do Bem”, pelo evento, pelo projeto social ou por uma clínica. Antes da publicação, confirme a instrução de referência adequada para participantes de instituições diferentes, sem acrescentar coleta do nome da instituição.

## 5. Método computacional — preservar o que o app faz

Implemente o mesmo procedimento de `src/domain/fibt/scoring-engine.ts`, aplicado à matriz FIB-A desta seção. Essa decisão preserva o método computacional, sem afirmar que os instrumentos têm validação ou resultados diretamente comparáveis.

Seja `x_i` a resposta inteira entre 0 e 4:

1. **Domínio:** média aritmética dos itens daquele domínio, arredondada para duas casas decimais.
2. **Fator:** média aritmética de todos os itens daquele fator, arredondada para duas casas decimais. Use os denominadores 9, 15 e 5. Não calcule um fator pela média das médias dos domínios: eles têm quantidades diferentes de itens.
3. **Global:** média não ponderada dos nove escores de domínio já arredondados, divididos por 4, multiplicada por 100; arredondar para uma casa decimal.

```text
D_d = round2(soma das respostas do domínio d / quantidade de itens do domínio d)
F_f = round2(soma das respostas do fator f / quantidade de itens do fator f)
G   = round1((1 / 9) × soma_d(D_d / 4) × 100)
```

Preserve a política de arredondamento do app (`Math.round((value + Number.EPSILON) * 10**decimals) / 10**decimals`) e a ordem de operações existente. Não remova silenciosamente o arredondamento dos domínios antes do cálculo global; essa mudança alteraria a regra implementada.

Escalas: domínio **0–4**, fator **0–4**, global **0–100**. Os nove domínios têm o mesmo peso no global, apesar das quantidades de itens diferentes. Não use a média dos 29 itens, a média dos três fatores, a soma dos fatores ou a média de resultados individuais como substituta dessa fórmula.

Exiba o global como “Resultado global: 67,7 de 100”, quando esse for o valor calculado. Esse número é apenas exemplo de formatação, nunca resultado real ou padrão. Não chame o global de “percentual de felicidade” nem use o símbolo `%` como unidade do resultado.

### Validação e rastreabilidade

- Exigir exatamente os 29 IDs, cada um uma única vez, com números inteiros finitos de 0 a 4. Rejeitar ausência, duplicidade, IDs desconhecidos, texto, booleanos, `null`, `NaN` ou valores fora da escala; não converter texto em resposta numérica silenciosamente.
- Não imputar respostas, calcular instrumento parcial, transformar ausência em zero ou aceitar os itens 30–32. Identificar na interface o que precisa ser corrigido; permitir desistência sem resultado.
- Validar instrumento, versão, matriz e todas as respostas no motor puro compartilhado antes do cálculo local. Não enviar respostas a um serviço de cálculo na jornada individual. Se existir fluxo de servidor separado, ele valida seus próprios inputs e não confia em escores enviados pelo cliente.
- Criar identidade de instrumento própria `FIB-A` e versão própria, explicitamente de adaptação. Uma versão técnica inicial, como `0.1.0`, é controle de software e não validação científica.
- Registrar no manifesto: instrumento, versão do instrumento, versão do cálculo, hash da matriz FIB-A, hash do conteúdo dos itens, escala, quantidade de itens, política de arredondamento, política de ausência e origem do cálculo (`client_local`, `server` ou `client_preview`). Resultado real calculado no dispositivo usa `client_local`; demonstração sintética usa somente `client_preview`.
- Usar hashes calculados e conferidos; não copiar o hash ou a versão da matriz FIB-T. O hash da fonte anexada é metadado adicional, separado do hash da matriz.
- UI e PDF consomem o mesmo objeto de resultado validado, sem recálculo nos componentes ou no gerador de PDF. Informar a origem local quando o cálculo for realizado no dispositivo. Não apresentar resultado local ou prévia como confirmado pelo servidor; não usar demonstração sintética como relatório de participante.

## 6. Arquitetura e isolamento

Antes de editar, leia as instruções do repositório, confira `git status`, branch, commit, base da `main`, rotas, instrumentos, funções, estilos e mecanismos globais de navegação/analytics. Preserve trabalho preexistente e apresente um resumo da arquitetura, branch e plano.

Estrutura sugerida, ajustável ao código vigente:

```text
src/domain/fiba/                    # instrumento, mapa, validação, cálculo e manifesto
src/features/turma-do-bem/          # páginas, etapas, componentes e tema próprios
src/lib/fibaResult.ts               # contrato e envio específicos
src/lib/fibaPdf.ts                  # composição editorial própria
supabase/functions/fiba-student-score/  # endpoint opcional; o relatório individual não depende dele
```

Prefira uma fonte compartilhável da matriz e das regras entre web/servidor. Se as limitações do runtime exigirem espelho, faça verificação automatizada de paridade de perguntas, mapa, validação, arredondamento e resultado. Não importe módulos React ou browser para a função de cálculo pura. Não refatore o motor FIB-T existente apenas para compartilhar código; reutilize somente primitivas neutras cuja extração preserve o comportamento comprovado.

Proponha a rota **`/turma-do-bem/fib-a`**, conferindo colisões e autorização do domínio antes de publicação. Carregue o módulo e o PDF sob demanda. Não renomeie nem redirecione rotas ISG e não gere links do evento dentro dos painéis ISG.

A experiência de evento deve ter seu próprio layout, sem barra do SaaS, menus de administração ou identidade da empresa ISG. Limite a alteração do roteador ao necessário para incluir a nova rota. Não use CSS global que afete as páginas existentes.

Por padrão, o próprio dispositivo valida e calcula o relatório individual pelo módulo puro compartilhado, sem envio de respostas. O endpoint opcional apenas valida, calcula e devolve resultados para usos de servidor que venham a ser necessários. Não crie tabelas, cadastro, login de aluno, painel de organizador ou agregados sem escopo explícito. Não use `isg_pilot_responses`, `fibia-chat`, `isg-results`, coorte `isg`, credenciais ISG ou IFT para essa experiência. Não leia respostas ou agregados reais para desenvolver ou verificar.

Antes de implementar ou configurar recursos Supabase, confira a documentação atual e as instruções aplicáveis. Preserve os controles existentes; não exponha chaves secretas no cliente nem desative proteções de outras funções para viabilizar o endpoint. Documente a proteção adotada para um endpoint de evento acessível por QR, incluindo validação de payload, limite de tamanho, tratamento de abuso e CORS apropriado ao ambiente. Não invente dependências de infraestrutura ausentes.

## 7. UX do estudante — mobile como prioridade

### Jornada

1. **Entrada:** identificação textual “Turma do Bem · FIB-A”, propósito, quantidade real de 29 perguntas, privacidade e CTA claro. Não prometa tempo de conclusão sem evidência; se estimar, identifique como estimativa a validar.
2. **Participação:** informar finalidade, voluntariedade, tratamento de dados e opção de sair. Evitar promessa de anonimato absoluto sem conferir infraestrutura e logs. Participação não interfere em nota, benefício ou tratamento.
3. **Resposta:** uma pergunta por tela em celular, mantendo a sequência 1–29 e contexto do fator/domínio. Mostrar “Pergunta X de 29”, cinco opções completas e “Voltar”, sem exigir CTA “Continuar”. Avançar automaticamente após toque/clique em uma alternativa, com breve feedback visual; manter “Voltar”, revisão final e confirmação explícita da conclusão. No teclado, preservar as setas para escolher e usar Enter/espaço para confirmar. Não usar cores para induzir respostas.
4. **Revisão:** resumo das respostas e link para editar cada item, preservando o estado em memória. Exibir pendências e confirmar a conclusão.
5. **Processamento:** uma única requisição ativa, botão protegido contra duplo clique, mensagem acessível e recuperação de erro com respostas preservadas na memória da página.
6. **Resultado:** global de 0 a 100, três fatores e nove domínios de 0 a 4, metodologia e limitações, ações “Baixar meu PDF”, “Compartilhar PDF” quando disponível e “Encerrar”.
7. **Encerramento:** limpar o estado da pesquisa. Informar antes de ações que apagam o progresso. Atualizar ou fechar a página pode perder respostas; não prometer retomada posterior sem implementar e justificar armazenamento seguro.

### Design e acessibilidade

Crie composição editorial acolhedora, adequada a estudantes de Odontologia, com tipografia legível, bom uso de espaço, contraste, microinterações discretas e identidade original. Interprete “premium” como qualidade de composição, clareza e consistência, sem adicionar gamificação ou rótulos que influenciem respostas.

Use cores próprias provisórias e identificação textual até existirem ativos oficiais autorizados. Não invente um logotipo da Turma do Bem, parceria, patrocínio, slogan, contato, nome ou data do evento. Não reutilize logo, paleta, rodapés, cidade ou contato ISG.

Aplique WCAG 2.2 AA: navegação por teclado, `fieldset`/`legend` e radios associados aos rótulos, foco visível, foco no título ao mudar de etapa, mensagens de status/erro anunciadas, contraste conferido, zoom de 200% e alvos de toque de pelo menos 44 × 44 CSS px. Evite controles bloqueados pelo teclado virtual, barras fixas ou recortes; respeite áreas seguras do celular e `prefers-reduced-motion`.

Confira 320, 360, 390, 768 px e desktop, sem rolagem horizontal. Use as cinco respostas sempre acessíveis no celular, com rótulos completos; não dependa apenas dos números ou de uma legenda distante.

## 8. Resultado e limites da interpretação

Use linguagem de autopercepção e reflexão sobre a vida estudantil. Diferencie valores calculados, explicações do método e sugestões gerais. Para os fatores e domínios, mostre valores, escala e composição de itens sem inventar faixas normativas.

Não crie cortes “baixo/médio/alto”, classificação de felicidade, percentis, radar comparativo com ISG, diagnóstico clínico, escore PERMA, índice de saúde bucal ou afirmações de impacto da Turma do Bem. A menção ao PERMA no anexo não fornece instrumento, fórmula ou evidência para calculá-lo.

Se houver destaque de maiores e menores escores, descreva-o apenas como comparação entre respostas da própria pessoa, com critério de desempate documentado e sem chamar menor escore de doença, risco ou vulnerabilidade comprovada. A opção mais simples é apresentar os nove domínios em ordem fixa, sem ranking.

Os itens não estabelecem relação causal com o evento nem autorizam avaliar a organização Turma do Bem. Governança refere-se à escola/instituição de ensino; o item sobre peso registra autopercepção, não medida clínica. Não gere aconselhamento médico ou recomendações individualizadas por IA.

Nota metodológica sugerida, sujeita apenas à revisão de linguagem:

> “Este resultado usa as 29 perguntas do formulário FIB-A para alunos, inspirado na FIB-T, com a regra de cálculo da FIB-T implementada no aplicativo: médias dos domínios e fatores de 0 a 4 e resultado global pela média dos nove domínios normalizados, de 0 a 100. A adaptação é uma leitura descritiva das suas respostas. Não constitui diagnóstico clínico nem comprova equivalência psicométrica com a versão ocupacional da FIB-T.”

O anexo traz referência genérica à estrutura FIB, sem bibliografia suficiente para sustentar validação específica. Não invente autores, DOI, estudo, chancela, certificação ou direitos. Mantenha a identificação honesta da fonte e registre referências verificadas somente quando disponíveis.

## 9. PDF individual — qualidade editorial e uso em celular

Use a organização informativa do PDF individual atual como referência, desenvolvendo uma composição própria FIB-A/Turma do Bem. Não copie as conclusões, narrativas de IA, escalas, marca ou referências da ISG. Não recalcule resultados no PDF.

Planeje quatro páginas A4 conforme a atualização institucional autorizada em `superprompt-fiba-pdf-identidade-ift.md`, preservando a legibilidade:

| Página | Conteúdo |
| --- | --- |
| 1 — Visão individual | Identificação FIB-A/Turma do Bem, data real da conclusão, global de 0 a 100, explicação breve do caráter descritivo e indicador de demonstração quando aplicável. |
| 2 — Fatores e domínios | Três fatores de 0 a 4 com contagens 9/15/5, nove domínios de 0 a 4 com rótulos completos e escala clara; gráficos vetoriais simples acompanhados de valores em texto. |
| 3 — Como ler | Fórmula resumida, identificação da adaptação e versão, fonte, limitações e perguntas gerais para reflexão sem recomendações clínicas ou conclusões causais. |
| 4 — Continue essa jornada | Identidade Instituto Felicidade para Todos, missão, convite ao estudante, site, contato, endereço, Instagram e logo/link contextual Turma do Bem fornecidos pelo solicitante. |

Não inclua respostas item a item ou dados pessoais no PDF por padrão. Nenhuma página deve atribuir o resultado ao projeto odontológico como medida de sua eficácia. Não acrescente contatos ou identidade institucional que não estejam confirmados.

Requisitos técnicos:

- PDF com texto selecionável e pesquisável, gráficos vetoriais, caracteres portugueses corretos e fontes locais incorporadas quando necessário e permitido pela licença.
- Hierarquia editorial consistente, margens, contraste, rodapé e numeração; sem cortes, sobreposição, textos minúsculos ou página vazia. Não faça uma captura única da página HTML como relatório.
- Usar o mesmo objeto canônico exibido na tela e a mesma formatação numérica `pt-BR`: uma casa no global, duas nos fatores/domínios. O PDF não contém motor de pontuação.
- Gerar no dispositivo após receber o resultado; não enviar ou armazenar o relatório em serviços externos. Evitar que geração ou download disparem nova conclusão ou nova coleta.
- Download com nome `relatorio-fib-a-turma-do-bem.pdf`. No modo sintético, usar `demonstracao-fib-a-turma-do-bem.pdf` e marcação visível em todas as páginas.
- Usar Web Share API com arquivo somente quando suportada (`navigator.canShare`); oferecer download/abertura quando não suportada. Cancelar compartilhamento não é falha da pesquisa.
- Conferir abertura, acentos, quebras de página e valores em Android e Safari/iOS quando esses ambientes estiverem disponíveis; informar quais não foram verificados. Não alegar compatibilidade testada sem executá-la.

O resultado HTML deve ser responsivo. O PDF terá paginação fixa e deve ser confortável em leitores móveis, sem ser descrito como um documento responsivo ou acessível certificado sem verificação específica.

## 10. QR Code e distribuição

Prepare o gerador com a rota própria usando a biblioteca existente, sem serviços externos de QR ou encurtadores. Configure a URL por ambiente; não fixe domínio de prévia como produção. O QR leva à entrada da pesquisa, sem respostas, nome, credenciais, token pessoal ou pontuação na URL.

Forneça SVG e PNG de boa resolução, fundo de alto contraste, margem livre adequada e URL legível como alternativa. QR Code é atalho de acesso e pode ser redistribuído; não o trate como autenticação ou prova de presença no evento.

Na revisão, use apenas QR de prévia claramente identificado. Só entregue peça de divulgação definitiva após a URL HTTPS e a publicação estarem confirmadas. Confira leitura e navegação direta, inclusive carregamento da rota após atualização da página, nos ambientes disponíveis.

## 11. Dados e participação

Por padrão, mantenha respostas e resultado apenas na memória necessária à sessão e ao PDF baixado pelo próprio participante. Não use `localStorage`, URL, analytics ou logs para armazenar respostas. Não solicite identificação, login ou cadastro.

O dispositivo processa as respostas sem transmiti-las ou gravar respostas/pontuações em banco. Avalie também integrações globais do app para impedir exposição por captura de erros, logs, cache persistente, replay de sessão ou ferramentas de analytics. Evite cache de respostas do endpoint. Não registre corpo de requisição em erros e não envie respostas ou resultados a IA.

Informe a diferença entre não coletar identificadores no formulário e os registros operacionais que a infraestrutura pode manter. Não prometa anonimato absoluto ou ausência total de logs sem evidência. Configure minimização e retenção coerentes com o aviso de privacidade.

Antes da publicação real, confirme finalidade, responsável, contato e aviso de participação/privacidade. Confirme faixa etária do evento; se houver menores, ajuste as salvaguardas aplicáveis antes da coleta. Essas pendências não impedem desenvolver, revisar e testar com dados sintéticos.

Painel coletivo, armazenamento ou relatório agregado do evento não fazem parte do escopo padrão. Se forem solicitados, especifique separadamente finalidade, acesso, retenção e limiar de privacidade. Não copie o limiar `k=7` da ISG nem crie consulta às respostas individuais.

## 12. Implementação, verificação e entrega

### Ordem de execução

1. Confira estado do repositório e instruções; apresente arquitetura, branch, plano e decisão ToT antes de editar. Use uma branch de trabalho baseada na `main` vigente quando disponível, preservando alterações locais.
2. Implemente a matriz FIB-A e os contratos próprios; confira fidelidade dos 29 textos e mapeamentos. Registre a substituição autorizada da fórmula global do anexo pelo método do app.
3. Implemente o cálculo local pelo módulo puro compartilhado, com manifesto `client_local` e validação completa, sem depender de endpoint externo. Preserve qualquer endpoint opcional separado e as credenciais/dados ISG. Inclua uma demonstração com dados sintéticos e identificada como tal; não preencha respostas sintéticas no formulário real.
4. Desenvolva o fluxo mobile, revisão, estados de erro, encerramento e resultado.
5. Implemente o PDF e o QR de prévia. Faça revisão visual com cenários sintéticos.
6. Execute verificações proporcionais, build, validação de tipos e testes relevantes. Corrija os problemas introduzidos e diferencie falhas preexistentes. Não use produção ou participantes reais como massa de teste.
7. Entregue arquivos, capturas/artefatos sintéticos, resultados das verificações e pendências reais. Não declare deploy, sincronização com Lovable, merge ou publicação sem evidência e autorização correspondentes.

### Casos mínimos de cálculo

| Entrada sintética | Resultado esperado |
| --- | --- |
| Todos os 29 valores = 0 | Nove domínios e três fatores = 0,00; global = 0,0. |
| Todos = 2 | Nove domínios e três fatores = 2,00; global = 50,0. |
| Todos = 4 | Nove domínios e três fatores = 4,00; global = 100,0. |
| Itens 1–9 = 4; itens 10–29 = 0 | F1 = 4,00; F2 e F3 = 0,00; global = 33,3, pois três dos nove domínios estão no máximo. |
| Apenas item 10 = 4; todos os demais = 0 | Bem-Estar Psicológico = 0,80; F2 = 0,27; global = 2,2. |
| Apenas item 1 = 4; todos os demais = 0 | Padrão de Vida = 1,33; F1 = 0,44; global = 3,7. |
| Item ausente, duplicado, desconhecido ou inválido | Rejeição sem resultado parcial; mensagem recuperável e sem dados sensíveis no log. |

Acrescente caso de fronteira de arredondamento e paridade web/servidor quando houver duas implementações. Confira que a tela e o PDF usam os mesmos números e que o relatório sintético nunca se confunde com resultado de participante.

### Critérios de aceite

- Instrumento FIB-A com os 29 textos exatos, nove domínios e três fatores, mapeamento fiel ao anexo e escala Likert 0–4 sem respostas pré-selecionadas.
- Método do app preservado: domínio e fator 0–4; global 0–100 pela média dos nove domínios normalizados, com o mesmo arredondamento e validação completa.
- Fonte e método identificados corretamente; nenhuma soma global 0–12, faixa normativa, validação psicométrica ou inferência causal inventada.
- Jornada completa utilizável por celular e teclado; conclusão única, revisão, erro recuperável e descarte do estado ao encerrar.
- UI e PDF coerentes, PDF legível e com texto selecionável; download e alternativa ao compartilhamento disponíveis.
- Identidade própria e isolamento de rotas, dados, estilos, autenticação e cálculo: fluxos ISG e IFT continuam com seu comportamento original.
- Sem persistência individual, cadastro, IA ou reaproveitamento de tabelas/credenciais ISG; nenhuma informação pessoal no QR, PDF ou logs da aplicação.
- QR da rota correta; URL de prévia identificada e nenhuma publicação afirmada sem comprovação.

### Formato da resposta de entrega

Informe de forma objetiva: decisão ToT e evidências; escopo implementado; arquivos alterados; diferenças metodológicas documentadas; verificações executadas e resultados; prévia/artefatos sintéticos disponíveis; itens a confirmar para a publicação. Avance em todo trabalho independente já autorizado antes de solicitar dados ou aprovação final.


## Atualização institucional do relatório

Aplicar as instruções específicas de `superprompt-fiba-pdf-identidade-ift.md`: usar os três logos oficiais fornecidos, com arquivos locais e proporções preservadas, identidade IFT principal e quarta página dedicada ao convite final. Missão, endereço, links e Instagram estão centralizados em `src/features/turma-do-bem/brand.ts`. Esta autorização atualiza a orientação anterior de identidade provisória sem logos para o PDF, sem alterar a metodologia ou conferir chancela científica ao instrumento.


## Atualização institucional da página principal

Executar também `superprompt-fiba-web-identidade-ift.md`: aplicar identidade IFT ao módulo web, cabeçalho com os logos oficiais IFT e Turma do Bem, rodapé institucional completo e paleta coerente com o PDF. Fonte compartilhada de conteúdo/assets em `brand.ts`, com compatibilidade do gerador por `pdfBrand.ts`. Abrir links externos em nova aba sem descartar o progresso. Esta atualização preserva questionário, metodologia, processamento local e PDF.
