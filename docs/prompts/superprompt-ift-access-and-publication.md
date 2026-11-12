# Superprompt — acesso IFT e publicação da apresentação FIB-T

Cole este prompt na conversa do projeto correto no Lovable depois de confirmar que a revisão mais recente do GitHub foi sincronizada.

---

Você está trabalhando no projeto existente da Pesquisa FIB-T. Inspecione o commit mais recente sincronizado do GitHub e preserve as alterações da Lovable que já estão nesse projeto. Não recrie a aplicação, não faça uma cópia e não sobrescreva arquivos sem necessidade.

## Objetivo

Restringir o painel de resultados e a apresentação à equipe do Instituto Felicidade para Todos (IFT), retirar do painel `/isg/resultados` o botão “Apresentar resultados” e preparar a rota `/isg/apresentacao` para publicação após validar o backend.

## Decisão pelo método ToT

Compare estas três abordagens pelos critérios de controle de acesso, exposição da credencial e impacto nas funcionalidades existentes:

1. Apenas ocultar o botão: não impede acesso direto à URL; descarte.
2. Validar a senha no navegador: expõe a credencial no código entregue; descarte.
3. Validar a credencial exclusivamente no backend, emitir sessão HMAC com papel `ift`, exigir esse papel nos agregados e na apresentação e retirar o botão; escolha esta abordagem.

Execute a terceira abordagem. Relate somente a decisão e os critérios usados, sem revelar raciocínio interno detalhado.

## Requisitos de implementação e segurança

- Crie uma credencial nova, distinta de qualquer valor já presente no frontend, e configure-a diretamente no gerenciador de secrets do backend sob o nome `ISG_RESULTS_IFT_PASSWORD`. Não peça que o responsável cole a credencial no chat. Nunca a reproduza em respostas, arquivos, código, variáveis `VITE_*`, logs, commits, issues ou capturas.
- Não aceite a credencial administrativa anterior para criar sessões. A credencial deve gerar uma sessão HMAC de curta duração com papel assinado `ift`; invalide sessões antigas sem esse papel.
- Exija papel `ift` tanto na leitura de agregados quanto em `validate-session`. A proteção deve funcionar ao abrir `/isg/apresentacao` diretamente, mesmo sem o botão no painel.
- Identifique claramente a área como restrita à equipe IFT. Preserve a marca e a identificação da ISG como organização participante quando necessárias para contextualizar os resultados.
- Remova o CTA “Apresentar resultados” de `/isg/resultados`.
- Preserve o formulário de pesquisa, as respostas, questionário, instrumentação, tabelas, políticas, mecanismo de pontuação, agregação e demais rotas. Não execute migrações nem consultas que leiam respostas reais para testar acesso.
- Não inclua o PDF confidencial nem o snapshot histórico real em arquivos públicos, bundle, banco ou histórico do Git. Use apenas dados sintéticos na verificação visual.

## Verificação e publicação

1. Confirme que uma credencial nova está configurada como `ISG_RESULTS_IFT_PASSWORD` no secret manager do backend e que a Edge Function `isg-results` ativa reconhece `login`, `aggregates` e `validate-session` com o papel IFT. Se o Lovable não tiver acesso à configuração ou implantação dessa função, pare e informe o passo exato que o responsável precisa executar; não simule sucesso.
2. No preview, confirme que a rota de resultados não tem o CTA, que uma sessão sem papel IFT é recusada nas duas rotas protegidas e que o formulário de pesquisa continua intacto.
3. Se as verificações passarem, publique a atualização do frontend e da função autorizada, sem alterar o público ou domínio já configurados.
4. Informe o URL publicado e o resultado de cada verificação. Se algo falhar, mantenha a publicação pendente e explique o bloqueio.

---
