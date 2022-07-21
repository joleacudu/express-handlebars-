const formidable = require('formidable');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

module.exports.formPerfil = async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        return res.render("perfil", {user: req.user, imagen: user.imagen})
    } catch (error) {
        req.flash("mensajes", [{ msg: 'Error al leer el usuario' }]);
        return res.redirect('/perfil')
    }
};

module.exports.editarFotoPerfil = async(req, res) => {
    
    // console.log(req.user); //lo tenemos por tener verificado al usuario
    const form = new formidable.IncomingForm();
    form.maxFileSize = 5 * 1024 * 1024 //5mb

    form.parse(req, async(err, fields, files) => {
        try {
            if(err){
                throw new Error('Fallo la subida de la imagen')
            };

            // console.log(fields);
            // console.log(files);

            const file = files.myFile;
            if(file.originalFilename === ""){
                throw new Error("Por favor selecciona una imagen");
            };

            // if(!(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')){
            //     throw new Error('Seleccione una imagen .jpg o .png')
            // };
            const imageTypes = ['image/jpeg', 'image/png'];           
            if(!imageTypes.includes(file.mimetype)){
                throw new Error('Seleccione una imagen .jpg o .png');
            };

            if(file.size > 5 * 1024 * 1024){
                throw new Error('La imagen debe ser menos a 50MB');
            };

            const extension = file.mimetype.split("/")[1];
            // const dirFile = __dirname + "../public/img/perfiles/fotodinamica";
            const dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`);
            // console.log(dirFile);

            fs.renameSync(file.filepath, dirFile);

            //con esto redimensiono la imagen
            const imagen = await Jimp.read(dirFile);
            imagen.resize(200, 200).quality(90).writeAsync(dirFile);

            const user = await User.findById(req.user.id);
            user.imagen = `${req.user.id}.${extension}`;
            await user.save(); //el await siempre se debe poner cuando se hace una relacion con un BD

            req.flash("mensajes", [{ msg: "Se actualizo la imagen del perfil "}]);
            // return res.redirect("/perfil");
        } catch (error) {
            req.flash("mensajes", [{ msg: error.message }]);
            // return res.redirect("/perfil");
        }finally{
            return res.redirect("/perfil");
        }
    });
};