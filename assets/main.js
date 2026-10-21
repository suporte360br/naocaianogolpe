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

// Quiz "É golpe ou não?"
const quiz = document.getElementById('quiz');
if (quiz) {
  const perguntas = [
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
  ];

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
}

document.querySelectorAll('[data-ano]').forEach(e => e.textContent = new Date().getFullYear());
