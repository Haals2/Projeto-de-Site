const form = document.getElementById('registerForm');
const button = document.querySelector('.register-btn');

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

const togglePassword = document.getElementById('togglePassword');
const icon = togglePassword.querySelector('i');

togglePassword.addEventListener('click', () => {
    if (password.type === 'password') {
        password.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        password.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = password.value.trim();

    if (!nome || !email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    try {
        const res = await fetch('http://localhost:3000/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const data = await res.json();
        console.log(data);

    } catch (err) {
        console.error(err);
    }
});