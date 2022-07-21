const Url = require("../models/Url");
const { nanoid } = require("nanoid");

const leerUrls = async (req, res) => {
    
    try {
        // const urls = await Url.find({user: req.user.redirect}).lean(); // con esto se muestra todas las urls independiente del usuario que se loguee.
        const urls = await Url.find({user: req.user.id}).lean(); //con esto busco las urls que tiene asociado cada usuario.
        res.render("home", {urls: urls});
    } catch (error) {
        // console.log(error)
        // res.send("fallo algo...")
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};

const eliminarUrl = async(req, res) => {
    const {id} = req.params; 
    try {
        // await Url.findByIdAndDelete(id);
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error("No es tu URL")
        };
        await url.remove();
        req.flash("mensajes", [{msg: "URL eliminada. "}]);
        return res.redirect('/');
        
     } catch (error) {
        // console.log(error);
        // res.send("error algo fallo");
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
     }
};

const agregarUrl = async (req, res) => {

    // console.log(req.body)
    const {origin} = req.body;

    try {
        const url = new Url({origin: origin, shortURL: nanoid(9), user: req.user.id}); //con el user: .... guardo url pero relacionadas con el usuario, sin el user:... se guarda de manera global (sin una relacion a un usuario)
        await url.save();
        req.flash("mensajes", [{msg: "URL agregada"}]);
        return res.redirect('/');
        // res.send("agregado " + url); // en el navegador
    } catch (error) {
        // console.log(error);
        // res.send('error algo fallo');
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
};

const editarUrl = async(req, res) =>{
    const { id } = req.params; //destructuracion de los parametros
    try {
        const url = await Url.findById(id).lean();
        if(!url.user.equals(req.user.id)){
            throw new Error("No te pertenece esta URL")
        }
        return res.render('home', {url})
    } catch (error) {
        // console.log(error);
        // res.send("No se logro actualizar");
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
}

const editar = async (req, res) => {
    const { id } = req.params; //destructuracion de los parametros
    const { origin } = req.body;
    try {
        const url = await Url.findById(id);
        if(!url.user.equals(req.user.id)){
            throw new Error("No te pertenece esta URL");
        }
        await url.updateOne({origin});
        req.flash("mensajes", [{msg: "URL editada"}]);
        // await Url.findByIdAndUpdate(id, {origin: origin});
        res.redirect('/');
    } catch (error) {
        // console.log(error);
        // res.send("No se logro actualizar");
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/');
    }
}

const redireccionamiento = async (req, res) => {
    const {shortURL} = req.params
    try {
        const urlDB = await Url.findOne({shortURL : shortURL});
        res.redirect(urlDB.origin)
    } catch (error) {
        req.flash("mensajes", [{msg: "No existe esta URL configurada"}]);
        return res.redirect('/auth/login');
    }
}

module.exports = {
    leerUrls,
    agregarUrl,
    eliminarUrl,
    editarUrl,
    editar,
    redireccionamiento,
} // lo exporto como objeto porque son varios metodos

