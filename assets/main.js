// Menu mobile
const botaoMenu = document.querySelector('.menu-botao');
const menu = document.querySelector('.menu');
if (botaoMenu && menu) {
  botaoMenu.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    botaoMenu.setAttribute('aria-expanded', aberto);
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('aberto')));
}

// Testes "É golpe ou não?": cada .quiz[data-quiz] usa o banco de perguntas com o mesmo nome
const bancos = {
  geral: [
    {
      canal: 'WhatsApp · número desconhecido',
      texto: '"Oi mãe, troquei de número! Esse é o novo. Pode me fazer um Pix de R$ 1.200? Te devolvo amanhã, é urgente 🙏"',
      golpe: true,
      explicacao: 'Golpe do falso parente. Número novo + pedido de dinheiro + urgência. Ligue para o número antigo da pessoa ou faça uma pergunta que só ela saberia responder.',
      guia: 'whatsapp-clonado.html'
    },
    {
      canal: 'SMS',
      texto: '"BANCO: Compra de R$ 4.879,00 aprovada em seu cartão. Não reconhece? Ligue 0800 XXX XXXX."',
      golpe: true,
      explicacao: 'Golpe da falsa central. O número do SMS leva aos golpistas. Para conferir, abra o app do banco ou ligue no número impresso no verso do cartão.',
      guia: 'falsa-central.html'
    },
    {
      canal: 'App oficial do banco',
      texto: 'Notificação dentro do aplicativo, aberto por você: "Novo dispositivo conectado à sua conta. Foi você?"',
      golpe: false,
      explicacao: 'Provavelmente legítimo: o alerta apareceu dentro do app oficial, que você mesmo abriu. Se não foi você, use a opção do próprio app para bloquear o acesso.'
    },
    {
      canal: 'E-mail',
      texto: '"Seu CPF será cancelado em 24h por pendência na Receita Federal. Regularize clicando aqui."',
      golpe: true,
      explicacao: 'Phishing. A Receita não cancela CPF por e-mail nem manda links para regularização. Consulte sempre pelo gov.br, digitando o endereço você mesmo.',
      guia: 'phishing.html'
    },
    {
      canal: 'Ligação',
      texto: '"Aqui é do setor de segurança do seu banco. Para cancelar a fraude, vou precisar do código que chegou no seu celular."',
      golpe: true,
      explicacao: 'Nenhum banco pede senha, token ou código SMS por telefone. Desligue e ligue você para o número oficial.',
      guia: 'falsa-central.html'
    },
    {
      canal: 'Loja online',
      texto: 'iPhone novo por 40% do preço, só no Pix, site criado há poucos dias e sem CNPJ no rodapé.',
      golpe: true,
      explicacao: 'Loja falsa. Preço muito abaixo do mercado, pagamento só via Pix e site sem identificação são os três sinais clássicos. Pesquise o CNPJ e a reputação antes de comprar.',
      guia: 'lojas-falsas.html'
    }
  ],
  motoboy: [
    {
      canal: 'Ligação · “central do banco”',
      texto: '"Detectamos uma compra suspeita no seu cartão. Já bloqueamos, mas vamos mandar um portador buscar o cartão na sua casa para a perícia."',
      golpe: true,
      explicacao: 'Golpe do motoboy. Banco nenhum manda alguém buscar cartão em casa, nem para perícia, nem para troca. Desligue e confira no app do banco.'
    },
    {
      canal: 'Ligação',
      texto: '"Para sua segurança, corte o cartão ao meio, sem danificar o chip, e coloque num envelope. O portador passa daqui a pouco."',
      golpe: true,
      explicacao: 'O chip inteiro continua funcionando. Com o chip e a senha, os golpistas fazem compras e saques. Cartão cancelado se descarta cortando o chip, e ninguém vem buscar.'
    },
    {
      canal: 'Ligação · digite no teclado',
      texto: '"Para confirmar o cancelamento, digite a senha do cartão no teclado do telefone."',
      golpe: true,
      explicacao: 'O banco nunca pede a senha do cartão, nem por voz nem pelo teclado do telefone. Quem pede a senha é golpista.'
    },
    {
      canal: 'Ligação · telefone fixo',
      texto: 'O “atendente” diz: "Desligue e ligue para o número do verso do cartão". Você liga na mesma hora, do mesmo telefone fixo, e cai numa central que confirma tudo.',
      golpe: true,
      explicacao: 'Truque da linha presa: no telefone fixo, os golpistas mantêm a chamada aberta e fingem ser a central. Espere alguns minutos ou ligue de outro aparelho, como o celular.'
    },
    {
      canal: 'App oficial do banco',
      texto: 'Você abre o app, vê uma compra que não fez, bloqueia o cartão ali mesmo e pede um novo, que chega pelos Correios em envelope lacrado.',
      golpe: false,
      explicacao: 'Esse é o caminho certo: você mesmo abriu o app oficial, bloqueou e pediu a segunda via. Ninguém vai à sua casa recolher o cartão antigo.'
    },
    {
      canal: 'Na sua porta',
      texto: 'Um motoboy chega com crachá e uniforme “do banco” e diz que veio buscar o cartão bloqueado, como combinado por telefone.',
      golpe: true,
      explicacao: 'Crachá e uniforme não provam nada. Não entregue o cartão nem a senha a ninguém. Feche a porta, ligue para o banco e chame a polícia pelo 190.'
    }
  ],
  'prova-de-vida': [
    {
      canal: 'SMS',
      texto: '"INSS: sua prova de vida vence hoje e seu benefício será bloqueado. Regularize agora: inss-provadevida.com"',
      golpe: true,
      explicacao: 'O INSS não manda link por SMS nem por WhatsApp. Hoje a prova de vida é feita pelo próprio INSS, cruzando dados de outros cadastros. Consulte só pelo app Meu INSS ou pela Central 135.'
    },
    {
      canal: 'WhatsApp · “servidor do INSS”',
      texto: '"Bom dia! Vamos fazer sua prova de vida por videochamada. Mostre seu rosto e o documento com foto para a câmera."',
      golpe: true,
      explicacao: 'Golpe. Com a imagem do seu rosto e do documento, os criminosos tentam abrir contas e pegar empréstimos no seu nome. O INSS não faz prova de vida por videochamada no WhatsApp.'
    },
    {
      canal: 'App Meu INSS',
      texto: 'Você mesmo abre o app Meu INSS e vê um aviso para fazer a prova de vida com reconhecimento facial dentro do próprio aplicativo.',
      golpe: false,
      explicacao: 'Legítimo: quando o INSS não consegue confirmar automaticamente, a prova de vida pode ser feita no app oficial Meu INSS. O importante é que foi você quem abriu o app.'
    },
    {
      canal: 'Na sua porta',
      texto: 'Uma pessoa diz ser do INSS, mostra um crachá e pede o cartão e a senha do banco para “atualizar a prova de vida”.',
      golpe: true,
      explicacao: 'O INSS nunca pede cartão ou senha do banco. Não deixe a pessoa entrar, não entregue nada e confirme qualquer pendência pela Central 135.'
    },
    {
      canal: 'Ligação',
      texto: '"Seu benefício foi suspenso por falta de prova de vida. Para reativar hoje, é só pagar a taxa de R$ 49,90 por Pix."',
      golpe: true,
      explicacao: 'A prova de vida é gratuita, e o INSS não cobra taxa para liberar benefício. Pedido de Pix para “reativar” é sempre golpe.'
    },
    {
      canal: 'Agência do seu banco',
      texto: 'Você vai à agência onde recebe o benefício e faz a prova de vida com o atendente, mostrando seu documento com foto.',
      golpe: false,
      explicacao: 'Legítimo: os bancos que pagam benefícios do INSS também fazem a prova de vida no caixa ou no atendimento, de forma gratuita. Foi você quem foi até lá.'
    }
  ],
  'falso-advogado': [
    {
      canal: 'WhatsApp · foto e nome do seu advogado',
      texto: '"Parabéns! Saiu a decisão do seu processo nº 1002345-67.2024 e você ganhou R$ 18.400. Para liberar o valor hoje, pague as custas finais de R$ 870 por Pix."',
      golpe: true,
      explicacao: 'Golpe do falso advogado. O número do processo é público, e a foto foi copiada. Ninguém paga taxa por Pix para receber um valor ganho na Justiça: custas e honorários são acertados no processo ou descontados do valor.'
    },
    {
      canal: 'WhatsApp · “assistente do escritório”',
      texto: '"Antes de liberar, o juiz precisa confirmar sua identidade por videochamada, agora. Fique de frente para a câmera, vire o rosto para os lados e mostre seu documento."',
      golpe: true,
      explicacao: 'Golpe. Os movimentos de rosto são os mesmos da biometria dos bancos. Com a gravação e o documento, os criminosos abrem contas e pegam empréstimos no seu nome. Juiz não faz videochamada por WhatsApp.'
    },
    {
      canal: 'WhatsApp · PDF anexo',
      texto: 'Chega um “alvará de pagamento” em PDF, com brasão do tribunal, assinatura, o número certo do processo e o aviso: "o valor volta para o tribunal se não for sacado até amanhã".',
      golpe: true,
      explicacao: 'Documento com brasão não prova nada: os golpistas copiam páginas reais do tribunal e montam o resto. A pressa é para você não ligar para ninguém. Consulte o processo você mesmo no site do tribunal.'
    },
    {
      canal: 'Ligação · você liga para o advogado',
      texto: 'Você liga para o número do advogado que já tinha. Ele confirma que saiu a decisão e explica que o valor será depositado por ordem do juiz, com os honorários descontados como no contrato.',
      golpe: false,
      explicacao: 'Esse é o caminho certo: foi você quem ligou, para o número que já conhecia, e não houve pedido de pagamento antecipado.'
    },
    {
      canal: 'Ligação · “setor financeiro”',
      texto: '"Para fazer a transferência, preciso dos seus dados bancários e do código de confirmação que vai chegar agora por SMS."',
      golpe: true,
      explicacao: 'Golpe. O código do SMS serve para cadastrar o seu WhatsApp ou o seu banco em outro aparelho. Ninguém precisa de código, senha ou token para depositar dinheiro na sua conta.'
    },
    {
      canal: 'Site do tribunal',
      texto: 'Você digita você mesmo o endereço do tribunal, consulta pelo número do processo e encontra a mesma decisão que o seu advogado tinha contado na última reunião.',
      golpe: false,
      explicacao: 'Legítimo: a consulta processual no site oficial, aberto por você, é a melhor forma de conferir. Se a decisão ou o alvará não aparecerem lá, desconfie.'
    }
  ]
};

