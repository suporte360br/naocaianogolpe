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
      explicacao: 'Golpe do falso parente. Número novo + pedido de dinheiro + urgência. Ligue para o número antigo da pessoa ou faça uma pergunta que só ela saberia responder.'
    },
    {
      canal: 'SMS',
      texto: '"BANCO: Compra de R$ 4.879,00 aprovada em seu cartão. Não reconhece? Ligue 0800 XXX XXXX."',
      golpe: true,
      explicacao: 'Golpe da falsa central. O número do SMS leva aos golpistas. Para conferir, abra o app do banco ou ligue no número impresso no verso do cartão.'
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
      explicacao: 'Phishing. A Receita não cancela CPF por e-mail nem manda links para regularização. Consulte sempre pelo gov.br, digitando o endereço você mesmo.'
    },
    {
      canal: 'Ligação',
      texto: '"Aqui é do setor de segurança do seu banco. Para cancelar a fraude, vou precisar do código que chegou no seu celular."',
      golpe: true,
      explicacao: 'Nenhum banco pede senha, token ou código SMS por telefone. Desligue e ligue você para o número oficial.'
    },
    {
      canal: 'Loja online',
      texto: 'iPhone novo por 40% do preço, só no Pix, site criado há poucos dias e sem CNPJ no rodapé.',
      golpe: true,
      explicacao: 'Loja falsa. Preço muito abaixo do mercado, pagamento só via Pix e site sem identificação são os três sinais clássicos. Pesquise o CNPJ e a reputação antes de comprar.'
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
  ]
};

document.querySelectorAll('.quiz[data-quiz]').forEach(quiz => {
  const perguntas = bancos[quiz.dataset.quiz];
  if (!perguntas) return;

  let atual = 0, acertos = 0;
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
    el.progresso.textContent = 'Resultado';
    el.canal.textContent = '';
    el.texto.textContent = `Você acertou ${acertos} de ${perguntas.length}. ` +
      (acertos === perguntas.length ? 'Excelente! Compartilhe com quem você quer proteger.' :
       'Os golpistas contam com a pressa. Releia os sinais de alerta e tente de novo.');
    el.resposta.className = 'resposta';
    el.opcoes.innerHTML = '<button class="btn" data-reiniciar>Jogar de novo</button>';
  }

  el.opcoes.addEventListener('click', e => {
    queueMicrotask(() => el.opcoes.querySelector('button')?.focus({ preventScroll: true }));
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-reiniciar')) { atual = 0; acertos = 0; mostrar(); return; }
    if (b.hasAttribute('data-proxima')) { atual++; atual < perguntas.length ? mostrar() : finalizar(); return; }
    const p = perguntas[atual];
    const certo = (b.dataset.golpe === '1') === p.golpe;
    if (certo) acertos++;
    el.resposta.className = 'resposta ' + (certo ? 'certo' : 'errado');
    el.resposta.innerHTML = `<strong>${certo ? 'Acertou!' : 'Cuidado!'}</strong> ${p.explicacao}`;
    el.opcoes.innerHTML = `<button class="btn" data-proxima>${atual + 1 < perguntas.length ? 'Próxima situação' : 'Ver resultado'}</button>`;
  });

  mostrar();
});

document.querySelectorAll('[data-ano]').forEach(e => e.textContent = new Date().getFullYear());
