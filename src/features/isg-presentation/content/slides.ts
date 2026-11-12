export interface Slide {
  id: string;
  chapter: "Compreender" | "Dialogar" | "Comprometer";
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  detail: string;
  page: string;
  objective: string;
  limit: string;
  notes: {
    observed: string;
    interpretation: string;
    question: string;
    proposal: string;
  };
}

export const SLIDES: readonly Slide[] = [
  {
    id: "abertura",
    chapter: "Compreender",
    eyebrow: "Devolutiva institucional · FIB-T",
    title: "Escutar. Compreender. Agir.",
    description:
      "Uma conversa sobre bem-estar no trabalho. Um ponto de partida para escolhas compartilhadas.",
    cta: "Começar apresentação",
    detail: "percurso",
    page: "1",
    objective: "Apresentar propósito e papéis da reunião.",
    limit: "Leitura descritiva; propostas dependem de pactuação.",
    notes: {
      observed:
        "Comece identificando a fonte, sua data e seu status na faixa superior. O Instituto facilita a conversa; a ISG é a organização participante.",
      interpretation:
        "O retrato descreve percepções de uma base respondente. Ele pode orientar perguntas, mas não explica sozinho as condições que produziram essas respostas.",
      question:
        "O que esperamos compreender nesta reunião e que condições precisamos criar para uma conversa respeitosa, sem exposição de respostas individuais?",
      proposal:
        "Combine o percurso: compreender os resultados, escutar os contextos e escolher até três frentes com responsabilidades, recursos e devolutivas a confirmar.",
    },
  },
  {
    id: "percurso",
    chapter: "Compreender",
    eyebrow: "O percurso da conversa",
    title: "Uma devolutiva que termina em decisões",
    description:
      "Compreender primeiro. Dialogar com contexto. Comprometer com clareza.",
    cta: "Ver percurso",
    detail: "percurso",
    page: "2",
    objective: "Antecipar as três etapas e o resultado esperado.",
    limit: "Tempos orientam a facilitação; não há avanço automático.",
    notes: {
      observed:
        "A apresentação reúne vinte momentos e uma biblioteca de apoio. Os detalhes podem ser abertos sem abandonar o ponto em que a conversa está.",
      interpretation:
        "As etapas organizam a reunião, não estabelecem conclusões antecipadas. Reservar tempo para ouvir é parte da proposta de condução institucional.",
      question:
        "Há algum tema que o grupo considera indispensável para compreender os resultados antes de conversar sobre possíveis frentes de trabalho?",
      proposal:
        "Explique que a exposição inicial dura aproximadamente vinte minutos. Depois, use o roteiro de sessenta minutos para escutar, pactuar prioridades e conferir os acordos.",
    },
  },
  {
    id: "sintese",
    chapter: "Compreender",
    eyebrow: "Três mensagens para levar",
    title: "Preservar. Investigar. Transformar.",
    description:
      "Reconhecer recursos percebidos e fazer perguntas antes de escolher ações.",
    cta: "Entender as mensagens",
    detail: "sintese",
    page: "3",
    objective: "Distinguir observação, interpretação e recomendação.",
    limit: "Diferenças de médias não foram testadas estatisticamente.",
    notes: {
      observed:
        "Mostre os valores que pertencem à fonte selecionada. Os destaques são descritivos e preservam empates; nenhuma conclusão histórica é transferida automaticamente para a API atual.",
      interpretation:
        "Médias diferentes ajudam a localizar assuntos para conversar. Não revelam quantas pessoas compartilham uma dificuldade nem estabelecem a causa dessa percepção.",
      question:
        "Que práticas merecem ser preservadas e quais assuntos precisam de mais contexto antes de serem escolhidos como prioridade institucional?",
      proposal:
        "Retome as três mensagens ao longo da reunião. Ao final, converta apenas as frentes reconhecidas pelo grupo em propostas de compromisso, com recursos e acompanhamento.",
    },
  },
  {
    id: "contexto",
    chapter: "Compreender",
    eyebrow: "Contexto da fonte",
    title: "O retrato disponível",
    description: "Base, datas e status precisam acompanhar os números.",
    cta: "Como a pesquisa foi aplicada?",
    detail: "aplicacao",
    page: "4 e 21",
    objective: "Localizar a base e reconhecer informações ausentes.",
    limit:
      "Participações não comprovam trabalhadores únicos nem taxa de adesão.",
    notes: {
      observed:
        "Leia as participações consideradas, as datas disponíveis e o status informado. Ausências aparecem como não informadas; emissão e atualização não definem o período integral da coleta.",
      interpretation:
        "Sem população elegível, convites e regras documentadas de participação única, não é possível calcular uma taxa de adesão ou afirmar representatividade da organização.",
      question:
        "Quem pode confirmar período, cobertura de setores, denominadores e regras de participação, sem compartilhar respostas ou identificadores dos participantes?",
      proposal:
        "Registre essas pendências para a equipe responsável e mantenha esta base como retrato descritivo. Confirme a documentação antes de consolidar uma linha de base comparável.",
    },
  },
  {
    id: "leitura",
    chapter: "Compreender",
    eyebrow: "Uma pausa para entender",
    title: "Uma média não conta toda a história",
    description:
      "Antes de interpretar, vamos reconhecer as escalas e os limites.",
    cta: "Testar minha compreensão",
    detail: "compreensao",
    page: "5",
    objective: "Diferenciar média, distribuição e escore global.",
    limit: "Não reconstruir distribuições a partir de médias.",
    notes: {
      observed:
        "As questões usam respostas de zero a quatro. Fatores e domínios apresentam médias nessa escala; o indicador global ocupa uma escala diferente, de zero a cem.",
      interpretation:
        "Uma mesma média pode resultar de distribuições muito distintas. A média neutra não demonstra que todas as respostas foram neutras, nem revela prevalências de experiências.",
      question:
        "Uma média igual ao ponto neutro significa que todas as pessoas responderam neutro? Convide uma reflexão breve, sem pontuação ou registro individual.",
      proposal:
        "Abra a explicação somente após a participação voluntária. Confirme também que o escore global não é a proporção de pessoas felizes e retome o percurso.",
    },
  },
  {
    id: "global",
    chapter: "Compreender",
    eyebrow: "Indicador global",
    title: "Um ponto de partida para aprender e agir",
    description:
      "Valor informado pela fonte, preservado sem recálculo na apresentação.",
    cta: "O que esse número significa?",
    detail: "global",
    page: "6",
    objective: "Ler o global com escala, base e limites.",
    limit: "Não é percentual de pessoas felizes, benchmark ou diagnóstico.",
    notes: {
      observed:
        "Apresente o escore global exatamente como recebido na fonte ativa. A escala, as participações e a identificação do retrato ficam próximas ao número para preservar seu contexto.",
      interpretation:
        "Um único retrato não demonstra melhora ou piora. Não há classificação normativa, comparação entre empresas ou corte clínico autorizado por este material.",
      question:
        "Que pergunta sobre o cotidiano este resultado nos ajuda a formular e que informações adicionais precisamos para não transformar o número em um julgamento?",
      proposal:
        "Use o indicador como abertura para compreender os agrupamentos e os itens. Se houver pendência de reconciliação, mostre sua existência sem substituir o valor publicado.",
    },
  },
  {
    id: "fatores",
    chapter: "Compreender",
    eyebrow: "Três fatores",
    title: "Três fatores para ampliar a leitura",
    description: "Comparação descritiva na mesma escala, de zero a quatro.",
    cta: "Entender os fatores",
    detail: "fatores",
    page: "7",
    objective: "Comparar fatores sem atribuir causas.",
    limit: "Fatores e domínios são agrupamentos diferentes.",
    notes: {
      observed:
        "As barras mostram os fatores recebidos, com origem zero e máximo quatro. O destaque identifica todas as maiores médias, quando há empate, sem classificar desempenho.",
      interpretation:
        "O fator com maior média não elimina dificuldades em seus itens. Condições pessoais e organizacionais podem se relacionar, e os agrupamentos não isolam causas.",
      question:
        "Quais práticas concretas ajudam a compreender essas percepções e quem pode encontrar barreiras de acesso às condições que o grupo reconhece como positivas?",
      proposal:
        "Abra as definições se necessário e passe aos nove domínios. Não some fatores e domínios, nem explique a diferença entre eles como prova de validação científica.",
    },
  },
  {
    id: "dominios",
    chapter: "Compreender",
    eyebrow: "Nove perspectivas",
    title: "Bem-estar é multidimensional",
    description:
      "Barras comparáveis. Empates preservados. Contexto antes de prioridade.",
    cta: "Explorar os domínios",
    detail: "dominios",
    page: "8",
    objective: "Reconhecer diferentes dimensões e preservar empates.",
    limit: "A menor média não determina automaticamente a primeira ação.",
    notes: {
      observed:
        "Os domínios estão ordenados por média decrescente, com desempate estável por rótulo. A leitura das menores médias inclui todos os empates e o gráfico oferece tabela equivalente.",
      interpretation:
        "Cada domínio organiza uma perspectiva da leitura. Isso não significa que os nove agrupamentos constituam nove escalas cientificamente validadas ou que sejam independentes entre si.",
      question:
        "Ao considerar contexto, alcance e capacidade de resposta, quais dimensões merecem uma conversa mais cuidadosa antes de escolhermos um problema modificável?",
      proposal:
        "Explore as definições prudentes e indique a pendência de correspondência entre versões. Não reagrupe itens nem recalcule os valores para adequar o gráfico ao desenho.",
    },
  },
  {
    id: "recursos",
    chapter: "Dialogar",
    eyebrow: "O que preservar",
    title: "Recursos percebidos podem apoiar a mudança",
    description:
      "Propósito de vida, flexibilidade, ética, confiança e apoio entram na conversa com seus enunciados.",
    cta: "Ver os itens e seus limites",
    detail: "recursos",
    page: "9",
    objective: "Reconhecer recursos sem generalizar acesso.",
    limit:
      "Propósito de vida não equivale a alinhamento à missão da organização.",
    notes: {
      observed:
        "Mostre os itens selecionados e suas médias na fonte ativa. Os enunciados estão no aprofundamento; a seleção é temática e não presume que sejam sempre os maiores valores.",
      interpretation:
        "Recursos percebidos podem ajudar uma conversa sobre mudanças, mas não demonstram que todas as pessoas os experimentam ou que seu acesso seja equitativo.",
      question:
        "Que práticas concretas sustentam essas percepções e que obstáculos podem impedir parte da equipe de acessar os mesmos recursos no cotidiano?",
      proposal:
        "Identifique práticas a preservar e condições de acesso a compreender melhor. Lembre que propósito maior na vida é um tema pessoal e não uma medida de alinhamento institucional.",
    },
  },
  {
    id: "recuperacao",
    chapter: "Dialogar",
    eyebrow: "Uma frente para investigar",
    title: "Investigar estresse e recuperação",
    description:
      "Escutar condições e contextos, sem atribuição automática ao trabalho.",
    cta: "Por onde começar a escuta?",
    detail: "recuperacao",
    page: "10",
    objective: "Abrir perguntas sobre condições modificáveis.",
    limit:
      "Q24 mantém a direção original. Nenhum item fornece diagnóstico ou prevalência.",
    notes: {
      observed:
        "Leia integralmente os itens sobre estresse e sono, com as médias da fonte selecionada. A formulação sobre estresse mantém a direção original.",
      interpretation:
        "Essas médias não informam quantas pessoas dormem pouco, não medem prevalência de burnout e não permitem atribuir a percepção exclusivamente às condições de trabalho.",
      question:
        "Como previsibilidade, demandas simultâneas, pausas e contatos fora da jornada aparecem no cotidiano, sem que alguém precise revelar informações pessoais de saúde?",
      proposal:
        "Escolha com a equipe um problema operacional modificável e teste um ajuste viável. Apoios individuais podem complementar a iniciativa, mas não substituem a revisão das condições de trabalho.",
    },
  },
  {
    id: "vida",
    chapter: "Dialogar",
    eyebrow: "Contexto e equidade",
    title: "Condições de vida pedem apoio",
    description:
      "Conhecer barreiras e preferências, com liberdade de escolha e respeito à vida privada.",
    cta: "Como apoiar sem invadir?",
    detail: "vida",
    page: "11",
    objective: "Interpretar condições materiais e acesso sem moralização.",
    limit: "Moradia e práticas culturais não são metas de desempenho.",
    notes: {
      observed:
        "Os itens tratam de moradia, projetos com investimento, rendimento e experiências culturais ou voluntárias. Mantenha a janela de doze meses quando ela estiver presente no enunciado original.",
      interpretation:
        "Uma resposta sobre propriedade da moradia não resume a qualidade de vida da pessoa. Frequência a exposições também não define valor, capacidade ou comprometimento profissional.",
      question:
        "Quais barreiras de acesso e preferências podem orientar ofertas úteis, sem pedir renda individual, dívidas, diagnósticos ou detalhes da vida familiar?",
      proposal:
        "Considere apoios opcionais e acessíveis apenas depois da escuta. Garanta formatos inclusivos e avalie se a oferta é pertinente, em vez de impor hábitos culturais ou pessoais.",
    },
  },
  {
    id: "comunicacao",
    chapter: "Dialogar",
    eyebrow: "Comunicação e participação",
    title: "Comunicar, ouvir e responder",
    description:
      "Prioridades compreensíveis e oportunidades de participação com retorno.",
    cta: "Abrir exemplos de ação",
    detail: "comunicacao",
    page: "12",
    objective: "Relacionar itens a perguntas práticas sobre fluxos.",
    limit:
      "Os itens não demonstram, sozinhos, assédio ou ausência de segurança psicológica.",
    notes: {
      observed:
        "Apresente os itens de comunicação interna, estratégias e metas, liberdade de expressão e oportunidades de treinamento. Os valores pertencem à fonte selecionada.",
      interpretation:
        "Esses assuntos permitem investigar clareza e participação. Não provam, isoladamente, assédio, falta de confiança ou ausência de segurança psicológica na organização.",
      question:
        "As pessoas compreendem o que está sendo decidido, por que a mudança acontece, onde podem contribuir e quando receberão uma resposta?",
      proposal:
        "Examine um resumo periódico de prioridades, um espaço existente de escuta e uma devolutiva sobre o que foi decidido. Defina uma cadência viável com quem executará o processo.",
    },
  },
  {
    id: "prioridades",
    chapter: "Comprometer",
    eyebrow: "Da interpretação à escolha",
    title: "Três frentes integradas",
    description:
      "Propostas para confirmar relevância e viabilidade com trabalhadores e direção.",
    cta: "Examinar as frentes",
    detail: "prioridades",
    page: "13",
    objective: "Comparar propostas pelos critérios de escolha.",
    limit: "Nenhuma frente constitui compromisso já assumido.",
    notes: {
      observed:
        "As três frentes são propostas editoriais para organizar a discussão: condições de trabalho, comunicação e voz, e recursos de apoio. Elas não foram aprovadas automaticamente por uma pesquisa.",
      interpretation:
        "O valor de uma frente depende do problema reconhecido, de quem ela alcança, dos recursos disponíveis e da possibilidade de observar sua execução sem expor pessoas.",
      question:
        "Que frente reúne importância para a equipe, possibilidade real de ação, alcance e equidade suficientes para justificar um primeiro piloto?",
      proposal:
        "Selecione até três frentes e mantenha a opção de adaptar ou retirar propostas. Só depois escreva ações concretas, responsáveis por função, recursos, prazos e primeira devolutiva.",
    },
  },
  {
    id: "frente-trabalho",
    chapter: "Comprometer",
    eyebrow: "Frente 01 · Trabalho",
    title: "Melhorar condições do cotidiano",
    description:
      "Um piloto de organização do trabalho construído com a equipe.",
    cta: "Abrir ficha de ação",
    detail: "trabalho",
    page: "14",
    objective: "Especificar um piloto viável.",
    limit: "Proposta operacional, sem promessa clínica ou de eficácia.",
    notes: {
      observed:
        "A ficha propõe escutar situações recorrentes e escolher uma dificuldade operacional antes de testar uma mudança. Responsabilidades sugeridas ainda precisam ser confirmadas na reunião.",
      interpretation:
        "Prioridades semanais, pausas viáveis ou regras para demandas fora da jornada são exemplos possíveis. A pertinência depende da atividade real e dos recursos que a organização pode disponibilizar.",
      question:
        "Qual problema será testado primeiro, quem pode responder pela execução e que condição precisa existir para não criar uma nova sobrecarga?",
      proposal:
        "Registre a primeira entrega, observe aplicação, obstáculos e utilidade percebida. Não monitore sono individual nem exija relatos de saúde ao gestor para avaliar o piloto.",
    },
  },
  {
    id: "frente-relacoes",
    chapter: "Comprometer",
    eyebrow: "Frente 02 · Relações",
    title: "Criar um ciclo de comunicação com resposta",
    description: "Dar clareza às decisões e tornar as devolutivas previsíveis.",
    cta: "Abrir ficha de ação",
    detail: "relacoes",
    page: "15",
    objective: "Definir uma cadência de informação, escuta e retorno.",
    limit: "Participação reservada exige encaminhamento adequado.",
    notes: {
      observed:
        "A proposta articula um resumo periódico de prioridades, um espaço para contribuições e uma resposta sobre decisões. Use canais existentes quando possível.",
      interpretation:
        "Comunicar o que foi ouvido e explicar o que será ou não realizado torna o processo acompanhável. Isso não garante, por si, melhora dos escores ou de confiança.",
      question:
        "Qual canal já funciona, que cadência pode ser sustentada e quem terá condições de responder às contribuições no prazo que for pactuado?",
      proposal:
        "Defina uma primeira devolutiva e uma evidência simples de execução. Avalie clareza e utilidade voluntariamente, sem identificar respostas individuais nem transformar participação em cobrança.",
    },
  },
  {
    id: "frente-apoio",
    chapter: "Comprometer",
    eyebrow: "Frente 03 · Apoio",
    title: "Oferecer recursos com liberdade de escolha",
    description:
      "Necessidades antes de atividades. Acesso antes de expectativas.",
    cta: "Abrir ficha de ação",
    detail: "apoio",
    page: "16",
    objective: "Construir ofertas pertinentes e opcionais.",
    limit: "Práticas individuais complementam a revisão do trabalho.",
    notes: {
      observed:
        "A proposta é conhecer interesses antes de selecionar ofertas. Aprendizagem, informação sobre benefícios e oportunidades culturais são exemplos, sujeitos à escuta e aos recursos.",
      interpretation:
        "Uma oferta só pode ser considerada útil quando há possibilidade real de acesso. Horários, formatos e custos podem limitar a participação de maneiras distintas.",
      question:
        "Quais necessidades podem ser conhecidas sem exposição pessoal e que ajustes tornariam as oportunidades acessíveis para diferentes rotinas e preferências da equipe?",
      proposal:
        "Escolha uma primeira oferta opcional, acompanhe barreiras e avaliação voluntária e revise o que se mostrar pouco pertinente. Gratidão ou atenção plena não substituem melhorias nas condições de trabalho.",
    },
  },
  {
    id: "noventa-dias",
    chapter: "Comprometer",
    eyebrow: "Um primeiro ciclo",
    title: "Um ciclo curto, com devolutivas previsíveis",
    description:
      "Noventa dias a partir da pactuação, com espaço para ajustar o percurso.",
    cta: "Explorar o cronograma",
    detail: "cronograma",
    page: "17",
    objective: "Localizar entregas e devolutivas no ciclo.",
    limit: "Os prazos são propostas operacionais, não parâmetros do FIB-T.",
    notes: {
      observed:
        "O cronograma organiza escuta, pactuação, pilotos, revisão e prestação de contas. As datas relativas começam quando os compromissos forem acordados.",
      interpretation:
        "Uma sequência curta facilita acompanhar execução, mas não demonstra responsividade do instrumento nem garante que experiências pessoais mudem nesse intervalo de tempo.",
      question:
        "Que primeira entrega é viável em cada etapa e quando a equipe poderá conhecer o que foi realizado, o que está pendente e o que será revisto?",
      proposal:
        "Combine devolutivas e ajuste o plano segundo obstáculos observados. Não reaplique automaticamente itens com janela de doze meses ao fim de noventa dias como se essa comparação estivesse validada.",
    },
  },
  {
    id: "governanca",
    chapter: "Comprometer",
    eyebrow: "Responsabilidade compartilhada",
    title: "Cada compromisso tem um responsável",
    description:
      "Papéis claros, recursos disponíveis e participação no acompanhamento.",
    cta: "Quem faz o quê?",
    detail: "governanca",
    page: "18",
    objective: "Confirmar responsabilidades por função.",
    limit: "Papéis sugeridos; designações dependem de confirmação.",
    notes: {
      observed:
        "A proposta distingue patrocínio da direção, coordenação interna, participação de representantes dos trabalhadores e facilitação do Instituto. Os papéis não indicam pessoas já designadas.",
      interpretation:
        "Responsabilidade clara precisa estar acompanhada de tempo, autonomia e recursos. Acesso a agregados não autoriza buscar ou cobrar respostas individuais dos trabalhadores.",
      question:
        "Quem pode responder por cada entrega, que apoio precisará receber e como os representantes da equipe participarão da avaliação de alcance e efeitos?",
      proposal:
        "Registre funções, recursos e primeira devolutiva no quadro. Peça que cada responsável confirme o entendimento do acordo antes de considerar o rascunho pronto para aprovação institucional.",
    },
  },
  {
    id: "acompanhamento",
    chapter: "Comprometer",
    eyebrow: "Aprender com a execução",
    title: "Medir o que foi feito antes de prometer impacto",
    description:
      "Execução, experiência e resultados respondem a perguntas diferentes.",
    cta: "Como acompanhar?",
    detail: "acompanhamento",
    page: "19",
    objective: "Distinguir indicadores operacionais de efeitos.",
    limit:
      "Comparação futura exige versão, denominadores e método compatíveis.",
    notes: {
      observed:
        "Acompanhe primeiro ações pactuadas e concluídas, devolutivas realizadas e prazos documentados. Separadamente, escute utilidade percebida, barreiras e acesso, com participação voluntária.",
      interpretation:
        "Execução demonstra que uma atividade ocorreu, não que ela causou uma mudança no bem-estar. Uma nova coleta também exige cuidado antes de comparar médias entre períodos.",
      question:
        "Qual evidência permitirá saber se cada compromisso aconteceu, se foi acessível e se merece continuidade, sem criar uma meta normativa de felicidade?",
      proposal:
        "Defina indicadores, denominadores e prazos antes de acompanhar. Planeje uma eventual nova avaliação com a mesma versão e regras, preservando os limites de atribuição causal.",
    },
  },
  {
    id: "pactuacao",
    chapter: "Comprometer",
    eyebrow: "Da escuta à continuidade",
    title: "O valor da escuta aparece no que fazemos depois.",
    description:
      "Poucos compromissos, responsabilidades claras e uma próxima conversa combinada.",
    cta: "Preparar os próximos passos",
    detail: "pactuacao",
    page: "27",
    objective: "Revisar até três compromissos e combinar continuidade.",
    limit: "O quadro é um rascunho em memória, sujeito a aprovação.",
    notes: {
      observed:
        "Revise as frentes selecionadas e os campos que ainda precisam de decisão. O quadro mantém um rascunho local, sem enviar mensagens ou persistir em banco.",
      interpretation:
        "Escrever uma proposta não significa que ela foi assumida institucionalmente. Responsabilidade, prazo, recursos e evidência precisam ser compreendidos e confirmados pelas pessoas envolvidas.",
      question:
        "Quais compromissos vamos assumir, quem responde por cada entrega, que recursos serão disponibilizados e quando a equipe receberá a próxima devolutiva?",
      proposal:
        "Peça que cada responsável resuma o acordo com suas palavras. Revise o rascunho antes da exportação local e explique que recarregar ou sair da página apaga o conteúdo em memória.",
    },
  },
];

export const getSlide = (id: string | null) =>
  SLIDES.find((s) => s.id === id) ?? SLIDES[0];
export const MEETING_AGENDA = [
  ["0–5 min", "Abrir com propósito"],
  ["5–20 min", "Ler os resultados"],
  ["20–35 min", "Escutar o contexto"],
  ["35–50 min", "Pactuar prioridades"],
  ["50–60 min", "Conferir e fechar"],
] as const;