// Guia de cada teste (para as sugestões do resultado) e títulos dos guias citados
const guiaDoTeste = {
  motoboy: 'golpe-do-motoboy.html',
  'prova-de-vida': 'golpe-do-falso-inss.html',
  'falso-advogado': 'golpe-do-falso-advogado.html'
};
const tituloDoGuia = {
  'whatsapp-clonado.html': 'WhatsApp clonado e golpe do falso parente',
  'falsa-central.html': 'Golpe da falsa central',
  'phishing.html': 'Phishing: e-mails e mensagens falsas',
  'lojas-falsas.html': 'Lojas falsas',
  'golpe-do-motoboy.html': 'Golpe do motoboy',
  'golpe-do-falso-inss.html': 'Golpe do falso INSS',
  'golpe-do-falso-advogado.html': 'Golpe do falso advogado'
};
const naPastaDeGuias = location.pathname.includes('/artigos/');
const paginaAtual = location.pathname.split('/').pop();
function linkDoGuia(arquivo) {
  if (!arquivo || arquivo === paginaAtual) return '';
  return `<a href="${naPastaDeGuias ? '' : 'artigos/'}${arquivo}">${tituloDoGuia[arquivo]} →</a>`;
}

document.querySelectorAll('.quiz[data-quiz]').forEach(quiz => {
  const perguntas = bancos[quiz.dataset.quiz];
  if (!perguntas) return;

  let atual = 0, acertos = 0, respostas = [];
  const el = {
    progresso: quiz.querySelector('.progresso'),
    canal: quiz.querySelector('.mensagem small'),
    texto: quiz.querySelector('.mensagem p'),
    opcoes: quiz.querySelector('.opcoes'),
    resposta: quiz.querySelector('.resposta')
  };

  function mostrar() {
    const p = perguntas[atual];
    el.progresso.textContent = `Situação ${atual + 1} de ${perguntas.length}`;
    el.canal.textContent = p.canal;
    el.texto.textContent = p.texto;
    el.resposta.className = 'resposta';
    el.opcoes.innerHTML = `
      <button class="btn alerta" data-golpe="1">É golpe</button>
      <button class="btn" data-golpe="0">Parece seguro</button>`;
  }

  function finalizar() {
    const total = perguntas.length, erros = total - acertos;
    const pct = Math.round(acertos / total * 100);
    el.progresso.textContent = 'Resultado';
    el.canal.textContent = '';
    el.texto.textContent = `Você acertou ${acertos} de ${total} (${pct}%). ` +
      (erros === 0 ? 'Excelente! Você reconheceu todas as situações.' :
       pct >= 60 ? 'Bom resultado, mas vale revisar as situações em que errou.' :
       'Atenção: os golpistas contam com a pressa. Veja as sugestões abaixo e tente de novo.');

    // Gráfico de rosca: verde = acertos, vermelho = erros
    const grafico = `
      <div class="resultado-grafico">
        <svg class="rosca" viewBox="0 0 42 42" role="img" aria-label="${acertos} acertos e ${erros} erros">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="${erros ? 'var(--alerta)' : 'var(--verde)'}" stroke-width="6"/>
          ${acertos && erros ? `<circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--verde)" stroke-width="6"
            stroke-dasharray="${acertos / total * 100} ${erros / total * 100}" stroke-dashoffset="25"/>` : ''}
          <text x="21" y="23.5" text-anchor="middle">${acertos}/${total}</text>
        </svg>
        <ul class="legenda">
          <li><span class="ponto certo"></span><strong>${acertos}</strong> ${acertos === 1 ? 'resposta correta' : 'respostas corretas'}</li>
          <li><span class="ponto errado"></span><strong>${erros}</strong> ${erros === 1 ? 'resposta errada' : 'respostas erradas'}</li>
        </ul>
      </div>
      <ol class="por-situacao">
        ${perguntas.map((p, i) => `<li class="${respostas[i] ? 'certo' : 'errado'}">
          <span aria-hidden="true">${respostas[i] ? '✓' : '✗'}</span>
          Situação ${i + 1} · ${p.canal} <em>${respostas[i] ? 'acertou' : 'errou'}</em></li>`).join('')}
      </ol>`;

    // Sugestões: uma para cada erro, mais as regras gerais
    const sugestoes = [];
    perguntas.forEach((p, i) => {
      if (respostas[i]) return;
      const link = linkDoGuia(p.guia || guiaDoTeste[quiz.dataset.quiz]);
      sugestoes.push(`<li><strong>Situação ${i + 1} (${p.golpe ? 'era golpe' : 'era seguro'}):</strong> ${p.explicacao}${link ? ' ' + link : ''}</li>`);
    });
    if (perguntas.some((p, i) => !respostas[i] && p.golpe)) {
      sugestoes.push('<li><strong>Regra de ouro:</strong> pressa, pedido de dinheiro, senha, código ou foto do seu rosto são sinais de golpe. Pare e confirme por um canal que <em>você</em> procurou: o app oficial, o número que já tinha ou o verso do cartão.</li>');
    }
    if (perguntas.some((p, i) => !respostas[i] && !p.golpe)) {
      sugestoes.push('<li><strong>Desconfiar é bom, mas reconheça o caminho seguro:</strong> quando foi você quem abriu o app oficial, ligou para o número conhecido ou foi ao atendimento, o contato é legítimo.</li>');
    }
    if (erros === 0) {
      sugestoes.push('<li><strong>Proteja quem você ama:</strong> mande este teste para a família, principalmente para quem tem mais dificuldade com o celular.</li>');
    }
    const guiaTeste = linkDoGuia(guiaDoTeste[quiz.dataset.quiz]);
    if (erros > 0 && guiaTeste && !sugestoes.some(s => s.includes(guiaDoTeste[quiz.dataset.quiz]))) {
      sugestoes.push(`<li><strong>Leia o guia completo:</strong> ${guiaTeste}</li>`);
    }

    el.resposta.className = 'resposta resultado';
    el.resposta.innerHTML = grafico + `<h3>Sugestões</h3><ul class="sugestoes">${sugestoes.join('')}</ul>`;
    el.opcoes.innerHTML = '<button class="btn" data-reiniciar>Jogar de novo</button>';
  }

  el.opcoes.addEventListener('click', e => {
    queueMicrotask(() => el.opcoes.querySelector('button')?.focus({ preventScroll: true }));
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-reiniciar')) { atual = 0; acertos = 0; respostas = []; mostrar(); return; }
    if (b.hasAttribute('data-proxima')) { atual++; atual < perguntas.length ? mostrar() : finalizar(); return; }
    const p = perguntas[atual];
    const certo = (b.dataset.golpe === '1') === p.golpe;
    if (certo) acertos++;
    respostas[atual] = certo;
    el.resposta.className = 'resposta ' + (certo ? 'certo' : 'errado');
    el.resposta.innerHTML = `<strong>${certo ? 'Acertou!' : 'Cuidado!'}</strong> ${p.explicacao}`;
    el.opcoes.innerHTML = `<button class="btn" data-proxima>${atual + 1 < perguntas.length ? 'Próxima situação' : 'Ver resultado'}</button>`;
  });

  mostrar();
});

document.querySelectorAll('[data-ano]').forEach(e => e.textContent = new Date().getFullYear());
