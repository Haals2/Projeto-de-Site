const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");
const icon = togglePassword.querySelector("i");

togglePassword.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        password.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }

});

const form = document.getElementById("loginForm");
const button = document.querySelector(".login-btn");

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value.trim();

    if (email === '' || senha === '') {
        alert('Preencha todos os campos!');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';

    try {
        const res = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);

            button.innerHTML = '<i class="fa-solid fa-check"></i> Sucesso!';

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        } else {
            button.disabled = false;
            button.innerHTML = 'Entrar';
            alert(data.erro);
        }
    } catch (err) {
        button.disabled = false;
        button.innerHTML = 'Entrar';
        alert('Erro ao conectar ao servidor');
        console.error(err);
    }
});