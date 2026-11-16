# Superprompt ToT — identidade IFT na experiência web FIB-A

## Missão e execução autorizada

Aprimore a página principal e a continuidade visual da experiência em `/turma-do-bem/fib-a`, usando a identidade institucional do Instituto Felicidade para Todos e o logo contextual do projeto Turma do Bem. O solicitante autorizou criar este superprompt e executá-lo imediatamente, sem nova aprovação do documento.

Entregue cabeçalho com os dois logos oficiais, composição editorial premium, paleta coerente com o PDF, boa leitura no celular, rodapé institucional completo e continuidade visual nas etapas de participação, perguntas, revisão e resultado. Preserve o cálculo local, os 29 textos, metodologia, avanço automático, confirmação final e PDF institucional já implementados.

## Estado e fontes

Antes de editar, confira a branch, a main remota, git status e instruções locais. Trabalhe em branch própria e preserve alterações preexistentes.

O PDF institucional já usa os três PNGs oficiais locais em `src/features/turma-do-bem/assets/`, com procedência, dimensões e hashes registrados no README dessa pasta. Use o logo IFT completo em fundo claro, o horizontal com texto branco em fundo escuro e o logo Turma do Bem sem deformação. Não recorte, redesenhe, recolora ou invente marcas.

Missão, endereço e links foram fornecidos pelo solicitante. Centralize o mesmo conteúdo para web e PDF; se a configuração atual tiver nome específico de PDF, extraia uma fonte neutra e mantenha compatibilidade com o gerador existente.

Missão:

> Organização de impacto social com a missão de ativar e animar ecossistemas sustentáveis de felicidade humana, socioambiental e organizacional.

Endereço:

> Impact HUB Brasília — SGAN 601, Lote H, Ed. Íon, Ala Amarela, Asa Norte, Brasília/DF

Destinos:

- Instituto: https://felicidadeparatodos.com.br/
- Contato: https://felicidadeparatodos.com.br/#contato
- Instagram: https://instagram.com/felicidadeparatodosbr
- Projeto: https://turmadobem.org.br/dentista-do-bem/

O conteúdo identifica as organizações e apresenta seus canais. Não acrescente parceria formal, patrocínio, validação psicométrica, dados de impacto, tempo de conclusão ou alegações científicas não fornecidos.

## Decisão ToT

Compare alternativas por clareza, coerência institucional, acessibilidade, desempenho e impacto no preenchimento:

| Alternativa | Avaliação |
| --- | --- |
| Apenas substituir o nome por logos no tema verde existente | Insuficiente para a coerência solicitada entre página e relatório. |
| Transformar o formulário numa página promocional extensa, com várias distrações | Prejudica o foco do participante e aumenta o risco de perder o progresso. |
| Recompor o módulo com identidade IFT, cabeçalho claro, hero acolhedor e rodapé institucional, mantendo o foco das etapas | Preferir: equilibra identidade, contexto, legibilidade e conclusão do questionário. |

Registre a decisão de forma curta, sem expor raciocínio interno passo a passo. A identidade aplica-se ao módulo FIB-A; não é uma mudança da home geral, dashboard, ISG ou painéis de acesso da aplicação.

## Cabeçalho e hierarquia

- IFT como identidade principal, Turma do Bem como contexto do projeto e FIB-A como identificação do instrumento.
- Logos originais com proporção, área livre, rótulos acessíveis e dimensões reservadas para evitar saltos de layout.
- Links institucionais abrem em nova aba com `noopener noreferrer`, para preservar a pesquisa em andamento; informar esse comportamento de modo acessível.
- No celular, manter ambos os logos legíveis e o controle Compartilhar acesso/Sair utilizável, com alvo mínimo de 44 × 44 px. Não esconder a marca principal para caber o menu.
- Evitar navegação administrativa, login, planos ou botões do SaaS na experiência do evento.

## Direção visual

Use fundo creme/claro, texto grafite e teal de contraste adequado, ouro como cor de ação e pequenos acentos das quatro cores da marca. Reutilize a direção do PDF, com adaptação ao meio web. As cores não devem classificar ou induzir respostas da pesquisa.

Trabalhe tipografia, escala, alinhamento, respiro, ritmo entre seções, composição do hero e hierarquia dos CTAs. Preserve a mensagem de acolhimento, os três passos e a explicação metodológica. Pode ajustar a ilustração vetorial decorativa do hero à paleta; não altere os logos oficiais.

Mantenha a pergunta como foco nas etapas de resposta. Controles precisam ter contraste, estado selecionado claro, foco visível, rótulos completos e transição discreta. Respeite redução de movimento; não introduza parallax, animações bloqueantes ou bibliotecas desnecessárias.

Estilos devem ser escopados ao módulo e seus diálogos. Evite camadas de overrides repetidos; entregue CSS organizado e legível. Use fontes disponíveis e assets locais, sem novos serviços externos, trackers ou dependências para aplicar a identidade.

## Rodapé institucional

Criar uma composição com:

1. Logo IFT horizontal sobre fundo escuro e missão completa.
2. CTA “Quero conversar com a equipe”, com link de contato autorizado.
3. Endereço completo, site e Instagram `@felicidadeparatodosbr`.
4. Logo Turma do Bem em fundo apropriado e link “Conheça o projeto Dentista do Bem”.
5. Identificação FIB-A e convite para conhecer mais projetos de bem-estar e felicidade científica no site do Instituto.

O rodapé deve ser real, sem placeholders, textos “svg”, contatos fictícios, links sem destino ou declarações institucionais não fornecidas. Em telas estreitas, empilhar com boa leitura e alvos de toque; o rodapé não deve ficar fixo sobre controles de pergunta ou resultado.

## Funcionalidade e privacidade

Não alterar IDs, textos, mapeamento, escores, escala, arredondamento, manifesto, origem local do cálculo ou narrativa metodológica. Não reintroduzir dependência de endpoint, persistência, cadastro ou IA. Não registrar respostas em URLs, analytics ou logs.

Preservar seleção com avanço após 200 ms, Voltar, edição, teclado, revisão e confirmação antes da geração do resultado. O PDF continua com quatro páginas e a identidade institucional já verificada. Os links externos não recebem respostas ou pontuações e não devem descartar a sessão do participante.

## Verificação e entrega

Confira 320, 360, 390, 768 px e desktop, com screenshots reais. Verifique:

- ambos os logos visíveis, carregados, sem distorção ou recorte;
- ausência de overflow horizontal e de sobreposição no cabeçalho/rodapé;
- missão, endereço e quatro destinos corretos;
- links externos em nova aba, com rótulo acessível e preservação do progresso;
- navegação por teclado, foco, contraste e controles de toque;
- fluxo completo de 29 respostas sintéticas, revisão, cálculo local e download do PDF;
- QR Code, demonstração e marcação de dados sintéticos preservados;
- TypeScript, lint e build proporcionais à alteração.

Não use respostas reais nem o PDF confidencial ISG na verificação. Guarde screenshots e PDFs de revisão sintéticos fora do Git. Entregue superprompt, código, documentação, evidências e atualização da main. A publicação no Lovable permanece a cargo do solicitante, conforme combinado; não declare produção atualizada sem comprovação.
