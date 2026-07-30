const form = document.getElementById("registerForm");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");
const icon = togglePassword.querySelector("i");

togglePassword.addEventListener("click", () => {

    if(password.type === "password"){

        password.type = "text";
        icon.classList.replace("fa-eye","fa-eye-slash");

    }else{

        password.type = "password";
        icon.classList.replace("fa-eye-slash","fa-eye");

    }

});

form.addEventListener("submit", function(e){

    e.preventDefault();

    if(password.value !== confirmPassword.value){

        alert("As senhas não coincidem.");
        return;

    }

    const botao = document.querySelector(".login-btn");

    botao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Criando conta...';
    botao.disabled = true;

    setTimeout(()=>{

        alert("Conta criada com sucesso!");

        window.location.href = "login.html";

    },1500);

});