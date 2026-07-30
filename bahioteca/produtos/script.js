// ===============================
// DADOS DOS LIVROS
// ===============================

let livros = [];

// ===============================
// ELEMENTOS
// ===============================

const catalogo = document.getElementById("catalogo");

const pesquisa = document.getElementById("pesquisa");

const modal = document.getElementById("modal");

const modalImg = document.getElementById("modalImg");

const modalTitulo = document.getElementById("modalTitulo");

const modalCategoria = document.getElementById("modalCategoria");

const fechar = document.getElementById("fechar");

let ensinoAtual="todos";

let materiaAtual="todos";

async function buscarLivrosGoogle(termo = "education") {

    try {

        const resposta = await fetch(
            `https://openlibrary.org/search.json?q=${encodeURIComponent(termo)}&limit=20`
        );

        const dados = await resposta.json();

        livros = dados.docs.map((livro, index) => ({

            id: index + 1,

            titulo: livro.title,

            categoria:"Analisando...",

            materia:"todos",

            ensino:"todos",

            imagem: livro.cover_i
                ? `https://covers.openlibrary.org/b/id/${livro.cover_i}-L.jpg`
                : "https://via.placeholder.com/180x260?text=Sem+Capa",

            descricao: livro.author_name
                ? livro.author_name[0]
                : "Autor desconhecido"

        }));

        await classificarLivros();

        carregarLivros();

    } catch (erro) {

        console.error(erro);

    }

}

// ===============================
// CRIAR CATÁLOGO
// ===============================

function carregarLivros(){

    catalogo.innerHTML="";

    let lista = [...livros];

    lista = lista.filter(l=>{

        return l.titulo
        .toLowerCase()
        .includes(
            pesquisa.value.toLowerCase()
        );

    });

    const categorias={};

    lista.forEach(livro=>{

        if(!categorias[livro.categoria]){

            categorias[livro.categoria]=[];

        }

        categorias[livro.categoria].push(livro);

    });

    for(const categoria in categorias){

        const section=document.createElement("section");

        section.className="categoria";

        section.innerHTML=`

        <div class="categoria-topo">

            <h2>${categoria}</h2>

            <a href="#">Ver todos</a>

        </div>

        <div class="carrossel">

            <button class="seta esquerda">
                ❮
            </button>

            <div class="lista"></div>

            <button class="seta direita">
                ❯
            </button>

        </div>

        `;

        const listaLivros = section.querySelector(".lista");

        categorias[categoria].forEach(livro=>{

            const card=document.createElement("div");

            card.className="card";

            card.innerHTML=`

                <img src="${livro.imagem}">

                <div class="info">

                    <h3>${livro.titulo}</h3>

                    <p>${livro.categoria}</p>

                </div>

            `;

            card.onclick=()=>abrirLivro(livro);

            listaLivros.appendChild(card);

        });

        catalogo.appendChild(section);

    }

}

// ===============================
// MODAL
// ===============================

function abrirLivro(livro){

    modal.style.display = "flex";

    modalImg.src = livro.imagem;

    modalTitulo.innerHTML = livro.titulo;

    modalCategoria.innerHTML = livro.descricao;

}

fechar.onclick = () => {

    modal.style.display = "none";

}

window.onclick = (e)=>{

    if(e.target == modal){

        modal.style.display = "none";

    }

}

// ===============================
// CARROSSEL
// ===============================

document.addEventListener("click",(e)=>{

    if(e.target.classList.contains("direita")){

        const lista = e.target.previousElementSibling;

        lista.scrollBy({

            left:600,

            behavior:"smooth"

        });

    }

    if(e.target.classList.contains("esquerda")){

        const lista = e.target.nextElementSibling;

        lista.scrollBy({

            left:-600,

            behavior:"smooth"

        });

    }

});

// ===============================
// FILTRO ENSINO
// ===============================

document.querySelectorAll(".ensinos button").forEach(botao => {

    botao.onclick = () => {

        document
            .querySelector(".ensinos .ativo")
            .classList.remove("ativo");

        botao.classList.add("ativo");

        const ensino = botao.dataset.ensino;

        if (ensino === "fundamental") {
            buscarLivrosGoogle("Ensino Fundamental");
        }

        else if (ensino === "medio") {
            buscarLivrosGoogle("Ensino Médio");
        }

        else if (ensino === "superior") {
            buscarLivrosGoogle("Programação OR Engenharia");
        }

        else if (ensino === "artigos") {
            buscarLivrosGoogle("Machine Learning");
        }

        else {
            buscarLivrosGoogle("livros");
        }

    };

});

// ===============================
// FILTRO MATÉRIA
// ===============================

async function classificarLivros(){

    for(let livro of livros){

        try{

            const resposta = await fetch(
                "http://localhost:3000/classificar-livro",
                {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    titulo:livro.titulo,

                    assunto:livro.categoria,

                    autor:livro.descricao

                })

            });


            const dados = await resposta.json();


            livro.categoria = dados.categoria;

            livro.materia = dados.materia;

            livro.ensino = dados.ensino;


        }catch(e){

            console.log(
                "Erro IA",
                livro.titulo
            );

        }

    }

}

document.querySelectorAll(".materias button").forEach(botao=>{

    botao.onclick = ()=>{

        document
        .querySelector(".materias .ativoMateria")
        .classList.remove("ativoMateria");

        botao.classList.add("ativoMateria");

        materiaAtual = botao.dataset.materia;

        carregarLivros();

    }

});

// ===============================
// PESQUISA
// ===============================

pesquisa.addEventListener("keyup",()=>{

    carregarLivros();

});

// ===============================
// INICIAR
// ===============================

buscarLivrosGoogle();