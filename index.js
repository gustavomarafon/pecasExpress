const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { pool } = require('./config')
require("dotenv-safe").config()

const jwt = require('jsonwebtoken')
const { request, response } = require('express')

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(cors())

const login = (request, response, next) => {
    const {usuario, senha} = request.body

    pool.query('SELECT * FROM usuarios where usuario = $1 and senha = $2', 
    [usuario, senha], (err, results) =>{
        if(err || results.rowCounts == 0){
            return response.status(401).json({auth: false , message: 'Usuário ou senha inválido'});
        }

        const nome_usuario = results.rows[0].usuario;
        const token = jwt.sign( { nome_usuario }, process.env.SECRET, {
            expiresIn: 300
        })
        return response.json({auth: true , token: token});
    })
}

const getPecas = (request, response) => {

    pool.query('SELECT * FROM pecas',(error, results) =>{
        if(error){
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const addPecas = (request, response) => {
    const {nome, descricao, preco, estoque} = request.body

    pool.query('INSERT INTO PECAS (nome, descricao, preco, estoque) values ($1, $2, $3, $4)',
        [nome, descricao, preco, estoque], 
        (error) => {
            if(error){
                throw error
            }
            response.status(201).json({status: 'success', mensagem: "Peça inserida com sucesso!"});
        }
    )
}

const updatePecas = (request, response) => {
    const {codigo, nome, descricao, preco, estoque} = request.body

    pool.query('UPDATE PECAS set nome = $1 , descricao = $2, preco = $3, estoque = $4 where codigo = $5',
        [nome, descricao, preco, estoque, codigo], 
        (error) => {
            if(error){
                throw error
            }
            response.status(201).json({status: 'success', mensagem: "Peça atualizada com sucesso!"});
        }
    )
}

const deletePecas = (request, response) => { 
    const codigo = parseInt(request.params.id)
    pool.query('DELETE from pecas where codigo = $1',
        [codigo], 
        (error) => {
            if(error){
                throw error
            }
            response.status(201).json({status: 'success', mensagem: "Peça removido com sucesso!"});
        }
    )
}

const getPecasPorId = (request, response) => {

    const codigo = parseInt(request.params.id)

    pool.query('SELECT * FROM pecas where codigo = $1',
    [codigo],
    (error, results) =>{
        if(error){
            throw error
        }
        response.status(200).json(results.rows)
    })
}
/*
function verificaJWT(request, response, next) {
    const token = request.headers['x-access-token']
    if(!token)return response.status(401).json({auth : false , message : 'nenhum token valido'})
    jwt.verify(token, process.env.SECRET, function(err, decoded){
        if(err) return response.status(500).json({auth : false , message : 'erro ao autenticar o token'})
        request.userId = decoded.id;
        next();
    });
}
*/
app
    .route("/pecas")
    .get(getPecas)
    .post( addPecas)
    .put(updatePecas)


app
    .route("/pecas/:id")
    .get(getPecasPorId)
    .delete(deletePecas)


 app
    .route("/login")
    .post(login)

app.listen(process.env.PORT || 3002, () => {
    console.log("Servidor rodando a API")
})