# Superprompt — credenciais separadas e publicação da apresentação FIB-T

Use este prompt na conversa do projeto correto no Lovable depois de confirmar que a revisão do GitHub foi sincronizada.

---

Você está trabalhando no projeto existente da Pesquisa FIB-T. Leia a implementação atual sincronizada do GitHub e preserve as alterações já existentes no Lovable. Não recrie a aplicação, não faça uma cópia e não sobrescreva arquivos sem necessidade.

## Objetivo

Manter a credencial que já era usada no painel `/isg/resultados`, retirar dele o botão “Apresentar resultados” e usar uma credencial distinta, exclusiva do IFT, apenas em `/isg/apresentacao`. A equipe do IFT não deve entrar no painel de resultados usando a nova credencial da apresentação. A credencial administrativa antiga não deve autorizar a apresentação.

## Decisão pelo método ToT

Compare estas três opções pelos critérios de separação de acesso, exposição de credenciais e impacto nas funcionalidades existentes:

1. Apenas ocultar o botão: não impede o acesso direto à URL; descarte.
2. Usar a mesma credencial nas duas rotas: não mantém a separação solicitada; descarte.
3. Manter `ISG_RESULTS_ADMIN_PASSWORD` para resultados e usar `ISG_RESULTS_IFT_PASSWORD` somente para apresentação, com sessões HMAC por papel e validação no backend; escolha esta opção.

Execute a terceira opção. Relate a decisão e os critérios usados, sem revelar raciocínio interno detalhado.

## Requisitos de implementação e segurança

- Preserve sem alteração o valor atual de `ISG_RESULTS_ADMIN_PASSWORD`. Não o copie, exiba, redefina ou peça ao responsável para colá-lo no chat.
- Use `ISG_RESULTS_IFT_PASSWORD` apenas para a rota `/isg/apresentacao`. O valor deve ser diferente da credencial administrativa antiga. A configuração de Secrets não deve expor nenhum dos valores.
- Escolha para o IFT uma credencial inédita, que não esteja em código do navegador nem seja reutilizada de outro código de acesso da aplicação.
- No login de `/isg/resultados`, envie `scope: "results"`, valide `ISG_RESULTS_ADMIN_PASSWORD` no servidor e emita sessão HMAC com papel `admin`.
- No login de `/isg/apresentacao`, envie `scope: "presentation"`, valide `ISG_RESULTS_IFT_PASSWORD` no servidor e emita sessão HMAC com papel `ift`.
- A autenticação de cada rota deve falhar se for usada a credencial da outra rota. Recuse a apresentação se a nova secret não estiver configurada ou tiver o mesmo valor da secret administrativa.
- Exija papel `ift` em `validate-session`. A operação de agregados pode validar sessões `admin` ou `ift` usando a secret correspondente, pois o painel e a apresentação consultam apenas agregados.
- Mantenha sessões do painel e da apresentação em chaves diferentes no navegador. Encerrar uma sessão não deve encerrar a sessão do outro perfil em outra janela.
- Remova o CTA “Apresentar resultados” de `/isg/resultados`. A rota `/isg/apresentacao` deve continuar protegida ao ser aberta diretamente.
- Preserve o formulário de pesquisa, as respostas, questionário, instrumentação, tabelas, políticas, mecanismo de pontuação, agregação e demais rotas. Não execute migrações nem consultas que leiam respostas reais para testar acesso.
- Não inclua o PDF confidencial nem o snapshot histórico real em arquivos públicos, bundle, banco ou histórico do Git. Use somente dados sintéticos na verificação visual.

## Verificação e publicação

1. Confira que ambas as secrets existem no gerenciador do backend sem mostrar seus valores e sem editar `ISG_RESULTS_ADMIN_PASSWORD`. Se não for possível confirmar a configuração, informe isso explicitamente.
2. Confirme que a Edge Function `isg-results` ativa está com o código sincronizado e valida os dois escopos. A secret nova, sozinha, não atualiza o código da função.
3. No preview, confirme que `/isg/resultados` aceita apenas a credencial administrativa original, `/isg/apresentacao` aceita apenas a credencial IFT, a sessão de uma rota falha na outra e o CTA não aparece.
4. Confirme que o formulário e a aplicação da pesquisa continuam funcionando. Use dados sintéticos e não leia respostas individuais ou a base de produção.
5. Publique a função atualizada e o frontend correspondente, respeitando a ordem de implantação que evite deixar os logins incompatíveis. Não altere o público ou o domínio já configurados.
6. Informe o resultado das verificações e o URL publicado. Se o Lovable não puder implantar a Edge Function ou verificar as secrets, identifique o passo manual exato ainda necessário; não afirme que foi publicado com sucesso.

---
