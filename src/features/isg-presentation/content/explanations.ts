export const ACTIONS = [
  {
    key: "trabalho",
    label: "Recuperação e condições",
    short: "Trabalho",
    title: "Melhorar condições do cotidiano",
    goal: "Escolher com a equipe um obstáculo operacional e testar um ajuste na organização do trabalho.",
    role: "Gestão, pessoas e representantes da equipe",
    resources: "Tempo de escuta e autonomia para testar um ajuste",
    delivery: "Problema escolhido e piloto descrito",
    indicator: "Aplicação do ajuste, obstáculos e utilidade percebida",
    description:
      "Escutar situações recorrentes antes de escolher a mudança. Priorização semanal, pausas viáveis e critérios para demandas fora da jornada são possibilidades a examinar, sem pressupor que sirvam a toda atividade. Investigar a carga adicional e a aceitação da proposta. Não monitorar sono individual nem exigir relatos de saúde ao gestor.",
    source:
      "Proposta de ação · relatório institucional, p. 14; fundamentação geral: OMS, 2022.",
  },
  {
    key: "relacoes",
    label: "Comunicação e voz",
    short: "Relações",
    title: "Criar um ciclo de comunicação com resposta",
    goal: "Tornar prioridades e decisões compreensíveis, com espaço de escuta e devolutiva.",
    role: "Coordenação interna e representantes da equipe",
    resources: "Canal existente, tempo de resposta e cadência viável",
    delivery: "Primeiro resumo de prioridades e fluxo de retorno",
    indicator:
      "Cadência cumprida, contribuições respondidas e clareza percebida",
    description:
      "Um resumo quinzenal é uma possibilidade: prioridades, mudanças, justificativas e funções responsáveis. Usar um encontro breve ou canal já existente, com opção reservada quando apropriada. Fechar o ciclo explicando o que foi ouvido, o que foi decidido e o que ainda não será feito, com seus motivos. Não identificar respostas individuais.",
    source: "Proposta de ação · relatório institucional, p. 15.",
  },
  {
    key: "apoio",
    label: "Recursos e desenvolvimento",
    short: "Apoio",
    title: "Oferecer apoio integral com liberdade de escolha",
    goal: "Conhecer necessidades antes de definir oportunidades educativas, culturais ou informação sobre benefícios.",
    role: "Pessoas e representantes da equipe",
    resources: "Horários inclusivos e recursos a confirmar",
    delivery: "Necessidade confirmada e primeira oferta opcional",
    indicator: "Acesso, barreiras e avaliação voluntária de utilidade",
    description:
      "Ouvir temas de interesse sem solicitar renda individual, dívidas, diagnósticos ou exposição familiar. Oferecer formatos acessíveis e rever iniciativas que adicionem sobrecarga. Gratidão, atenção plena e forças pessoais podem ser complementos educativos. Essas práticas não substituem revisão das condições de trabalho nem constituem protocolo clínico.",
    source: "Proposta de ação · relatório institucional, p. 16.",
  },
] as const;
export type ActionKey = (typeof ACTIONS)[number]["key"];

export const TIMELINE = [
  {
    period: "Dias 1–15",
    title: "Escutar e pactuar",
    detail:
      "Confirmar a base, ouvir a equipe, escolher até três frentes e formalizar funções responsáveis e recursos.",
  },
  {
    period: "Dias 16–30",
    title: "Iniciar os pilotos",
    detail:
      "Executar um ajuste por frente aprovada e comunicar como a equipe poderá acompanhar o processo.",
  },
  {
    period: "Dias 31–60",
    title: "Revisar com a equipe",
    detail:
      "Observar acesso, utilidade e obstáculos. Ajustar a execução e registrar o aprendizado sem relatos pessoais.",
  },
  {
    period: "Dias 61–90",
    title: "Prestar contas",
    detail:
      "Compartilhar realizado e pendente. Decidir continuidade e planejar uma eventual avaliação comparável.",
  },
] as const;

export const GOVERNANCE = [
  [
    "Direção da ISG",
    "Patrocinar, remover obstáculos e disponibilizar recursos.",
  ],
  [
    "Pessoas / coordenação interna",
    "Organizar agenda, registrar compromissos e acompanhar entregas.",
  ],
  [
    "Representantes dos trabalhadores",
    "Qualificar prioridades e verificar alcance e efeitos das ações.",
  ],
  [
    "Instituto Felicidade para Todos",
    "Facilitar a leitura dos dados, orientar o método e apoiar a avaliação.",
  ],
] as const;

