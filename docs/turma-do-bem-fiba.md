# FIB-A · Turma do Bem

## Entrega atual

Módulo independente em `/turma-do-bem/fib-a`, com os 29 itens do formulário de alunos, avanço automático por resposta, revisão final, cálculo individual no dispositivo, narrativa descritiva, PDF A4 de três páginas e QR Code SVG/PNG. Tema visual próprio e provisório, sem ativos oficiais inventados ou identidade ISG.

## Diagnóstico e correção da conclusão

Na verificação da publicação em 16/11/2026, a página respondeu HTTP 200, mas o backend indicado pelo bundle público (`tsmwtniqrxpsmstcipky.supabase.co`) retornou HTTP 404 em GET e OPTIONS para `/functions/v1/fiba-student-score`, com `Requested function was not found`. A função de cálculo requerida pela primeira implementação não estava disponível. O frontend antigo traduzia a falha em uma mensagem genérica, impedindo resultado e PDF.

A correção retira essa dependência da jornada individual. `src/lib/fibaResult.ts` usa diretamente o **mesmo módulo puro** `supabase/functions/_shared/fiba.ts`, também reexportado por `src/domain/fiba/index.ts`. Não duplica fórmula, não altera perguntas, pesos ou arredondamento e não envia as respostas à rede. A função Supabase continua disponível no repositório para uso opcional; sua implantação não é necessária para este fluxo.

A origem real do resultado é identificada no manifesto como `client_local`. `server` continua sendo exclusivo de resultados do servidor e `client_preview` identifica apenas a demonstração sintética. `isReportableFiba` aceita relatórios completos e válidos de origem local ou servidor; `isCanonicalFiba` permanece restrito ao servidor. O PDF e a interface informam a origem correta. Nenhum resultado de participante é apresentado como confirmado por um servidor.

## Decisão ToT e fontes

| Alternativa | Decisão e evidência |
| --- | --- |
| Alterar a matriz/rotas ISG existentes | Rejeitada. A FIB-T ocupacional possui 32 itens e fluxo próprio. |
| Usar a soma das médias dos fatores sugerida no anexo | Substituída pela instrução expressa de preservar o método computacional do app. |
| Exigir o endpoint indisponível para um relatório individual sem armazenamento | Substituída após o erro HTTP 404 confirmado. Não há dado compartilhado que exija essa ida à rede. |
| Cálculo local com o mesmo módulo puro, versão e matriz FIB-A | Implementado. Elimina a dependência de deploy e preserva a metodologia computacional, com identificação honesta da origem. |

Fonte dos textos: `FIB - Alunos - Formulario Inspirado no FIB-T - 2026 .md`, SHA-256 `4978e3992af3d8a4ea605f71637dc719150f0d68b66436376e1087f8b05cc637`. Os 29 textos foram conferidos integralmente. O link privado NotebookLM e o PDF confidencial ISG não integram a entrega.

FIB-A versão técnica `0.1.0`, cálculo `1.0.0`. Essas versões identificam o software e não certificam validação psicométrica ou comparabilidade com a FIB-T ocupacional.

## Método preservado

- Respostas inteiras 0–4; exatamente 29 IDs distintos e válidos; sem pré-seleção, imputação ou itens invertidos.
- Nove domínios: médias dos próprios itens, com duas casas decimais.
- Três fatores: médias dos próprios itens, com quantidades 9, 15 e 5; duas casas.
- Global: média dos nove domínios já arredondados, normalizados por 4, multiplicada por 100 e arredondada para uma casa.
- Mesmo arredondamento e ordem de operações da FIB-T do app; matriz, conteúdo e versão próprios no manifesto.
- Não se trata de média dos 29 itens, média/soma dos três fatores, percentil ou percentual de felicidade.

UI e PDF consomem o mesmo objeto de resultado. O gerador de PDF não calcula escores. A demonstração mantém dados sintéticos separados e marcação na tela, no nome do arquivo e nas três páginas.

## Narrativa e PDF

`src/features/turma-do-bem/narrative.ts` produz textos determinísticos a partir dos valores já calculados: resumo do global, comparação descritiva dos escores da própria pessoa, empates e perguntas abertas para reflexão. Não cria faixas, diagnóstico, conclusões causais, escore PERMA ou aconselhamento médico. Nos empates, todos os domínios empatados são descritos; a pergunta de reflexão por domínio usa a ordem fixa da fonte para escolher o primeiro dos menores escores.

PDF com três páginas A4, texto selecionável, fontes Liberation locais incorporadas sob licença SIL OFL e gráficos vetoriais. A capa e a reflexão usam a mesma narrativa da tela. Dados, fonte, versão e origem do cálculo ficam identificados; a identidade ISG não é reutilizada. Download/compartilhamento é iniciado pelo participante. A geração das fontes usa apenas assets estáticos da própria aplicação; não há serviço externo de PDF ou IA.

## Navegação por resposta

Um toque/clique registra a alternativa e avança após 200 ms de feedback visual. A transição bloqueia novos cliques para evitar saltos. É possível voltar e clicar novamente na alternativa já marcada. Na edição, selecionar retorna à revisão; a pergunta 29 também leva à revisão. A conclusão exige confirmação explícita do participante.

No teclado, as setas exploram as opções; Enter ou espaço confirma e avança. A interface explica o comportamento e move o foco ao título da próxima pergunta. O temporizador é cancelado ao desmontar a página.

## Dados e publicação

Respostas e resultados ficam apenas na memória da sessão e no PDF que o participante decidir baixar. Não há cadastro, persistência, envio das respostas, IA ou compartilhamento com tabelas/credenciais ISG/IFT. A infraestrutura ainda pode registrar o acesso à página; não se promete anonimato operacional absoluto.

Para publicar esta correção, **sincronizar a `main` e publicar o frontend no Lovable**. Esta versão não requer implantar função de cálculo, criar secret ou alterar banco. A conta Lovable conectada à sessão não possui acesso ao projeto histórico; o solicitante fará a publicação na própria conta.

Depois da publicação, abrir a rota, concluir com 29 respostas sintéticas iguais a 2 e conferir global 50,0, domínios/fatores 2,00 e download do PDF. Conferir também teclado, edição e avanço automático. Somente no domínio publicado, usar “Compartilhar acesso” para gerar QR definitivo.

Antes da divulgação, confirmar ativos e informações institucionais do aviso de participação/privacidade, público/faixa etária e referência à instituição de ensino. Não há painel nem armazenamento agregado do evento no escopo.

## Verificações

**85 testes de domínio, narrativa e regressão passaram**, além de TypeScript, ESLint dos arquivos alterados e build de produção. Os testes automatizados cobrem a matriz e o cálculo FIB-A, a igualdade local/servidor usando o mesmo módulo, rejeição de respostas inválidas e de prévias como relatórios reais, ausência de chamadas à rede no cálculo local, regressões FIB-T/ISG, narrativa e navegação.

**Os dez cenários Chromium passaram**: cinco larguras (320/360/390/768/1366 px), Voltar/reseleção, setas/Enter/espaço, clique duplo, fluxo completo local com edição/confirmação/PDF e demonstração/QR. O resultado local não usa resposta de servidor simulada. Artefatos de revisão são sintéticos e ficam fora do Git.

PDF revisado por extração de texto, incorporação das fontes e renderização de cenários sintéticos, inclusive zeros, máximos, empates e textos extensos. Compatibilidade com Safari/iOS, câmera física e a versão atualizada em produção dependem da publicação e de verificação nos respectivos ambientes. Não foram consultadas respostas reais de participantes.
