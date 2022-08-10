const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const admin = require('./routes/admin')
const path = require('path')
const { builtinModules } = require('module')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const usuarios = require('./routes/usuario')
const passport =require('passport')

require("./config/auth")(passport)

require("./models/Postagem")
const Postagem = mongoose.model("postagens")

require("./models/Categoria")
const Categoria = mongoose.model("categorias")


const app= express()
//configutação sessao
app.use(session({
    secret:"cursonode",
    resave:true,
    saveUninitialized:true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//midware
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null // armazena dados do usuario logado
    next()

})

// configurações body

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

// configurações handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

//mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/blogapp',{
}).then(()=>{
    console.log("conexão realizada com sucesso")
}).catch((erro)=>{
    console.log("erro ao conect")
})

//public
app.use(express.static(path.join(__dirname,"public")))


//rotas
app.get('/', (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: 'desc'}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível carregar os posts")
        res.redirect("/404")
    })
})

app.get("/404",(req, res)=>{
    res.send("erro 404")
})

app.get('/postagem/:slug', (req,res) => {
    const slug = req.params.slug
    Postagem.findOne({slug})
        .then(postagem => {
            if(postagem){
                const post = {
                    titulo: postagem.titulo,
                    data: postagem.data,
                    conteudo: postagem.conteudo
                }
                res.render('postagem/index', post)
            }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
})


app.get("/categorias", (req,res)=>{
    
        Categoria.find().lean().then((categorias)=>{
            res.render("categorias/index",{categorias:categorias})

    }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar categorias")
            res.redirect("/")
        })


})

app.get("/categorias/:slug",(req,res)=>{
    Categoria.findOne({slug:req.params.slug}).then((categoria)=>{
        if(categoria){
            Postagem.find({categoria:categoria._id}).lean().then((postagens)=>{
                res.render("categorias/postagens",{postagens:postagens, categoria: categoria})

            }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar posts ")
            res.redirect("/")
            })

        }else{
            req.flash("error_msg", "Categoria não existe ")
            res.redirect("/")

        }

    }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao caregar a pagina dessa categoria ")
            res.redirect("/")
    })

})
app.use('/admin', admin)
app.use('/usuarios',usuarios)


//servidor
const port = 8081
app.listen(port,() =>{
    console.log("servidor ok")
})