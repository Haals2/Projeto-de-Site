// =====================================
// EDUBOOKS
// Script.js Completo
// =====================================


// =====================================
// BASE DE LIVROS
// =====================================

let livros = [];


// =====================================
// FILTROS ATUAIS
// =====================================

let ensinoAtual = "todos";

let materiaAtual = "todos";


// =====================================
// ELEMENTOS DA PÁGINA
// =====================================

const catalogo = document.getElementById("catalogo");

const pesquisa = document.getElementById("pesquisa");


const modal = document.getElementById("modal");

const modalImg = document.getElementById("modalImg");

const modalTitulo = document.getElementById("modalTitulo");

const modalCategoria = document.getElementById("modalCategoria");


const fechar = document.getElementById("fechar");

const ler = document.getElementById("ler");


// =====================================
// LEITOR PDF
// =====================================

const leitorPDF = document.getElementById("leitorPDF");

const pdfViewer = document.getElementById("pdfViewer");

const tituloLeitura = document.getElementById("tituloLeitura");

const fecharLeitor = document.getElementById("fecharLeitor");


// =====================================
// CARREGAR LIVROS JSON
// =====================================

async function carregarBase(){

    try{

        const resposta = await fetch("dados/livros.json");

        livros = await resposta.json();

        carregarLivros();

    }

    catch(erro){

        console.error(
            "Erro ao carregar livros:",
            erro
        );

    }

}



// =====================================
// CRIAR CATÁLOGO
// =====================================

function carregarLivros(){


    if(!catalogo) return;


    catalogo.innerHTML = "";


    let lista = [...livros];


    // -----------------------------
    // Pesquisa
    // -----------------------------

    if(pesquisa){

        lista = lista.filter(livro =>

            livro.titulo
            .toLowerCase()
            .includes(
                pesquisa.value.toLowerCase()
            )

        );

    }



    // -----------------------------
    // Ensino
    // -----------------------------

    if(ensinoAtual !== "todos"){


        lista = lista.filter(livro =>

            livro.ensino === ensinoAtual

        );


    }



    // -----------------------------
    // Matéria
    // -----------------------------

    if(materiaAtual !== "todos"){


        lista = lista.filter(livro =>

            livro.materia === materiaAtual

        );


    }



    // -----------------------------
    // Nenhum resultado
    // -----------------------------

    if(lista.length === 0){


        catalogo.innerHTML = `

            <div class="sem-livros">

                <h2>Nenhum livro encontrado 📚</h2>

                <p>Tente outro filtro ou pesquisa.</p>

            </div>

        `;


        return;


    }




    // -----------------------------
    // Separar categorias
    // -----------------------------

    const categorias = {};



    lista.forEach(livro => {


        if(!categorias[livro.categoria]){

            categorias[livro.categoria] = [];

        }


        categorias[livro.categoria]
        .push(livro);


    });




    // -----------------------------
    // Criar seções
    // -----------------------------

    for(const categoria in categorias){



        const section =
        document.createElement("section");


        section.className = "categoria";



        section.innerHTML = `

            <div class="categoria-topo">

                <h2>${categoria}</h2>

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




        const listaLivros =
        section.querySelector(".lista");





        categorias[categoria]
        .forEach(livro => {



            const card =
            document.createElement("div");



            card.className = "card";



            card.innerHTML = `


                <img src="${livro.capa}">


                <div class="info">


                    <h3>
                    ${livro.titulo}
                    </h3>


                    <p>
                    ${livro.autor}
                    </p>


                </div>


            `;



            card.onclick = () => {

                abrirLivro(livro);

            };



            listaLivros.appendChild(card);



        });



        catalogo.appendChild(section);



    }


}





// =====================================
// MODAL DO LIVRO
// =====================================

function abrirLivro(livro){



    if(!modal) return;



    modal.style.display = "flex";



    modalImg.src =
    livro.capa;



    modalTitulo.innerHTML =
    livro.titulo;



modalCategoria.innerHTML = `

    <div class="info-autor">

        <strong>Autor:</strong>

        <span>${livro.autor}</span>

    </div>


    <div class="info-descricao">

        <strong>Descrição:</strong>

        <span>${livro.descricao}</span>

    </div>

`;




    if(ler){



        ler.onclick = () => {



            modal.style.display =
            "none";



            if(leitorPDF){


                leitorPDF.style.display =
                "block";


            }



            if(tituloLeitura){


                tituloLeitura.innerHTML =
                livro.titulo;


            }



            if(pdfViewer){


                pdfViewer.src =
                livro.pdf;


            }



        };


    }



}





// =====================================
// FECHAR MODAL
// =====================================

if(fechar){


    fechar.onclick = () => {

        modal.style.display =
        "none";

    };


}




window.onclick = (e)=>{


    if(e.target === modal){

        modal.style.display =
        "none";

    }


};




// =====================================
// FECHAR LEITOR PDF
// =====================================

if(fecharLeitor){


    fecharLeitor.onclick = ()=>{


        leitorPDF.style.display =
        "none";


        pdfViewer.src = "";


        tituloLeitura.innerHTML =
        "";


    };


}





// =====================================
// CARROSSEL
// =====================================


document.addEventListener(
"click",
(e)=>{


    if(
        e.target.classList.contains("direita")
    ){


        const lista =
        e.target.previousElementSibling;


        lista.scrollBy({

            left:500,

            behavior:"smooth"

        });


    }




    if(
        e.target.classList.contains("esquerda")
    ){


        const lista =
        e.target.nextElementSibling;



        lista.scrollBy({

            left:-500,

            behavior:"smooth"

        });



    }



});






// =====================================
// PESQUISA
// =====================================

if(pesquisa){


    pesquisa.addEventListener(
    "input",
    ()=>{


        carregarLivros();


    });


}






// =====================================
// FILTRO ENSINO
// =====================================


document
.querySelectorAll(".ensinos button")
.forEach(botao=>{


    botao.onclick = ()=>{


        const ativo =
        document.querySelector(
            ".ensinos .ativo"
        );



        if(ativo){

            ativo.classList
            .remove("ativo");

        }



        botao.classList
        .add("ativo");



        ensinoAtual =
        botao.dataset.ensino;



        carregarLivros();



    };


});






// =====================================
// FILTRO MATÉRIA
// =====================================


document
.querySelectorAll(".materias button")
.forEach(botao=>{


    botao.onclick = ()=>{


        const ativo =
        document.querySelector(
            ".materias .ativoMateria"
        );



        if(ativo){

            ativo.classList
            .remove("ativoMateria");

        }




        botao.classList
        .add("ativoMateria");



        materiaAtual =
        botao.dataset.materia;



        carregarLivros();



    };


});






// =====================================
// TECLA ESC
// =====================================


document.addEventListener(
"keydown",
(e)=>{


    if(e.key === "Escape"){


        if(modal){

            modal.style.display =
            "none";

        }



        if(leitorPDF){

            leitorPDF.style.display =
            "none";


        }



        if(pdfViewer){

            pdfViewer.src = "";

        }



    }


});







// =====================================
// INICIAR SISTEMA
// =====================================


carregarBase();