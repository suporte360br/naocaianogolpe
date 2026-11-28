/* Validador de golpes — Não Caia no Golpe
   Tudo roda no navegador: o texto, o print e as respostas não são enviados a nenhum servidor
   e não ficam guardados. O OCR (Tesseract.js, Apache 2.0) é carregado só quando a pessoa envia um print. */
(function () {
  'use strict';
  var raiz = document.getElementById('validador');
  if (!raiz) return;

  // ---------- utilidades ----------
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function tem(t, lista) { for (var i = 0; i < lista.length; i++) { if (t.indexOf(lista[i]) !== -1) return lista[i]; } return null; }
  function el(tag, attrs, filhos) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else e.setAttribute(k, attrs[k]); }
    (filhos || []).forEach(function (f) { if (f) e.appendChild(f); });
    return e;
  }

  // ---------- links ----------
  var OFICIAIS = ['gov.br', 'bb.com.br', 'itau.com.br', 'bradesco.com.br', 'santander.com.br', 'nubank.com.br', 'inter.co', 'bancointer.com.br',
    'c6bank.com.br', 'picpay.com', 'mercadopago.com.br', 'mercadolivre.com.br', 'correios.com.br', 'serasa.com.br', 'magazineluiza.com.br',
    'amazon.com.br', 'shopee.com.br', 'ifood.com.br', 'livelo.com.br', 'sicoob.com.br', 'sicredi.com.br', 'caixa.gov.br', 'naocaianogolpe.com.br',
    'whatsapp.com', 'instagram.com', 'youtube.com', 'google.com', 'facebook.com', 'airbnb.com.br', 'booking.com'];
  var MARCAS = ['itau', 'bradesco', 'caixa', 'santander', 'nubank', 'correios', 'receita', 'gov', 'inss', 'detran', 'serasa', 'mercadolivre',
    'magalu', 'shopee', 'amazon', 'ifood', 'livelo', 'banco', 'picpay', 'sicoob', 'sicredi', 'bancodobrasil', 'sefaz', 'ipva', 'pix', 'cnh', 'meuinss', 'govbr', 'apple', 'iphone', 'samsung', 'americanas', 'casasbahia', 'netflix', 'whatsapp', 'instagram', 'magazine', 'bb'];
  var ENCURTADORES = ['bit.ly', 'tinyurl', 'cutt.ly', 'is.gd', 'rb.gy', 'encurtador', 'shorturl', 'ow.ly', 't.ly', 'abre.ai', 'l1nk', 'tiny.cc', 'goo.su', 'v.gd'];
  var TLD_RUINS = ['top', 'xyz', 'online', 'site', 'click', 'shop', 'icu', 'live', 'info', 'vip', 'buzz', 'tk', 'ml', 'ga', 'cf', 'gq', 'cc', 'store', 'cyou', 'sbs', 'lol', 'rest', 'fun'];

  function extrairLinks(texto) {
    var re = /\b((?:https?:\/\/|www\.)[^\s<>"'()]+|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|net|org|br|top|xyz|online|site|click|shop|icu|live|info|vip|buzz|me|io|co|app|link|ly|cc|tk|ml|ga|cf|gq|store|cyou|sbs|lol|rest|fun|gd)(?:\/[^\s<>"'()]*)?)/gi;
    var achados = [], m;
    while ((m = re.exec(texto)) !== null) {
      var bruto = m[1].replace(/[.,;:!?]+$/, '');
      var host = bruto.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split(/[\/?#]/)[0].toLowerCase();
      if (!/[a-z]/.test(host.replace(/\.[a-z]+$/, ''))) continue; // ignora coisas como "4.800"
      achados.push({ bruto: bruto, host: host, http: /^http:\/\//i.test(bruto) });
    }
    return achados;
  }
  function oficial(host) { return OFICIAIS.some(function (d) { return host === d || host.slice(-(d.length + 1)) === '.' + d; }); }
  function avaliarLink(l) {
    var motivos = [], peso = 0;
    if (oficial(l.host)) return { peso: 4, motivos: ['o endereço parece oficial (' + l.host + '), mas golpistas também mandam links parecidos: prefira digitar o site ou abrir o aplicativo você mesmo'] };
    var tld = l.host.split('.').pop();
    if (ENCURTADORES.some(function (e) { return l.host.indexOf(e) !== -1; })) { peso = Math.max(peso, 28); motivos.push('é um link encurtado, que esconde o endereço verdadeiro'); }
    if (/^\d+\.\d+\.\d+\.\d+$/.test(l.host)) { peso = Math.max(peso, 35); motivos.push('o endereço é só um número (IP), coisa que empresas sérias não usam'); }
    if (l.host.indexOf('xn--') !== -1) { peso = Math.max(peso, 35); motivos.push('o endereço usa letras disfarçadas para imitar outro site'); }
    var hostSemPonto = l.host.replace(/[.-]/g, '');
    var marca = MARCAS.filter(function (b) { return hostSemPonto.indexOf(b) !== -1; })[0];
    if (marca) { peso = Math.max(peso, 40); motivos.push('usa o nome "' + marca + '" num endereço que não é o oficial'); }
    if (/oficial|seguro|segura|atualiza|desbloq|promo|premio|resgate/.test(l.host)) { peso = Math.max(peso, 30); motivos.push('usa palavras como “oficial”, “seguro” ou “promo” no endereço, truque comum de sites falsos'); }
    if (TLD_RUINS.indexOf(tld) !== -1) { peso = Math.max(peso, 25); motivos.push('termina em ".' + tld + '", final muito usado em sites falsos'); }
    if (/gov/.test(l.host) && !/\.gov\.br$/.test(l.host)) { peso = Math.max(peso, 40); motivos.push('fala em "gov" mas não termina em .gov.br'); }
    if ((l.host.match(/-/g) || []).length >= 2) { peso = Math.max(peso, 18); motivos.push('tem muitos hífens, comum em endereços falsos'); }
    if (l.http) { peso = Math.max(peso, 12); motivos.push('não usa conexão segura (https)'); }
    if (!motivos.length) { peso = 12; motivos.push('é um site desconhecido: não clique sem conferir quem é o dono'); }
    return { peso: peso, motivos: motivos };
  }

  // ---------- regras de texto ----------
  // cada regra: termos (sem acento), peso (0-100), título, explicação e guia
  var R = [
    { id: 'codigo', peso: 60, termos: ['codigo de verificacao', 'codigo que chegou', 'codigo de 6', 'codigo por sms', 'me passa o codigo', 'me manda o codigo', 'envie o codigo', 'informe o codigo', 'passa o codigo', 'token', 'codigo de seguranca', 'codigo de confirmacao'],
      titulo: 'Pede código ou token', txt: 'Nenhuma empresa, banco ou conhecido precisa do código que chegou por SMS. Com ele, o golpista clona o seu WhatsApp ou entra nas suas contas.', guia: ['whatsapp-clonado', 'WhatsApp clonado'] },
    { id: 'senha', peso: 45, termos: ['sua senha', 'digite a senha', 'digitar a senha', 'informe a senha', 'confirme a senha', 'senha do cartao', 'senha do banco', 'senha do aplicativo', 'senha do gov'],
      titulo: 'Pede senha', txt: 'Banco, INSS e empresas nunca pedem senha por mensagem ou telefone.', guia: ['falsa-central', 'falsa central'] },
    { id: 'numero', peso: 40, termos: ['troquei de numero', 'numero novo', 'novo numero', 'meu numero novo', 'mudei de numero', 'esse e meu novo', 'este e meu novo', 'salva esse numero', 'salva este numero', 'perdi meu celular', 'celular quebrou', 'celular caiu'],
      titulo: 'Contato com “número novo”', txt: 'É o começo do golpe do falso parente. Antes de qualquer pagamento, ligue para o número antigo da pessoa.', guia: ['whatsapp-clonado', 'falso parente'] },
    { id: 'pix', peso: 22, termos: ['pix', 'transferencia', 'transfere', 'transferir', 'deposito', 'deposita', 'chave aleatoria', 'qr code', 'boleto', 'ted ', 'paga pra mim', 'me empresta'],
      titulo: 'Pede dinheiro, Pix ou boleto', txt: 'Todo golpe termina num pagamento. Confira o nome de quem recebe antes de confirmar: precisa ser a empresa ou a pessoa que você conhece.', guia: ['golpes-pix', 'golpes do Pix'] },
    { id: 'urgencia', peso: 20, termos: ['urgente', 'urgencia', 'imediatamente', 'agora mesmo', 'ainda hoje', 'so hoje', 'ultimo dia', 'ultima chance', 'prazo', 'expira', 'vence hoje', 'em ate 24', 'nas proximas', 'rapido', 'nao da tempo', 'outras familias', 'outros interessados', 'tem mais gente', 'varias pessoas querendo'],
      titulo: 'Pressa e prazo curto', txt: 'A pressa é a principal arma do golpista: ela impede você de parar e conferir.', guia: ['como-identificar-mensagem-falsa', 'mensagem falsa'] },
    { id: 'ameaca', peso: 22, termos: ['bloquead', 'suspens', 'cancelad', 'multa', 'intimacao', 'pendencia', 'irregular', 'divida', 'nome sujo', 'protesto', 'negativad', 'mandado', 'prisao', 'processo contra', 'sera preso'],
      titulo: 'Ameaça de bloqueio, multa ou processo', txt: 'Mensagens que assustam querem que você aja sem pensar. Confira a pendência no aplicativo ou no site oficial, digitando o endereço você mesmo.', guia: ['phishing', 'phishing'] },
    { id: 'premio', peso: 25, termos: ['parabens', 'voce ganhou', 'foi sorteado', 'premio', 'resgate', 'resgatar', 'valor a receber', 'dinheiro esquecido', 'restituicao', 'indenizacao', 'foi liberado', 'foi liberada', 'credito pre aprovado', 'pontos expirando', 'brinde', 'cashback'],
      titulo: 'Promete prêmio ou dinheiro a receber', txt: 'Ninguém dá dinheiro por mensagem. Valores a receber de verdade são consultados no site oficial, sem link e sem taxa.', guia: ['golpe-do-imposto-de-renda', 'restituição falsa'] },
    { id: 'taxa', peso: 35, termos: ['taxa de liberacao', 'taxa de desbloqueio', 'taxa para liberar', 'pagar uma taxa', 'pague a taxa', 'taxa de entrega', 'taxa alfandega', 'custas', 'imposto para receber', 'tarifa para liberar', 'para liberar o valor', 'para receber o valor', 'antecipar o pagamento'],
      titulo: 'Cobra taxa para liberar dinheiro ou entrega', txt: 'Pagar para receber é o sinal mais clássico de golpe. Dinheiro de verdade não exige taxa por Pix.', guia: ['golpe-do-falso-advogado', 'falso advogado'] },
    { id: 'sigilo', peso: 35, termos: ['nao conte', 'nao fale para', 'nao fale com', 'segredo', 'sigilo', 'sigilosa', 'nao comente', 'nao desligue', 'fique na linha', 'nao avise'],
      titulo: 'Pede segredo ou para não desligar', txt: 'O golpista quer impedir que você converse com alguém que perceba o golpe. Desligue e conte para alguém de confiança.', guia: ['falsa-central', 'falsa central'] },
    { id: 'dados', peso: 25, termos: ['cpf', 'dados bancarios', 'numero do cartao', 'cvv', 'codigo de seguranca do cartao', 'data de nascimento', 'foto do documento', 'foto do rg', 'selfie', 'atualizar seus dados', 'atualize seus dados', 'confirme seus dados', 'recadastr'],
      titulo: 'Pede dados pessoais ou do cartão', txt: 'Com seus dados, o golpista abre contas e faz compras em seu nome. Só informe dados em sites e aplicativos que você mesmo abriu.', guia: ['phishing', 'phishing'] },
    { id: 'central', peso: 35, termos: ['central de seguranca', 'compra suspeita', 'compra nao reconhecida', 'voce reconhece', 'estorno', 'cartao clonado', 'setor de fraude', 'conta invadida', 'voce reconhece'],
      titulo: 'Falsa central do banco ou golpe do motoboy', txt: 'Banco não liga pedindo para confirmar compras com senha e nunca manda buscar cartão em casa. Desligue e ligue você para o número atrás do cartão.', guia: ['golpe-do-motoboy', 'golpe do motoboy'] },
    { id: 'motoboy', peso: 60, termos: ['motoboy', 'buscar o cartao', 'buscar seu cartao', 'buscar o seu cartao', 'cortar o cartao', 'corte o cartao', 'cartao cortado', 'coloque num envelope', 'coloque em um envelope', 'retirar o cartao', 'recolher o cartao'],
      titulo: 'Alguém vai buscar o seu cartão', txt: 'Banco nenhum manda motoboy ou funcionário buscar cartão em casa, nem pede para cortar o cartão. É o golpe do motoboy.', guia: ['golpe-do-motoboy', 'golpe do motoboy'] },
    { id: 'justica', peso: 30, termos: ['advogado', 'alvara', 'ganhou o processo', 'ganhou a causa', 'acao judicial', 'processo ganho', 'stf', 'tribunal', 'promotor', 'juiz', 'precatorio', 'indenizacao judicial'],
      titulo: 'Fala de processo, advogado ou Justiça', txt: 'Para receber dinheiro da Justiça você não paga nada. Ligue para o seu advogado no número de sempre antes de qualquer coisa.', guia: ['golpe-do-falso-advogado', 'falso advogado'] },
    { id: 'inss', peso: 18, termos: ['inss', 'prova de vida', 'aposentadoria', 'beneficio bloqueado', 'beneficio suspenso', 'revisao do beneficio', 'meu inss', 'pensao'],
      titulo: 'Usa o nome do INSS', txt: 'O INSS não liga nem manda link para prova de vida ou desbloqueio. Tudo é feito pelo aplicativo Meu INSS ou pelo telefone 135.', guia: ['golpe-do-falso-inss', 'falso INSS'] },
    { id: 'entrega', peso: 25, termos: ['correios', 'encomenda', 'pacote retido', 'objeto retido', 'pedido retido', 'retido', 'retida', 'tentativa de entrega', 'endereco incompleto', 'rastreio', 'rastreamento', 'taxa de entrega', 'entregador'],
      titulo: 'Entrega retida ou taxa de entrega', txt: 'Correios e lojas não cobram taxa por link de mensagem. Confira o pedido só no site ou aplicativo de onde você comprou.', guia: ['golpes-black-friday', 'compras e entregas'] },
    { id: 'compra', peso: 20, termos: ['desconto', 'promocao', 'queima de estoque', 'liquidacao', 'preco imperdivel', '70%', '80%', '90%', 'frete gratis', 'ultimas unidades', 'so no pix', 'apenas pix', 'desconto no pix'],
      titulo: 'Oferta boa demais', txt: 'Preço muito abaixo do normal e pagamento só por Pix são sinais de loja falsa. Pesquise o CNPJ e a reputação antes de comprar.', guia: ['lojas-falsas', 'lojas falsas'] },
    { id: 'aluguel', peso: 22, termos: ['aluguel', 'temporada', 'casa de praia', 'sinal de', 'pagar o sinal', 'reserva da casa', 'diaria', 'chale'],
      titulo: 'Aluguel com sinal adiantado', txt: 'Golpistas anunciam casas que não são deles. Pague só dentro da plataforma e confira que o Pix está no nome de quem anuncia.', guia: ['golpe-do-aluguel-de-temporada', 'aluguel de temporada'] },
    { id: 'emprego', peso: 30, termos: ['vaga de emprego', 'trabalho em casa', 'renda extra', 'ganhe por dia', 'curtir videos', 'avaliar produtos', 'tarefas', 'comissao', 'ganhos diarios', 'trabalhe pelo celular'],
      titulo: 'Emprego fácil ou renda extra', txt: 'Vagas que pagam para curtir ou avaliar e depois pedem “investimento” são golpe. Emprego de verdade não cobra para você trabalhar.', guia: ['como-identificar-mensagem-falsa', 'mensagem falsa'] },
    { id: 'investimento', peso: 30, termos: ['investimento', 'lucro garantido', 'rendimento garantido', 'dobrar seu dinheiro', 'retorno garantido', 'cripto', 'bitcoin', 'robo de investimento', 'trader'],
      titulo: 'Promessa de lucro garantido', txt: 'Não existe lucro garantido. Confira se a empresa tem autorização da CVM ou do Banco Central.', guia: ['deepfake', 'deepfake e falsos famosos'] },
    { id: 'romance', peso: 28, termos: ['meu amor', 'minha querida', 'presente retido', 'alfandega', 'militar', 'plataforma de petroleo', 'te conheci', 'quero te conhecer', 'passagem para te ver'],
      titulo: 'Romance pela internet com pedido de dinheiro', txt: 'Quem pede dinheiro sem nunca ter encontrado você pessoalmente costuma ser golpista.', guia: ['golpe-do-namoro-virtual', 'namoro virtual'] },
    { id: 'parente', peso: 18, termos: ['mae', 'pai', 'filho', 'filha', 'vo', 'neto', 'neta', 'tia', 'tio'],
      titulo: 'Fala em nome de um parente', txt: 'Golpistas usam a foto e o nome de parentes. Confirme por ligação ou com uma pergunta que só a pessoa saberia.', guia: ['whatsapp-clonado', 'falso parente'], fraca: true },
    { id: 'app', peso: 30, termos: ['instale o aplicativo', 'baixe o aplicativo', 'baixar o app', 'anydesk', 'teamviewer', 'acesso remoto', 'compartilhe a tela', 'compartilhar a tela', 'apk'],
      titulo: 'Pede para instalar aplicativo ou compartilhar a tela', txt: 'Com acesso remoto, o golpista controla o seu celular e faz transferências. Nunca instale nada a pedido de quem ligou.', guia: ['falsa-central', 'falsa central'] }
  ];

  // perguntas do modo "contar a situação"
  var Q = [
    { id: 'q-dinheiro', peso: 25, texto: 'Pediram dinheiro, Pix, transferência ou pagamento de boleto?', regra: 'pix' },
    { id: 'q-codigo', peso: 45, texto: 'Pediram código que chegou por SMS, senha ou para digitar a senha no telefone?', regra: 'codigo' },
    { id: 'q-novo', peso: 30, texto: 'O contato veio de um número ou perfil novo, desconhecido ou de alguém “com celular novo”?', regra: 'numero' },
    { id: 'q-pressa', peso: 20, texto: 'Há pressa, prazo curto ou ameaça (bloqueio, multa, processo)?', regra: 'urgencia' },
    { id: 'q-segredo', peso: 35, texto: 'Pediram segredo, para não contar a ninguém ou para não desligar?', regra: 'sigilo' },
    { id: 'q-premio', peso: 25, texto: 'Prometeram prêmio, dinheiro a receber, lucro ou desconto muito grande?', regra: 'premio' },
    { id: 'q-taxa', peso: 35, texto: 'Para receber algo, pediram que você pague uma taxa antes?', regra: 'taxa' },
    { id: 'q-link', peso: 25, texto: 'Pediram para clicar em link, ler QR Code ou instalar aplicativo?', regra: 'app' },
    { id: 'q-casa', peso: 40, texto: 'Alguém vai buscar cartão, dinheiro ou objeto na sua casa?', regra: 'central' },
    { id: 'q-nome', peso: 30, texto: 'O Pix ou boleto está em nome de outra pessoa ou empresa diferente de quem pediu?', regra: 'pix' }
  ];
  var CONFIRMOU = { id: 'q-confirmou', texto: 'Você já confirmou tudo ligando para um número oficial ou que já conhecia (não o que veio na mensagem)?' };

  // ---------- análise ----------
  function analisar(texto, respostas) {
    var t = ' ' + norm(texto).replace(/\s+/g, ' ') + ' ';
    var sinais = [];
    R.forEach(function (r) {
      var achou = tem(t, r.termos);
      if (r.id === 'parente') { if (!achou || !(/ (mae|pai|filho|filha|vo|neto|neta|tia|tio)[ ,.!?]/.test(t))) return; }
      if (achou) sinais.push({ peso: r.peso, titulo: r.titulo, txt: r.txt, guia: r.guia, achou: achou, fraca: r.fraca });
    });
    // combinações que pesam mais
    var ids = sinais.map(function (s) { return s.titulo; });
    function has(id) { var r = R.filter(function (x) { return x.id === id; })[0]; return r && ids.indexOf(r.titulo) !== -1; }
    if (has('numero') && has('pix')) sinais.push({ peso: 45, titulo: 'Número novo + pedido de dinheiro', txt: 'Essa combinação é o golpe do falso parente quase sempre. Ligue para o número antigo antes de pagar.', guia: ['whatsapp-clonado', 'falso parente'] });
    if (has('premio') && (has('pix') || has('taxa'))) sinais.push({ peso: 40, titulo: 'Dinheiro a receber + pagamento antes', txt: 'Pedir pagamento para liberar um prêmio, restituição ou indenização é golpe.', guia: ['golpe-do-falso-advogado', 'falso advogado'] });
    if (has('central') && (has('motoboy') || has('senha'))) sinais.push({ peso: 40, titulo: 'Falsa central + pedido de cartão ou senha', txt: 'Ligação “do banco” que termina pedindo senha ou o cartão é golpe. Desligue e ligue você para o número atrás do cartão.', guia: ['falsa-central', 'falsa central'] });
    if (has('aluguel') && has('pix')) sinais.push({ peso: 30, titulo: 'Aluguel + sinal adiantado por Pix', txt: 'Pedir sinal por Pix fora da plataforma é o roteiro do golpe da casa de temporada. Pague só pela plataforma e confira o nome de quem recebe.', guia: ['caso-real-golpe-do-aluguel-de-temporada', 'caso real da casa de praia'] });
    if (has('urgencia') && has('pix')) sinais.push({ peso: 20, titulo: 'Pressa + pagamento', txt: 'Pagamento com pressa é a fórmula do golpe. Pare, respire e confira por outro canal.', guia: ['cai-no-golpe-do-pix', 'caí no golpe do Pix'] });

    extrairLinks(texto).forEach(function (l) {
      var a = avaliarLink(l);
      sinais.push({ peso: a.peso, titulo: 'Link: ' + l.host, txt: 'Este link ' + a.motivos.join('; ') + '.', guia: ['phishing', 'como conferir um link'], link: true });
    });

    (respostas || []).forEach(function (q) {
      var r = R.filter(function (x) { return x.id === q.regra; })[0];
      sinais.push({ peso: q.peso, titulo: q.texto.replace(/\?$/, ''), txt: r ? r.txt : '', guia: r ? r.guia : null, resposta: true });
    });

    // soma com retorno decrescente: risco = 1 - Π(1 - peso)
    var p = 1;
    sinais.forEach(function (s) { p *= (1 - Math.min(s.peso, 95) / 100); });
    var risco = Math.round((1 - p) * 100);
    // tira repetidos (mesmo título)
    var vistos = {}; sinais = sinais.filter(function (s) { if (vistos[s.titulo]) return false; vistos[s.titulo] = 1; return true; });
    sinais.sort(function (a, b) { return b.peso - a.peso; });
    return { risco: risco, sinais: sinais };
  }

  function nivel(risco) {
    if (risco >= 80) return { cls: 'muito-alto', nome: 'Muito alto', frase: 'Tem cara de golpe. Não pague, não clique e não passe dados.' };
    if (risco >= 50) return { cls: 'alto', nome: 'Alto', frase: 'Vários sinais de golpe. Pare e confirme por um canal oficial antes de qualquer coisa.' };
    if (risco >= 20) return { cls: 'atencao', nome: 'Atenção', frase: 'Há sinais que pedem cuidado. Confirme com calma antes de agir.' };
    return { cls: 'baixo', nome: 'Baixo', frase: 'Não encontramos sinais fortes de golpe. Mesmo assim, confirme antes de pagar ou passar dados.' };
  }

  // ---------- interface ----------
  var abas = raiz.querySelectorAll('[data-aba]');
  var paineis = raiz.querySelectorAll('[data-painel]');
  function abrir(nome) {
    abas.forEach(function (b) { var on = b.getAttribute('data-aba') === nome; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.classList.toggle('ativa', on); });
    paineis.forEach(function (p) { p.hidden = p.getAttribute('data-painel') !== nome; });
  }
  abas.forEach(function (b) { b.addEventListener('click', function () { abrir(b.getAttribute('data-aba')); }); });

  // perguntas
  var lista = document.getElementById('val-perguntas');
  Q.concat([CONFIRMOU]).forEach(function (q) {
    var id = q.id;
    var li = el('li', null, [
      el('span', { text: q.texto }),
      el('span', { class: 'val-sn' }, [
        el('label', null, [el('input', { type: 'radio', name: id, value: 'sim' }), el('span', { text: 'Sim' })]),
        el('label', null, [el('input', { type: 'radio', name: id, value: 'nao' }), el('span', { text: 'Não' })])
      ])
    ]);
    lista.appendChild(li);
  });

  var saida = document.getElementById('val-resultado');
  function mostrar(res, extra) {
    var n = nivel(res.risco);
    saida.innerHTML = '';
    saida.hidden = false;
    var barra = el('div', { class: 'val-barra' }, [el('span', { style: 'width:' + Math.max(res.risco, 3) + '%' })]);
    var topo = el('div', { class: 'val-topo nivel-' + n.cls }, [
      el('p', { class: 'val-rotulo', text: 'Risco de golpe' }),
      el('p', { class: 'val-numero', text: res.risco + '%' }),
      el('p', { class: 'val-nivel', text: n.nome }),
      barra,
      el('p', { class: 'val-frase', text: n.frase })
    ]);
    saida.appendChild(topo);
    if (extra) saida.appendChild(el('p', { class: 'val-aviso', text: extra }));
    if (res.sinais.length) {
      saida.appendChild(el('h3', { text: 'Sinais encontrados (' + res.sinais.length + ')' }));
      var ul = el('ul', { class: 'val-sinais' });
      res.sinais.forEach(function (s) {
        var forca = s.peso >= 35 ? 'forte' : s.peso >= 20 ? 'medio' : 'fraco';
        var li = el('li', { class: 'sinal-' + forca }, [
          el('strong', { text: s.titulo }),
          el('p', { text: s.txt }),
          s.guia ? el('a', { href: 'artigos/' + s.guia[0] + '.html', text: 'Saiba mais: ' + s.guia[1] + ' →' }) : null
        ]);
        ul.appendChild(li);
      });
      saida.appendChild(ul);
    }
    var passos = res.risco >= 50
      ? ['Não pague, não clique no link e não passe código, senha ou dados.', 'Confirme ligando para um número que você já conhecia ou para o número oficial (atrás do cartão, no site oficial ou no aplicativo).', 'Mostre a mensagem para alguém de confiança antes de decidir.', 'Já pagou? Avise o banco agora e peça o MED do Pix.']
      : ['Confirme por um canal oficial antes de pagar ou passar dados.', 'Se for alguém conhecido, ligue para o número antigo da pessoa.', 'Na dúvida, não clique: digite você mesmo o endereço do site ou abra o aplicativo.'];
    saida.appendChild(el('h3', { text: 'O que fazer agora' }));
    var ol = el('ol', { class: 'val-passos' });
    passos.forEach(function (p) { ol.appendChild(el('li', { text: p })); });
    saida.appendChild(ol);
    saida.appendChild(el('p', { class: 'val-links', html: 'Já caiu? Veja <a href="artigos/cai-no-golpe-do-pix.html">o que fazer nos primeiros minutos</a> e <a href="artigos/como-denunciar-um-golpe.html">como denunciar</a>.' }));
    saida.appendChild(el('p', { class: 'val-rodape', text: 'Esta análise é automática e educativa: procura sinais comuns de golpe e pode errar para os dois lados. Um resultado baixo não garante que é seguro. Nada do que você colou ou enviou saiu do seu aparelho.' }));
    saida.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // texto
  var areaTexto = document.getElementById('val-texto');
  document.getElementById('val-analisar-texto').addEventListener('click', function () {
    var v = areaTexto.value.trim();
    if (v.length < 8) { areaTexto.focus(); areaTexto.setAttribute('aria-invalid', 'true'); return; }
    areaTexto.removeAttribute('aria-invalid');
    mostrar(analisar(v), v.length < 40 ? 'O texto é curto. Se puder, cole a mensagem inteira para uma análise melhor.' : null);
  });

  // situação
  document.getElementById('val-analisar-situacao').addEventListener('click', function () {
    var rel = document.getElementById('val-relato').value;
    var resp = [];
    Q.forEach(function (q) { var m = raiz.querySelector('input[name="' + q.id + '"]:checked'); if (m && m.value === 'sim') resp.push(q); });
    var conf = raiz.querySelector('input[name="' + CONFIRMOU.id + '"]:checked');
    var res = analisar(rel, resp);
    var extra = null;
    if (conf && conf.value === 'sim' && res.risco > 0) { res.risco = Math.round(res.risco * 0.6); extra = 'Você disse que confirmou por um canal oficial ou conhecido, então o risco caiu. Só vale se o número não veio da própria mensagem.'; }
    else if (conf && conf.value === 'nao') { extra = 'Você ainda não confirmou por um canal oficial. Esse é o passo mais importante antes de agir.'; }
    if (!resp.length && rel.trim().length < 8) { extra = 'Responda às perguntas ou conte o que aconteceu para analisarmos.'; }
    mostrar(res, extra);
  });

  // print (OCR no aparelho)
  var arq = document.getElementById('val-arquivo');
  var estado = document.getElementById('val-ocr-estado');
  var previa = document.getElementById('val-previa');
  var lido = document.getElementById('val-lido');
  var botaoPrint = document.getElementById('val-analisar-print');
  var carregando = null;
  function carregarTesseract() {
    if (window.Tesseract) return Promise.resolve();
    if (carregando) return carregando;
    carregando = new Promise(function (ok, erro) {
      var s = document.createElement('script'); s.src = 'assets/ocr/tesseract.min.js'; s.onload = ok; s.onerror = erro; document.head.appendChild(s);
    });
    return carregando;
  }
  arq.addEventListener('change', function () {
    var f = arq.files && arq.files[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) { estado.textContent = 'Escolha uma imagem (print da tela).'; return; }
    var leitor = new FileReader();
    leitor.onload = function () {
      previa.src = leitor.result; previa.hidden = false;
      estado.textContent = 'Preparando a leitura do print (só na primeira vez demora um pouco)…';
      botaoPrint.disabled = true; lido.value = '';
      carregarTesseract().then(function () {
        return Tesseract.createWorker('por', 1, {
          workerPath: 'assets/ocr/worker.min.js', corePath: 'assets/ocr/', langPath: 'assets/ocr', workerBlobURL: false, gzip: true,
          logger: function (m) { if (m.status === 'recognizing text') estado.textContent = 'Lendo o texto do print… ' + Math.round(m.progress * 100) + '%'; }
        });
      }).then(function (w) {
        return w.recognize(leitor.result).then(function (r) { w.terminate(); return r.data.text; });
      }).then(function (txt) {
        lido.value = (txt || '').replace(/\n{3,}/g, '\n\n').trim();
        lido.hidden = false; botaoPrint.disabled = false;
        estado.textContent = lido.value ? 'Texto lido. Confira se está certo (pode corrigir) e toque em Analisar.' : 'Não conseguimos ler texto nesta imagem. Tente um print mais nítido ou cole o texto.';
      }).catch(function () {
        estado.textContent = 'Não foi possível ler o print neste aparelho. Copie e cole o texto da mensagem na aba “Colar texto”.';
        botaoPrint.disabled = false;
      });
    };
    leitor.readAsDataURL(f);
  });
  botaoPrint.addEventListener('click', function () {
    var v = lido.value.trim();
    if (v.length < 8) { estado.textContent = 'Envie um print primeiro.'; return; }
    mostrar(analisar(v));
  });

  // limpar
  raiz.querySelectorAll('[data-limpar]').forEach(function (b) {
    b.addEventListener('click', function () {
      areaTexto.value = ''; document.getElementById('val-relato').value = ''; lido.value = ''; lido.hidden = true;
      previa.hidden = true; previa.removeAttribute('src'); arq.value = ''; estado.textContent = '';
      raiz.querySelectorAll('input[type=radio]').forEach(function (r) { r.checked = false; });
      saida.hidden = true; saida.innerHTML = '';
    });
  });

  // exemplo
  var ex = document.getElementById('val-exemplo');
  if (ex) ex.addEventListener('click', function () {
    abrir('texto');
    areaTexto.value = 'Oi mãe, troquei de número, salva esse aqui. Tô com um problema urgente, preciso pagar um boleto hoje e meu app tá bloqueado. Faz um Pix pra mim que amanhã te devolvo? A chave é 11987654321, tá no nome do meu amigo.';
    areaTexto.focus();
  });

  // expõe para testes
  window.__validador = { analisar: analisar, extrairLinks: extrairLinks, avaliarLink: avaliarLink };
})();