export const EXPLANATIONS: Record<
  string,
  {
    title: string;
    paragraphs: string[];
    can: string;
    cannot: string;
    question: string;
  }
> = {
  sintese: {
    title: "Da observação à proposta",
    paragraphs: [
      "Os resultados observados são os números e metadados recebidos da fonte selecionada. A apresentação conserva esses valores e indica ausências. As interpretações são leituras delimitadas, formuladas para abrir perguntas. Recomendações são possibilidades de ação, dependentes de escuta, recursos e decisão institucional.",
      "No histórico, a transcrição documental não autentica o arquivo pelo servidor. No agregado atual, os dados ficam congelados durante a apresentação e só mudam por solicitação explícita. Na demonstração, todos os números são fictícios. Sem essa distinção, uma conversa sobre ações poderia atribuir ao levantamento conclusões que ele não oferece.",
      "Preservar recursos percebidos, investigar contextos e transformar escolhas em compromissos são orientações da reunião. Não há promessa de produtividade, redução de burnout ou elevação do escore. As frentes podem ser adaptadas ou recusadas pelo grupo, e os papéis precisam ser confirmados.",
    ],
    can: "Descrever o retrato e formular perguntas para a equipe.",
    cannot: "Estabelecer causas, evolução ou eficácia de uma intervenção.",
    question: "Que leitura precisamos confirmar com quem vive o cotidiano?",
  },
  global: {
    title: "Como ler o indicador global",
    paragraphs: [
      "O global é um escore agregado na escala de zero a cem. Não corresponde à porcentagem de pessoas felizes e não identifica indivíduos. Leia-o sempre com a base, as datas e o status disponíveis na fonte ativa. Uma ausência de metadado continua ausente: a interface não preenche o período de coleta a partir da data de emissão.",
      "Não há benchmark, faixa normativa ou corte clínico autorizado para esta experiência. O levantamento descritivo e transversal não mostra evolução nem efeito de intervenção. Uma média pode orientar a conversa, mas não informa quantas pessoas tiveram determinada experiência e não explica suas causas.",
      "A apresentação não calcula um novo global a partir das médias exibidas. Pendências de versão, precisão ou denominadores ficam documentadas em Metodologia e limites. A conferência do contrato do arquivo verifica sua estrutura, sem certificar sua origem. Uma nova comparação requer documentação compatível de instrumento, regras, população e período.",
    ],
    can: "Ler o valor recebido como um retrato descritivo.",
    cannot:
      "Usar o escore para classificar trabalhadores ou diagnosticar saúde.",
    question: "O que este retrato nos convida a compreender melhor?",
  },
  fatores: {
    title: "Fatores não são domínios",
    paragraphs: [
      "Os três fatores organizam percepções relacionadas a condições materiais de vida, bem-estar e contexto organizacional. Os nove domínios constituem outra forma de agrupamento. Não se deve somar fatores e domínios nem interpretar a diferença entre eles como evidência de independência estatística.",
      "A matriz digital consultada documenta fatores com doze, doze e oito itens. Essa é uma evidência do código atual. Ela não comprova, sozinha, qual versão foi executada em uma coleta passada. A correspondência com a documentação primária do instrumento continua necessária para homologação metodológica.",
      "As barras têm a mesma origem e o mesmo máximo. A maior média é apenas uma descrição dentro da fonte, com empates preservados. Diferenças não foram testadas estatisticamente e uma média maior não elimina dificuldades em itens específicos. O aprofundamento deve combinar a leitura dos itens com perguntas de contexto, respeitando a vida privada e a autonomia das pessoas.",
    ],
    can: "Comparar descritivamente os valores da fonte ativa.",
    cannot: "Isolar causas ou declarar nove escalas validadas.",
    question: "Que experiência concreta ajuda a dar contexto aos agrupamentos?",
  },
  dominios: {
    title: "Explorar com contexto",
    paragraphs: [
      "Os domínios permitem olhar condições de vida, saúde, relações, tempo, governança, cultura, educação e ambiente de maneira multidimensional. São perspectivas de organização dos itens, não diagnósticos. As definições devem ser lidas junto à versão da matriz que produziu os resultados.",
      "A ordem das barras é decrescente por média; empates permanecem visíveis e usam o rótulo apenas como desempate de apresentação. Selecionar uma barra não altera valores nem recalcula qualquer escore. A tabela equivalente oferece a mesma informação sem depender de cor, posição ou tooltip.",
      "A menor média não define automaticamente a primeira intervenção. Considere importância para a equipe, capacidade de ação, alcance, equidade e recursos. O relatório registra pendências na correspondência entre o mapa digital e o questionário de referência. A interface não homologa essa correspondência nem atribui retrospectivamente a matriz atual à coleta. Consulte Metodologia e limites antes de consolidar uma linha de base.",
    ],
    can: "Reconhecer dimensões e todos os empates da fonte.",
    cannot: "Reagrupar itens ou substituir números publicados.",
    question: "Qual dimensão precisa de contexto antes de virar prioridade?",
  },
  recuperacao: {
    title: "Escutar sem diagnosticar",
    paragraphs: [
      "Os itens sobre estresse e sono abrem uma conversa sobre condições e contextos. O enunciado sobre estresse é preservado em sua direção original, sem inversão da pontuação. As médias não informam prevalência de estresse, privação de sono ou burnout. Também não permitem atribuir automaticamente a percepção ao trabalho.",
      "Perguntas possíveis incluem previsibilidade das demandas, simultaneidade de tarefas, possibilidades de pausa e disponibilidade fora da jornada. A equipe pode apontar condições modificáveis sem que ninguém tenha de informar sua resposta à pesquisa ou expor relatos pessoais de saúde. A facilitação deve acolher a opção de não se manifestar.",
      "Um primeiro movimento proposto é escolher um obstáculo operacional e testar um ajuste viável na organização do trabalho. É necessário confirmar responsabilidade, recursos, primeira entrega e forma de acompanhamento. Orientações individuais podem ser apoios complementares; não substituem a revisão das condições nem constituem promessa de eficácia clínica.",
    ],
    can: "Investigar condições modificáveis com participação voluntária.",
    cannot: "Diagnosticar pessoas ou estimar prevalências a partir das médias.",
    question: "Que obstáculo operacional faria sentido examinar primeiro?",
  },
  vida: {
    title: "Apoiar sem invadir",
    paragraphs: [
      "Itens sobre moradia, rendimento, investimento e acesso cultural devem ser lidos sem julgamento. A propriedade da moradia não resume qualidade de vida. Visitas a exposições não constituem meta de desempenho, e hábitos pessoais não devem ser exigidos pela organização.",
      "Antes de definir uma oferta, escute barreiras e preferências. É possível perguntar por temas de interesse e formatos acessíveis sem solicitar renda individual, dívidas, diagnósticos ou detalhes familiares. Horários e oportunidades precisam considerar rotinas diferentes, e a participação deve ser opcional.",
      "Os enunciados que mencionam os últimos doze meses preservam essa janela. Não é adequado tratar uma atividade isolada ou um ciclo curto como teste automático de mudança desses itens. O acompanhamento inicial pode examinar acesso, utilidade percebida e obstáculos, sem metas normativas de felicidade. Apoios educativos, culturais ou financeiros dependem de pertinência confirmada e recursos institucionais; não substituem melhorias nas condições de trabalho.",
    ],
    can: "Conhecer necessidades e ampliar possibilidades de acesso.",
    cannot: "Julgar a pessoa ou impor hábitos de vida privada.",
    question: "O que seria útil e acessível sem exigir exposição pessoal?",
  },
  comunicacao: {
    title: "Da informação à devolutiva",
    paragraphs: [
      "Os itens de comunicação, estratégias, expressão e treinamento permitem formular perguntas sobre clareza e oportunidades de participação. Os números da fonte selecionada não demonstram, isoladamente, assédio ou ausência de segurança psicológica. A compreensão depende do contexto e da escuta da equipe.",
      "Uma proposta é apresentar um resumo periódico das prioridades: o que mudou, por que foi decidido e quais funções respondem pela execução. Outra é aproveitar um canal ou encontro já existente para receber contribuições. A opção reservada precisa de encaminhamento adequado, sem promessa de proteção absoluta que não tenha sido tecnicamente verificada.",
      "O ciclo se completa com retorno sobre o que foi ouvido, o que será feito e o que ainda não será realizado, com suas justificativas. Cadência cumprida, respostas no prazo acordado e utilidade percebida são evidências operacionais possíveis. Não são metas normativas do FIB-T nem prova de melhora causal. Confirme quem pode sustentar o fluxo antes de pactuar.",
    ],
    can: "Examinar fluxos e testar uma rotina de resposta.",
    cannot: "Concluir causalidade ou imputar condutas pelos itens.",
    question: "Quem responde, por qual canal e em que prazo viável?",
  },
  prioridades: {
    title: "Escolher poucas frentes viáveis",
    paragraphs: [
      "As frentes integram propostas de trabalho, relações e apoio. Não são uma decisão automática do instrumento nem compromissos já assumidos pela ISG. A reunião deve confirmar relevância e viabilidade com trabalhadores e direção, mantendo espaço para adaptar ou recusar uma proposta.",
      "Considere importância para a equipe, possibilidade de ação, alcance e equidade, recursos disponíveis e evidência observável. Uma média menor pode abrir uma pergunta, mas não determina sozinha a primeira prioridade. A escuta deve ajudar a identificar um problema concreto que a organização possa modificar sem criar exposição ou sobrecarga.",
      "No quadro, selecione até três frentes. Registre ação, função responsável, prazo, recursos, primeira entrega, evidência de acompanhamento e próxima devolutiva. Nenhum campo pressupõe nomeação ou acordo prévio. O rascunho fica apenas em memória e pode ser exportado localmente após revisão. Não há envio de mensagens, criação de calendário ou persistência em banco nesta etapa.",
    ],
    can: "Pactuar ações concretas depois de confirmar o contexto.",
    cannot: "Prometer aumento do escore ou aprovação institucional automática.",
    question: "Que ação cabe nos recursos e pode ser acompanhada pela equipe?",
  },
  acompanhamento: {
    title: "Três perguntas diferentes",
    paragraphs: [
      "Execução pergunta se o compromisso aconteceu. Ações concluídas em relação às pactuadas, devolutivas realizadas em relação às previstas e responsabilidade documentada são exemplos de indicadores operacionais. Defina linha de base, denominadores e prazos antes de monitorar.",
      "Experiência pergunta se a ação foi útil e acessível. Considere avaliação voluntária, barreiras de acesso e ajustes realizados, sem identificar respostas individuais. Cumprir um calendário não demonstra que todos puderam participar ou que a atividade foi pertinente.",
      "Resultados perguntam o que mudou. Uma nova coleta exige planejamento, versão e regras compatíveis, além de cuidado com população, período e ausência de respostas. Descrever diferenças não autoriza atribuir causalidade automaticamente. Não há meta numérica de felicidade criada nesta apresentação. Itens com janela de doze meses não devem ser reaplicados automaticamente após noventa dias como se a responsividade estivesse demonstrada. A decisão sobre nova avaliação precisa de orientação metodológica própria.",
    ],
    can: "Observar execução e utilidade com critérios definidos.",
    cannot: "Atribuir impacto causal ou inventar metas normativas.",
    question: "Que evidência ajudará o grupo a decidir continuidade ou ajuste?",
  },
};

