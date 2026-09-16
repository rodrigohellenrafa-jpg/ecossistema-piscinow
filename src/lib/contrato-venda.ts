/**
 * Texto do "Instrumento particular de contrato de venda" (Splash Campinas / Jardim do Trevo),
 * transcrito do PDF original, para geração do contrato já preenchido com os dados do pedido.
 */

export type ClausulaSecao = { titulo: string; itens: string[] };

export const CONTRATO_CABECALHO = {
  empresa: "RODRIGO GONÇALVES DA SILVA – ME",
  documento: "CNPJ: 26.108.962/0001-52",
  telefone: "FONE: 19 3272-1000",
  email: "campinasjardimdotrevo@splashpiscinas.com",
  endereco: "Rua Clodomiro Franco de Andrade Junior, 96 - Jardim Leonor, Campinas - SP",
  titulo: "INSTRUMENTO PARTICULAR DE CONTRATO DE VENDA",
  preambulo:
    "Pelo presente instrumento particular de contrato de venda denominado QUADRO DE CONTRATO DE VENDA, as partes envolvidas ajustam a compra e venda conforme cláusulas abaixo estabelecidas, a saber:",
};

export const CONTRATO_CLAUSULAS: ClausulaSecao[] = [
  {
    titulo: "I) DO OBJETO DE COMPRA E VENDA",
    itens: [
      "1.1. Neste ato, e na melhor forma de direito, a EMPRESA CONTRATADA vende ao COMPRADOR: Piscina de fibra SPLASH modelo ESPECIFICADO NO ITEM 6 DO QUADRO DE CONTRATO DE VENDA fabricada pela empresa IGUI, devidamente instalada. Além da piscina inclui-se na instalação os seguintes itens: Casa de máquinas (ESPECIFICADO NO QUADRO DE CONTRATO DE VENDA BEM COMO SEUS DISPOSITIVOS), Quadro de comando uma vez adquirido. Incluso também, mão de obra desde a escavação até o aterramento dela (vide páginas) além do kit de limpeza (aspirador, cabo telescópico, peneira, super side esponja).",
    ],
  },
  {
    titulo: "II) DO PREÇO",
    itens: [
      "2.1. Os produtos e serviços adquiridos neste instrumento, pelo COMPRADOR, possuem o valor total definido NA ÚLTIMA LINHA DO ITEM 6, em moeda corrente (REAIS).",
    ],
  },
  {
    titulo: "III) DA CONDIÇÃO DE PAGAMENTO",
    itens: [
      "3.1. A serem pagos pelo COMPRADOR da presente forma explanada no QUADRO DE CONTRATO DE VENDA (ITEM 7).",
    ],
  },
  {
    titulo: "IV) DA FORMA DE PAGAMENTO (PROPRIAMENTE DITA)",
    itens: [
      "4.1. Toda forma de pagamento oferecida pela EMPRESA CONTRATADA está sujeita a análise de crédito.",
      "4.2. Independente da moeda de transação de pagamento (cheque, débito em conta ou boleto bancário). Essa, por sua vez, será determinada pela financiadora parceira da empresa CONTRATADA.",
      "4.2.1. Para negociações sem mediação, ou seja, diretamente com a empresa contratada, o pagamento deverá ser realizado antes da instalação do produto adquirido em sua totalidade. (COMPRA PROGRAMADA)",
      "4.3. O COMPRADOR(A) autoriza a cessão parcial ou integral dos créditos de vendas sob qualquer forma de pagamento (ITEM 7).",
      "4.4. Durante o processo de instalação, em caso de atraso ou de não pagamento/quitação dos débitos em aberto, acarretará multa de 2% (dois por cento) ao mês desde o vencimento além da multa por atraso de 15% (quinze por cento) sobre o valor TOTAL DO CONTRATO, além ainda da suspensão total do serviço, prazos e garantias.",
      "4.4.1. O COMPRADOR(a) autoriza a emissão de um boleto no valor da multa, com a data de vencimento para 15 (quinze) dias corridos da data do vencimento da parcela em atraso, ou em caso de desistência e/ou cancelamento.",
      "4.5. Havendo a quitação dos débitos, o serviço será restabelecido no prazo de 48 horas, levando em conta o aumento do prazo de entrega referente ao tempo de inadimplência.",
      "4.6. Em caso de desistência e/ou cancelamento da compra por qualquer motivo, será cobrada uma multa rescisória de 30% (trinta por cento) sobre o valor total do contrato.",
      "4.6.1. Não havendo pagamento, a empresa CONTRATADA readmitirá o bem em questão especificado neste presente instrumento de compra e venda, mantendo as penalidades cabíveis.",
      "4.7. No caso do produto instalado, não havendo o pagamento ou a quitação dos débitos em aberto, acarretará multa de 2% (dois por cento) ao mês desde o vencimento além da multa por atraso de 15% (quinze por cento) sobre o valor TOTAL DO CONTRATO.",
      "4.7.1. Se o prazo se estender por um período maior que 15 (quinze) dias corridos, nos reservamos ao direito de protesto das parcelas, independentemente da forma de pagamento. Acima de 90 dias, não havendo pagamento por parte do COMPRADOR, a empresa CONTRATADA, mais uma vez, salvará ao direito de PROTESTAR O CONTRATO.",
      "4.7.2. E, por fim, acima de 120 dias, não havendo manifestação de nenhuma natureza por parte do COMPRADOR, o bem em questão contido neste INSTRUMENTO DE COMPRA E VENDA será readmitido pela empresa CONTRATADA na forma de busca e apreensão e o CPF do COMPRADOR em questão será protestado e negativado pelos órgãos competentes.",
    ],
  },
  {
    titulo: "V) DO ESTADO DE CONSERVAÇÃO DO PRODUTO E RESERVA DO DOMÍNIO DO BEM",
    itens: [
      "5.1. Fica reservado à empresa CONTRATADA, conforme requerido neste instrumento de compra e venda, a propriedade do bem em questão, até a quitação total das parcelas.",
      "5.2. A limpeza e conservação do produto requerido neste documento, bem como sua integridade, estrutura, suas funções e aparência são de total OBRIGAÇÃO DO COMPRADOR, responsabilizando-o diretamente até o término e/ou quitação das parcelas/débitos.",
    ],
  },
  {
    titulo: "VI) PRAZO DE ENTREGA",
    itens: [
      "6.1. O prazo de entrega do produto devidamente instalado segue especificado no cabeçalho do QUADRO DE CONTRATO DE VENDA (ITEM 1), a ser contado a partir do produto 100% FATURADO, e não da data da compra, independentemente da forma de pagamento combinada entre a empresa CONTRATADA e o COMPRADOR. Salvo o direito de mudança de prazo de entrega caso haja algumas das situações descritas abaixo:",
      "6.2. Para cada dia de chuva, será acrescentado mais 2 (dois) dias no prazo de entrega/instalação ou a quantidade necessária de dias, a fim de encontrarmos o local em condições de executarmos o trabalho sem nenhum tipo de risco para os profissionais envolvidos bem como o produto adquirido neste instrumento de compra e venda.",
      "6.2.1. A quantidade de dias referentes ao prazo de inadimplência será multiplicada por 2 (dois) e acrescentada ao prazo de entrega.",
      "6.2.2. Falta de materiais básicos solicitados ao COMPRADOR ou até mesmo a falta de água e/ou energia elétrica.",
    ],
  },
  {
    titulo: "VII) GARANTIAS",
    itens: [
      "7.1. A empresa CONTRATADA garante o perfeito estado de funcionamento, sendo competentes as garantias abaixo descritas:",
      "7.1.2. 1 ANO DE GARANTIA para o tanque (casco) contra defeitos estruturais de acordo com o certificado de garantia que será entregue ao final da obra da piscina com as devidas ressalvas;",
      "7.1.3. 1 ANO DE GARANTIA para casa de máquinas, apenas contra defeitos de fábrica de acordo com o certificado de garantia;",
      "7.1.4. 1 ANO DE GARANTIA para o motor correspondente à casa de máquinas, DIRETAMENTE NA ASSISTÊNCIA TÉCNICA;",
      "7.1.5. 1 ANO DE GARANTIA para mão de obra em geral conforme etapas descritas neste DOCUMENTO.",
      "7.2. A EMPRESA CONTRATADA não terá nenhuma responsabilidade caso o COMPRADOR não siga à risca todas as questões pertinentes a este instrumento de compra e venda.",
      "7.2.1. O mau uso da instalação ou até mesmo o uso de mão de obra própria ou terceira nos serviços prestados suspenderá imediatamente as garantias.",
      "7.2.2. O uso da piscina antes da feitura do contrapiso, ou até mesmo a não feitura do contrapiso em um prazo máximo de 03 (três) dias, suspenderá automaticamente as garantias, independentemente da entrega do certificado, SE TORNANDO IRREVOGÁVEL.",
    ],
  },
  {
    titulo: "VIII) OBRIGAÇÕES E DEVERES — DO MATERIAL BÁSICO",
    itens: [
      "8.1.1. Caberá ao COMPRADOR o fornecimento INTEGRAL dos materiais básicos (itens prioritários: areia, cimento e água para encher, seja da rede ou caminhão pipa, fios e conduítes) em quantidades aproximadas, podendo sofrer variação para mais ou para menos de acordo com a situação da obra. O COMPRADOR fica ciente que, em caso de falta de material, novas remessas serão solicitadas. E, por fim, os materiais extras em caso de piscina fora do padrão estabelecido pelo fabricante (duto ecológico, tubo 150mm, conexões, fios e eletrodutos ou todo material que estiver fora dos padrões).",
      "8.1.2. Itens secundários: pedra brita, malhas de ferro, blocos de concreto, tubos e conexões, barras de aterramento, isopor etc. (materiais só deverão ser adquiridos se solicitado pela equipe terceirizada responsável pela instalação da obra).",
      "8.1.3. Se durante o período de obras ou de feitura do contrapiso acontecer de chover ou quaisquer situações que atrasem ou gerem prejuízo para a obra em si, seja financeiro ou estrutural, o COMPRADOR assumirá total responsabilidade pelos custos de uma nova remessa de materiais ou pelo atraso.",
      "8.1.4. Por fim, em caso de dano oculto, ou seja, situações que só são descobertas após o início da obra, neste caso, outros materiais poderão ser solicitados, bem como maquinário necessário.",
    ],
  },
  {
    titulo: "IX) DA ENTREGA DO PRODUTO E PASSAGEM PARA O TERRENO",
    itens: [
      "9.1. POR CONTA DA EMPRESA CONTRATADA: o transporte do produto até o portão da casa do COMPRADOR.",
      "9.2. POR CONTA DO COMPRADOR: no caso de passagem simples, como por exemplo muro ou portão, o COMPRADOR fica responsabilizado de providenciar de 7 (sete) a 10 (dez) pessoas para a descarga e passagem do produto no interior de sua residência, isentando assim a EMPRESA CONTRATADA de tal responsabilidade.",
      "9.2.1. Em caso de passagem para o fundo do terreno, por cima da casa ou por conta do difícil acesso, o COMPRADOR ficará responsável por contratar o maquinário necessário para o desenrolar do serviço (caminhão Munck ou guindaste, de acordo com a necessidade) bem como o pagamento integral deste serviço.",
      "9.3. Em uma situação de passagem manual, seja essa feita pelo telhado da casa do COMPRADOR ou se necessário pelo telhado ou terreno do vizinho, ou qualquer outra situação, o COMPRADOR fica diretamente responsável por qualquer dano causado, ex.: telha quebrada, remoção e troca da mesma, calhas amassadas, riscos ou deformações na estrutura da piscina, e principalmente a integridade física dos envolvidos na passagem. SERVIÇO REALIZADO MEDIANTE ORÇAMENTO.",
    ],
  },
  {
    titulo: "X) DA INSTALAÇÃO — ESCAVAÇÃO",
    itens: [
      "10.1. POR CONTA DA EMPRESA CONTRATADA: a CONTRATADA fica responsável pela escavação integral (LADO X LADO X PROFUNDIDADE), de acordo com as especificações contidas na AUTORIZAÇÃO DE OBRA.",
      "10.1.2. A EMPRESA CONTRATADA salva o direito de realizar a escavação da maneira que julgar necessária para a presente obra (escavação manual ou através de máquina modelo Bobcat ou similar).",
      "10.1.3. A terra de escavação ficará ao lado da piscina, sendo de total responsabilidade do COMPRADOR.",
      "10.1.4. Em caso de dificuldade de acesso ao local de escavação, será realizado um orçamento à parte, a fim de tornar o local apropriado para instalação e validação de garantias.",
      "10.2. POR CONTA DO COMPRADOR: o COMPRADOR fica terminantemente responsável pelo destino que se dará à terra de escavação, bem como a mão de obra de retirada, caçambas e seus respectivos pagamentos.",
      "10.2.1. RECOMENDA-SE retirar a terra simultaneamente à escavação, a fim de evitar a paralisação da obra por conta do acúmulo e sujeira.",
      "10.2.2. REMOÇÃO DE OBSTÁCULOS SENDO: árvores, raízes, baldrames, alicerces, fossas e/ou poços desativados, contrapisos, rochas, linhas elétricas, hidráulicas ou esgoto, lençol freático, entulhos, aterros etc. Havendo alguns desses citados ou similares, será realizado um orçamento à parte para remoção ou enquadramento nas especificações. Não nos responsabilizamos por linhas hidráulicas e/ou elétricas que estejam ativas e que possam ser danificadas durante a escavação.",
      "NOTA IMPORTANTE: o volume de terra produzido por uma escavação é enorme. Portanto, caso haja preocupação com os ambientes no entorno da obra, é ideal que proteja os mesmos com lonas plásticas ou qualquer outro material resistente à sujeira.",
    ],
  },
  {
    titulo: "XI) DO NIVELAMENTO E ESQUADRO",
    itens: [
      "11.1. POR CONTA DA EMPRESA CONTRATADA: mão de obra para realização do serviço designado, havendo tolerância de 2 cm (centímetros) de desnível e de 10 cm (centímetros) para o esquadrejamento.",
      "11.2. POR CONTA DO COMPRADOR: o ponto do nível e o esquadro deverão ser informados pelo COMPRADOR através da ORDEM DE SERVIÇO. Essa informação será a “viga mestre” para início dos trabalhos e é de total responsabilidade do COMPRADOR.",
      "11.2.1. Depois da obra iniciada, quaisquer mudanças solicitadas após a assinatura ou autorização da ORDEM DE SERVIÇO, seja impressa ou por vídeo, deverão ser aprovadas pela empresa CONTRATADA. Caso seja aprovado, será realizado um NOVO ORÇAMENTO para que seja efetuada tal alteração.",
      "11.2.2. O fornecimento dos materiais básicos para a construção da base (areia e cimento) nas quantidades especificadas NO QUADRO DE CONTRATO DE VENDA, podendo sofrer variação.",
      "11.2.3. PAREDE DE CONTENÇÃO, CASO O NÍVEL DA PISCINA SEJA ACIMA DO NÍVEL DO PISO, DE ACORDO COM O ACABAMENTO, BEM COMO A AREIA E O CIMENTO PRÓXIMOS AO LOCAL, SIMULTANEAMENTE COM A INSTALAÇÃO, PARA QUE A PISCINA POSSA SER REATERRADA DE FORMA CORRETA, ASSEGURANDO AS GARANTIAS DE INSTALAÇÃO E O TEMPO COMBINADO PARA A ENTREGA DO SERVIÇO.",
      "11.2.4. E, por fim, o material básico solicitado pela empresa CONTRATADA ao COMPRADOR, neste caso areia e cimento, deverá encontrar-se a uma distância máxima da escavação de até 5 metros.",
    ],
  },
  {
    titulo: "XII) DA FURAÇÃO E PARTE HIDRÁULICA",
    itens: [
      "12.1. POR CONTA DA EMPRESA CONTRATADA: mão de obra para a realização do serviço designado, bem como tubos e conexões exclusivas IGUI.",
      "12.1.2. A furação dos dispositivos de hidromassagem é padronizada.",
      "12.1.3. Os dispositivos de retorno e de espera para aquecimento serão posicionados de acordo com a posição do flange, que deverá ser informada pelo COMPRADOR através da AUTORIZAÇÃO DE OBRA.",
      "12.2.2. UMA VEZ ADQUIRIDO, 2 (dois) pontos de hidromassagem, interligados entre os dispositivos e a casa de máquinas.",
      "12.2.3. 1 (um) ponto de retorno, interligado entre o dispositivo e a casa de máquinas.",
      "12.2.3.2. UMA VEZ ADQUIRIDO, 1 (um) ponto de espera para cascata. CASCATA NÃO INCLUSA.",
      "12.2.3.3. NÃO INSTALAMOS, EM NENHUMA HIPÓTESE, CASCATA, CORRIMÃO OU QUALQUER DISPOSITIVO DE TERCEIROS SEM PRÉVIO ORÇAMENTO.",
      "12.2.4. UMA VEZ ADQUIRIDO, 1 (um) dispositivo de retorno de ESPERA para aquecimento saindo do dispositivo, e a outra ponta esperando próximo à casa de máquinas.",
      "12.2.5. UMA VEZ ADQUIRIDO, 1 (uma) captação de água fria (entrada) de espera para o aquecedor da casa de máquinas e esperando próximo à mesma.",
      "12.2.6. A posição do flange (captação de água) deverá ser informada pelo COMPRADOR através da AUTORIZAÇÃO DE OBRA, sendo instalada no padrão do fabricante (30 cm). Caso opte por sair do padrão do fabricante, vide cláusula 8.1.1.",
      "12.7. POR CONTA DO COMPRADOR: nesta etapa o COMPRADOR apenas informa o posicionamento do flange e casa de máquinas através da AUTORIZAÇÃO DE OBRA.",
      "12.7.1. Ponto de entrada de água da rede até o exato ponto da casa de máquinas (opcional).",
      "12.7.3. DOS DRENOS DE SEGURANÇA E DA PISCINA — POR CONTA DA EMPRESA CONTRATADA: os drenos de segurança (2 no filtro SPLASH) serão instalados com 1 metro de duto ecológico EXCLUSIVO iGUi, bem como o dreno da piscina (bombeado).",
      "12.8. POR CONTA DO COMPRADOR: ponto de escoamento da rede até o local exato da casa de máquinas.",
      "12.8.1. Interligar a tubulação DA PISCINA à tubulação de escoamento de água da rede mais próxima, principalmente se tratando do dreno bombeado.",
      "12.8.2. Caso não haja rede pronta, o COMPRADOR deverá providenciar tal escoamento para o dreno bombeado.",
      "12.8.3. E, para os drenos de segurança, que funcionam através de gravidade, o escoamento (da própria tubulação de escoamento ou através de caixa seca, conforme ilustrado e anexo ao contrato) torna-se necessário para assegurar o pleno funcionamento da casa de máquinas.",
      "Obs.: é primordial que o profissional que realizará tal interligação tenha conhecimento total em hidráulica, pois quaisquer ligações erradas ou não realizadas acarretarão grandes prejuízos para o COMPRADOR. Pedimos a gentileza de entrar em contato com a revendedora para possíveis dúvidas.",
    ],
  },
  {
    titulo: "XIII) DO CALÇAMENTO",
    itens: [
      "13.1. POR CONTA DA EMPRESA CONTRATADA: mão de obra de execução do serviço designado.",
      "13.2. POR CONTA DO COMPRADOR: materiais básicos, neste caso em específico areia, cimento e blocos de concreto* nas dimensões 0,14x0,19x0,39 com fundo fechado *(apenas se solicitado), fios e eletrodutos, e materiais extras (fora do padrão especificado pelo fabricante, cláusula 8.1.1), que deverão estar a uma distância máxima de 5 metros do local da instalação.",
    ],
  },
  {
    titulo: "XIV) DA CASA DE MÁQUINAS",
    itens: [
      "14.1. POR CONTA DA EMPRESA CONTRATADA: mão de obra de instalação de ambos os serviços designados, dentro das especificações orientadas pelo fabricante (padrão 30 cm).",
      "14.2. POR CONTA DO COMPRADOR: informar a posição requerida dos itens em questão, seguindo as especificações do fabricante.",
      "14.2.1. Se ainda assim o COMPRADOR preferir sair do padrão sugerido pelo fabricante, o mesmo deverá assumir os custos da tubulação e parte elétrica extras necessárias e estar ciente de que a garantia de instalação diminuirá de 365 DIAS para 90 DIAS, bem como a garantia da casa de máquinas.",
    ],
  },
  {
    titulo: "XV) DO QC MAX",
    itens: [
      "15.1. POR CONTA DA EMPRESA CONTRATADA: UMA VEZ ADQUIRIDO, mão de obra de instalação do item designado, seguindo as especificações do fabricante (distância máxima da casa de máquinas de 3 metros em linha reta).",
      "15.2. POR CONTA DO COMPRADOR: UMA VEZ ADQUIRIDO, materiais elétricos (fios, cabos e eletrodutos).",
      "15.2.1. Ponto de energia da rede até o exato ponto da casa de máquinas, onde será instalado o QC MAX.",
      "15.2.2. Caso não haja rede pronta no local, nossos profissionais realizarão o teste através de extensão, a fim de comprovar o pleno funcionamento dos componentes elétricos e hidráulicos que são acionados através de energia. NÃO RETORNAMOS PARA LIGAÇÕES POSTERIORES.",
      "15.2.3. Por fim, a entrega da obra e, consequentemente, a ligação da rede elétrica definitiva.",
    ],
  },
  {
    titulo: "XVI) DO REATERRO",
    itens: [
      "16.1. POR CONTA DA EMPRESA CONTRATADA: para piscinas niveladas com o piso, ou no máximo 10 cm acima do nível, o aterro será deixado com no máximo 20 cm abaixo do nível da borda baixa, SEM COMPACTAÇÃO DO SOLO, conforme explanação do vendedor técnico.",
      "16.1.2. Para piscinas acima de 20 cm acima do nível do piso, a empresa CONTRATADA se compromete a realizar o reaterro da piscina respeitando os 20 cm abaixo da borda baixa, e essa mesma distância em um raio de no máximo 20 cm ao redor da piscina, cabendo ao COMPRADOR a complementação do ambiente através de sua própria mão de obra ou terceira.",
      "16.1.3. O aterramento da piscina será realizado com areia e cimento ao redor, fornecidos pelo COMPRADOR.",
      "16.1.4. Caso o COMPRADOR opte por aterrar com a terra de escavação, por qualquer motivo que seja, a garantia da mão de obra de instalação passará de 365 DIAS para 90 DIAS.",
      "16.2. POR CONTA DO COMPRADOR: materiais básicos para o reaterro do tanque da piscina (areia e cimento) nas quantidades especificadas em contrato.",
      "16.2.1. A complementação do solo, em caso de piscinas acima de 20 cm do nível do terreno, ou mesmo no nível do terreno, bem como a COMPACTAÇÃO TOTAL DO SOLO AO REDOR DA PISCINA, deverá ser realizada através de mão de obra própria ou terceira contratada pelo COMPRADOR, eximindo a empresa CONTRATADA de quaisquer responsabilidades.",
      "16.2.2. Reforçamos que toda terra de escavação que a obra produzir será deixada no entorno da piscina, sendo de TOTAL RESPONSABILIDADE DO COMPRADOR, em qualquer etapa da obra, a sua remoção ou o destino que se dará, bem como a contratação de mão de obra terceira e caçambas; havendo preocupação com o entorno do ambiente de obra, proteger com lonas ou qualquer outro material resistente à sujeira.",
    ],
  },
  {
    titulo: "XVII) TREINAMENTO",
    itens: [
      "17.1. POR CONTA DA EMPRESA CONTRATADA: a mesma realizará o treinamento físico e o check-list da obra.",
      "17.2. Os produtos químicos, uma vez adquiridos na mesma revenda, como cortesia, realizaremos um treinamento na loja para seu uso (agendamento prévio necessário).",
      "17.2.1. POR CONTA DO COMPRADOR: estar presente no momento da entrega técnica.",
      "17.2.2. Caso não possa comparecer, o COMPRADOR deverá enviar um e-mail para a empresa CONTRATADA autorizando uma pessoa de sua confiança para receber tal instrução.",
      "17.3. Se ainda assim não houver essa pessoa, o treinamento deverá ser realizado na loja onde o produto foi adquirido.",
      "17.3.1. O COMPRADOR deverá fazer a primeira limpeza física de sua piscina. Portanto, é primordial que compareça à instrução de treinamento na data do encerramento ou o mais rápido possível.",
    ],
  },
  {
    titulo: "XVIII) DO ACABAMENTO",
    itens: [
      "Todas as questões abordadas neste parágrafo são de TOTAL RESPONSABILIDADE DO COMPRADOR.",
      "18.1. O acabamento da piscina (contrapiso e pedras, madeiras e afins) deverá ser disposto conforme ilustração anexa ao documento de preenchimento de compra.",
      "18.2. Mão de obra própria ou contratação de mão de obra terceira para tal realização.",
      "18.3. Conforme cláusula 7.2.2, o tempo máximo para realização do contrapiso é de 03 (três) dias corridos.",
      "18.4. A empresa CONTRATADA não possui nenhum tipo de responsabilidade nessa etapa da obra.",
      "18.5. Havendo danos posteriores, após a assinatura do check-list de entrega da obra, será realizado orçamento à parte.",
      "18.6. FICA EXPRESSAMENTE PROIBIDA A CONTRATAÇÃO DE MÃO DE OBRA DOS NOSSOS PROFISSIONAIS DE INSTALAÇÃO, POIS OS MESMOS NÃO ESTÃO APTOS PARA TAL SERVIÇO, INCLUINDO TAMBÉM COMPRA DE ACESSÓRIOS DE TODO TIPO E, POR FIM, INDICAÇÕES DE MÃO DE OBRA PARA A EXECUÇÃO DESTE SERVIÇO. SE AINDA ASSIM PREFERIR, A EMPRESA CONTRATADA SE EXIME DE QUAISQUER RESPONSABILIDADES.",
    ],
  },
  {
    titulo: "XIX) OBSERVAÇÕES GERAIS",
    itens: [
      "19.1. É necessário ressaltar neste instrumento de compra e venda que durante o período de obras haverá muita bagunça e muita sujeira devido à sua proporção. Neste ponto a empresa CONTRATADA se exime de quaisquer responsabilidades, por se tratar de uma situação natural dentro do segmento.",
      "19.2. A tolerância das partes entre si quanto a eventuais descumprimentos de disposições do presente contrato não constituirá renúncia aos direitos mutuamente ora conferidos, nem poderá ser tida como renovação, permanecendo sob qualquer circunstância plenamente íntegras as cláusulas deste contrato, como se não houvesse havido qualquer tipo de tolerância.",
      "19.3. Caso qualquer disposição deste contrato ou dos respectivos anexos seja desconsiderada, o restante do instrumento continuará a vigorar normalmente.",
      "19.4. Ocorrendo inevitavelmente o parágrafo OBS do ITEM 8 DO QUADRO DE CONTRATO DE VENDA, desde já as partes se comprometem a selar o acordo o mais rápido possível.",
      "19.5. O presente instrumento de compra e venda constitui o entendimento único e integral entre as partes e substitui todos os acordos, cartas de intenção e entendimentos anteriores entre as partes.",
      "19.6. Os signatários identificados declaram não existir em vigor nenhum contrato, obrigação, gravame ou ônus que impeça o cumprimento das obrigações assumidas neste DOCUMENTO de compra e venda, além de serem legal e formalmente habilitados para a assinatura do DOCUMENTO.",
    ],
  },
  {
    titulo: "XX) DA MANUTENÇÃO",
    itens: [
      "No caso de manutenção envolvendo garantias, independentemente do motivo, a garantia se estende apenas aos produtos adquiridos neste QUADRO DE CONTRATO DE VENDA, eximindo a empresa CONTRATADA de quaisquer responsabilidades com serviços terceiros e de acabamento. Exemplo: contrapiso, pedras, pisos, gramados, deck em geral.",
      "E, por estarem as partes justas e contratadas, cientes de todas as cláusulas dela decorrentes, firmam o presente instrumento de compra e venda em 02 (duas) vias de igual teor e forma, na presença de testemunhas, para que possa produzir seus regulares efeitos de direito.",
    ],
  },
];

export const CONTRATO_ANEXO_DRENOS = [
  "CUIDADOS QUE O NOSSO AMIGO PEDREIRO/ENCANADOR PRECISA TOMAR ANTES DO CONTRAPISO",
  "Todos os drenos da piscina deverão estar afastados de todos os ralos do ambiente e entre si, a fim de evitar acúmulo e produzir retorno de água. A distância mínima entre as mangueiras (drenos do motor, compartimento do motor, compartimento de água e dos registros) deverá ser de 50 cm (cinquenta centímetros) entre si, conforme ilustração.",
  "NOTA IMPORTANTE: o registro de dreno do motor (4) e o dreno do compartimento de água (1) deverão estar obrigatoriamente interligados à rede hidráulica de água fluvial. Os drenos dos compartimentos do motor (3) e do compartimento dos registros (2) deverão ser interligados à rede hidráulica apenas se o ambiente oferecer queda mínima necessária, pois funcionam por gravidade. Caso não ofereça, basta escavar uma caixa seca com as seguintes dimensões: 0,30 x 0,30 x 1,00 (comprimento x largura x profundidade) e preencher com areia e pedra.",
];
