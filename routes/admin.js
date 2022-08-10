const express = require('express')
const mongoose = require( 'mongoose')
const {eAdmin, aAdmin} = require("../helpers/eAdmin")



require('../models/Postagem')
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagens")

const router = express.Router()

router.get('/',aAdmin,(req,res)=>{
    res.render("admin/index")

})

router.get('/postagens',aAdmin, (req, res) => {
    
    Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {

        res.render('admin/postagens', {postagens: postagens})

    }).catch( (err) => {

        req.flash('error_msg', 'Erro ao listar os posts')
        res.render('/admin')

    })
    

})

router.get('/categorias',aAdmin,(req,res)=>{
    Categoria.find().sort({date:'desc'}).lean().then((categorias)=>{
        res.render("admin/categorias",{categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg",'erro ao listar categorias')
        res.redirect("/admin")
    })
    
})
router.get('/categorias/add',aAdmin,(req,res)=>{
    res.render("admin/addcategoria")
})

router.post('/categorias/nova',aAdmin,(req,res)=>{

    var erros =[]
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome ==null){
        erros.push({texto:"Nome Invalido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug ==null){
        erros.push({texto:"Slug Invalido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto:"Nome com menos caractere que o permitido"})
    }

    if(erros.length >0){
        res.render("admin/addcategoria",{erros: erros})
    }else{
        const novaCategoria={
            nome:req.body.nome,
            slug:req.body.slug
        }
        new Categoria(novaCategoria).save().then(()=>{
        req.flash('success_msg','Categoria criada com sucesso')
        res.redirect("/admin/categorias")
        }).catch((err)=>{
        req.flash('error_msg','erro ao salvar categoria')
        res.redirect("/admin")
        })

    }
 
})

router.get("/categorias/edit/:id", aAdmin,(req, res)=>{
    //procurando o id que foi passado
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias",{categoria:categoria})
    }).catch((err)=>{
        req.flash('error_msg','esta categoria não existe')
        res.redirect("/admin/categorias")
    })
   


})

router.post("/categorias/edit",aAdmin,(req, res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar a edição da categoria")
            res.redirect("admin/categorias")
        })

    }).catch((err)=>{
        req.flash('error_msg','Houve um erro ao editar categoria')
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/deletar/:id', aAdmin,(req,res) => {
    Categoria.findOneAndDelete({_id: req.params.id}).then(()=> {
        req.flash('success_msg','Categoria deletada com sucesso')
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg','Houve um erro ao deletar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.get("/postagens",aAdmin,(req,res)=>{
    res.render("admin/postagens")
})

router.get("/postagens/add",aAdmin,(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagem",{categorias:categorias})
    }).catch((err) => {
        req.flash('error_msg','Houve um erro ao carregar formulario')
        res.redirect('/admin')
    })
   
})


router.post("/postagens/nova",aAdmin,(req,res)=>{
    var erros =[]

    if(req.body.categoria =="0"){
        erros.push({texto:"Categoria invalida, registre uma categoria"})
    }

    if(erros.length> 0){
        res.render("admin/addpostagem",{erros:erros})
    }else{
        const novaPostagem={
            titulo:req.body.titulo,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria:req.body.categoria,
            slug:req.body.slug
        }

        new Postagem(novaPostagem).save().then(()=>{
            req.flash('success_msg','Postagem criada com sucesso')
            res.redirect("/admin/postagens")
            }).catch((err)=>{
            req.flash('error_msg','erro ao salvar postagens')
            res.redirect("/admin/postagens")
            })


    }
})

router.get("/postagens/edit/:id", aAdmin,(req, res) =>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) =>{

        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})

        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario de edição")
        res.redirect("/admin/postagens")
    })
    
})
router.post("/postagem/edit",aAdmin,(req, res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash('success_msg','Postagem editada com sucesso')
            res.redirect("/admin/postagens")

        }).catch((err)=>{
        req.flash("error_msg", "erro interno")
        res.redirect("/admin/postagens")
        })    
    })
})

router.get("/postagens/deletar/:id",aAdmin,(req,res)=>{
    Postagem.deleteOne({_id:req.params.id}).then(()=>{
        req.flash('success_msg','Postagem deletada com sucesso')
        res.redirect("/admin/postagens")

    }).catch((err)=>{
        req.flash("error_msg", "erro interno")
        res.redirect("/admin/postagens")
    })    
})
module.exports= router