export const REFERENCES = [
  {
    label: "Furtado, C. A. (2020) · dissertação, UCB",
    href: "https://bdtd.ibict.br/vufind/Record/UCB_4873b7198a2d1272e5ffdc2c9535d1a3",
    status:
      "Referência citada no relatório; texto integral não auditado nesta entrega.",
  },
  {
    label: "OMS (2022) · Mental health at work",
    href: "https://www.ncbi.nlm.nih.gov/sites/books/NBK586355/",
    status:
      "Fundamentação geral para intervenções organizacionais e apoios; sem endosso à ISG.",
  },
  {
    label: "ONS · Data visualisation principles",
    href: "https://service-manual.ons.gov.uk/data-visualisation/guidance/principles",
    status:
      "Referência de clareza e precisão visual; não é benchmark de escores.",
  },
  {
    label: "OECD · Well-being Data Monitor",
    href: "https://www.oecd.org/en/data/tools/well-being-data-monitor/current-well-being.html",
    status:
      "Inspiração multidimensional, sem comparação com os resultados da organização.",
  },
  {
    label: "IES/WWC (2007) · Organizing Instruction and Study",
    href: "https://ies.ed.gov/ncee/wwc/PracticeGuide/1",
    status:
      "Adaptação pedagógica de design; eficácia não avaliada experimentalmente na ISG.",
  },
  {
    label: "Instituto Felicidade para Todos",
    href: "https://felicidadeparatodos.com.br/",
    status: "Site institucional público; marca consultada para esta interface.",
  },
  {
    label: "ISG",
    href: "https://www.isgsa.com.br/",
    status: "Site institucional público; marca consultada para esta interface.",
  },
];
