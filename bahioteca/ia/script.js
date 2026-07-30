document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // se não estiver logado
  if (!token) {
    window.location.href = '../login/index.html';
    return;
  }

  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const chatMessages = document.getElementById('chatMessages');
  const summaryList = document.querySelector('.summary-list');

  let livroSelecionado = null;

  // Carrega os livros da biblioteca
  async function carregarBiblioteca() {
    try {
      const res = await fetch('http://localhost:3000/biblioteca', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const livros = await res.json();

      summaryList.innerHTML = '';

      livros.forEach((livro, index) => {
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.dataset.id = livro.id;

        if (index === 0) {
          card.classList.add('active');
          livroSelecionado = livro.id;
        }

        card.innerHTML = `
          <img src="${livro.capa}" class="book-cover">
          <div class="summary-info">
            <h3>${livro.titulo}</h3>
          </div>
        `;

        card.addEventListener('click', () => {
          document.querySelectorAll('.summary-card')
            .forEach(c => c.classList.remove('active'));

          card.classList.add('active');
          livroSelecionado = livro.id;

          chatMessages.innerHTML = '';
        });

        summaryList.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      alert('Erro ao carregar biblioteca');
    }
  }

  carregarBiblioteca();

  // Envia pergunta para o backend
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const pergunta = userInput.value.trim();

    if (!pergunta || !livroSelecionado) return;

    adicionarMensagemUsuario(pergunta);
    userInput.value = '';

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          livroId: livroSelecionado,
          pergunta
        })
      });

      const data = await res.json();

      adicionarMensagemIA(data.resposta);

    } catch (err) {
      console.error(err);
      adicionarMensagemIA('Erro ao obter resposta.');
    }
  });

  function adicionarMensagemUsuario(texto) {
    const div = document.createElement('div');
    div.className = 'message user-message';
    div.innerHTML = `<p>${escapeHTML(texto)}</p>`;

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function adicionarMensagemIA(texto) {
    const div = document.createElement('div');
    div.className = 'message ai-message markdown-body';

    div.innerHTML = marked.parse(texto);

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }
});