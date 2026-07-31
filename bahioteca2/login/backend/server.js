const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

const SECRET = 'bahioteca';

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ erro: 'Token não enviado' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    console.log(nome, email, senha);
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await db.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );

    console.log(result);

    res.json({ sucesso: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  const [rows] = await db.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ erro: 'Email não encontrado' });
  }

  const user = rows[0];

  const ok = await bcrypt.compare(senha, user.senha);

  if (!ok) {
    return res.status(401).json({ erro: 'Senha incorreta' });
  }

  const token = jwt.sign(
    { id: user.id, nome: user.nome },
    SECRET,
    { expiresIn: '30d' }
  );

  res.json({ token });
});

app.post('/chat', auth, async (req, res) => {
  try {
    const { livroId, pergunta } = req.body;

    const [permissao] = await db.execute(
      `SELECT livros.resumo
       FROM biblioteca
       JOIN livros ON livros.id = biblioteca.livro_id
       WHERE biblioteca.usuario_id = ? AND livros.id = ?`,
      [req.user.id, livroId]
    );

    if (permissao.length === 0) {
      return res.status(403).json({ erro: 'Livro não pertence ao usuário' });
    }

    const resumo = permissao[0].resumo;

    const resposta = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost',
        'X-Title': 'Bahioteca'
      },
      body: JSON.stringify({
        model: 'poolside/laguna-s-2.1:free',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em literatura e um professor particular. Responda apenas com base neste resumo:\n\n${resumo}

            Responda de forma detalhada, agradável de ler e visualmente organizada.

            Use Markdown.

            Siga esta estrutura sempre que fizer sentido:

            # Título

            ## Resumo principal
            Explique os acontecimentos com riqueza de detalhes.

            ## Personagens principais
            Liste e explique o papel de cada personagem.

            ## Temas importantes
            Analise os temas centrais da obra.

            ## Curiosidades
            Conte fatos interessantes sobre o livro.

            ## Linha do tempo
            Organize os principais acontecimentos em ordem.

            ## Trechos marcantes
            Destaque momentos importantes (sem inventar citações).

            ## Relação com outras obras
            Quando relevante, compare com outros livros da série.

            Use negrito, listas, subtítulos e blocos de destaque quando apropriado.

            Escreva como um conteúdo premium para estudantes.
            
            Você não pode criar nada mais sobre nenhum outro livro, apenas o do\n\n${resumo}.
            `
          },
          {
            role: 'user',
            content: pergunta
          }
        ]
      })
    });

    const data = await resposta.json();

    console.log('Status:', resposta.status);
    console.log('Resposta OpenRouter:', JSON.stringify(data, null, 2));

    if (!resposta.ok) {
      return res.status(500).json({
        erro: 'Erro na OpenRouter',
        detalhes: data
      });
    }

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({
        erro: 'Resposta inválida da OpenRouter',
        detalhes: data
      });
    }

    res.json({
      resposta: data.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.get('/biblioteca', auth, async (req, res) => {
  const [rows] = await db.execute(
    `SELECT livros.id, livros.titulo, livros.capa
     FROM biblioteca
     JOIN livros ON livros.id = biblioteca.livro_id
     WHERE biblioteca.usuario_id = ?`,
    [req.user.id]
  );

  res.json(rows);
});

app.post("/classificar-livro", async(req,res)=>{

try{

const livro=req.body;


const resposta = await fetch(
"https://openrouter.ai/api/v1/chat/completions",
{
method:"POST",

headers:{
Authorization:"Bearer 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",
"Content-Type":"application/json"
},

body:JSON.stringify({

model:"poolside/laguna-s-2.1:free",

messages:[
{
role:"user",

content:`

Classifique este livro:

Título:
${livro.titulo}

Autor:
${livro.autor}


Retorne SOMENTE JSON:

{
"categoria":"",
"materia":"",
"ensino":""
}


Categorias:

Português
Matemática
História
Geografia
Física
Química
Biologia
Algoritmos
Artigos
Outros


Ensino:

Fundamental
Médio
Superior

`
}
]

})

});


const data=await resposta.json();


console.log("Resposta OpenRouter:", JSON.stringify(data,null,2));


if(!data.choices){
    return res.status(500).json({
        erro:"OpenRouter não retornou choices",
        resposta:data
    });
}


const texto=data.choices[0].message.content;


res.json(JSON.parse(texto));


}catch(e){

console.log(e);

res.status(500).json({
erro:e.message
});

}


});

app.get('/imagem-personagem', async(req,res)=>{

try{

const nome = req.query.nome;

const resposta = await axios.get(
"https://commons.wikimedia.org/w/api.php",
{
params:{
 action:"query",
 format:"json",
 generator:"search",
 gsrsearch:nome,
 gsrlimit:5,
 gsrnamespace:6,
 prop:"imageinfo",
 iiprop:"url"
},

headers:{
 "User-Agent":"EduBooks/1.0"
}

});


const paginas = resposta.data.query?.pages;


if(!paginas){
 return res.json({
  imagem:"https://via.placeholder.com/200"
 });
}


const imagens = Object.values(paginas);


const paginaComImagem = imagens.find(
 p => p.imageinfo && p.imageinfo.length > 0
);


if(!paginaComImagem){

 return res.json({
  imagem:"https://via.placeholder.com/200"
 });

}


res.json({
 imagem: paginaComImagem.imageinfo[0].url
});


}catch(e){

console.log(e.response?.data || e.message);

res.status(500).json({
 erro:e.message
});

}

});

app.get("/importar-livros", async(req,res)=>{

try{


// pegar livros
const resposta = await fetch(
"https://openlibrary.org/search.json?q=education&limit=50"
);


const dados = await resposta.json();


const livros = dados.docs.map(livro=>({

titulo: livro.title,

autor: livro.author_name 
? livro.author_name[0]
: "Desconhecido",

capa: livro.cover_i
? `https://covers.openlibrary.org/b/id/${livro.cover_i}-L.jpg`
: null

}));



// preparar texto para IA

const lista = livros.map((l,index)=>`

${index}:
Título: ${l.titulo}
Autor: ${l.autor}

`).join("\n");



const ia = await fetch(
"https://openrouter.ai/api/v1/chat/completions",
{

method:"POST",

headers:{
Authorization:"Bearer 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",
"Content-Type":"application/json"
},

body:JSON.stringify({

model:"poolside/laguna-s-2.1:free",

messages:[

{
role:"user",

content:`

Classifique esses livros.

Retorne SOMENTE JSON.

Formato:

[
{
"id":0,
"categoria":"",
"materia":"",
"ensino":""
}
]


Livros:

${lista}

`
}

]

})

});


const respostaIA = await ia.json();

console.log("RETORNO IA:");
console.log(JSON.stringify(respostaIA, null, 2));

if (!respostaIA.choices || respostaIA.choices.length === 0) {
    return res.status(500).json({
        erro: "IA não retornou resposta",
        retorno: respostaIA
    });
}

let texto = respostaIA.choices[0].message.content;

texto = texto.replace(/```json/g, "");
texto = texto.replace(/```/g, "");

const classificacoes = JSON.parse(texto);



// salvar no banco

for(let item of classificacoes){


const livro = livros[item.id];


if(!livro) continue;


await db.execute(

`
INSERT INTO livros
(
titulo,
autor,
capa,
categoria,
materia,
ensino
)
VALUES(?,?,?,?,?,?)
`,

[

livro.titulo || null,

livro.autor || null,

livro.capa || null,

item.categoria || "Outros",

item.materia || "Outros",

item.ensino || "Todos"

]

);


}



res.json({

sucesso:true,

quantidade:
classificacoes.length

});


}catch(e){

console.log(e);

res.status(500).json({
erro:e.message
});

}


});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});