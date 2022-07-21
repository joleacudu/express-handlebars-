const User = require("../models/User");
const {validationResult} = require('express-validator')
const {nanoid} = require("nanoid");
const nodemailer = require("nodemailer");
require("dotenv").config();

const registerForm = (req, res) => {
    res.render('register');
};

const loginForm = (req, res) => {
    res.render("login");
};

const registerUser = async (req, res) => {
    
    // console.log(req.body);
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        // return res.json(errors)
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/register');
    }

    const { userName, email, password } = req.body;
    try {
        let user = await User.findOne({email: email}); // es let porque lo modifico abajo
        if (user) throw new Error('Ya existe el usuario'); // viaja al catch error

        user = new User({userName, email, password, tokenConfirm: nanoid()});//esquema
        await user.save();//lo guarda en la BD
        const transport = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: process.env.userEmail,
              pass: process.env.passEmail
            }
          });

          await transport.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: user.email, // list of receivers
            subject: "Verificacion de cuenta ✔", // Subject line
            // text: "http://localhost:5000/auth/confirmar/${user.tokenConfirm}", // plain text body
            html: `<a href="${process.env.pathHeroku || 'http://localhost:5000'}auth/confirmarCuenta/${user.tokenConfirm}">Verifica tu cuenta aqui</a>`, // html body
          });

        req.flash("mensajes", [{ msg: "Revisa tu correo electronico y valida la cuenta." }]);
        res.redirect('/auth/login');
        // res.json(user); // tener cuidado no se pueden mandar dos .json, solo uno 
    } catch (error) {
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/register');
    }
    // res.json(req.body); // tener cuidado no se pueden mandar dos .json, solo uno 
};

const confirmarCuenta = async(req, res) => {
    const { token } = req.params; //Para poder leer parametros desde la URL usamos .params
    try {
        const user = await User.findOne({tokenConfirm : token});
        if(!user) throw new Error("No existe el usuario");
        user.cuentaConfirmada = true;
        user.tokenConfirm = null;
        await user.save();
        req.flash("mensajes", [{ msg: "Cuenta verificada." }]);
        res.redirect('/auth/login');
        // res.json(user);
    } catch (error) {
        // res.json({error: error.message});
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/login');
    }
} 

const loginUser = async (req, res) => {

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        req.flash("mensajes", errors.array());
        return res.redirect('/auth/login');
    }

    const {email, password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user) throw new Error("No existe el Email ingresado.");

        if(!user.cuentaConfirmada) throw new Error("Falta validar el Email.");

        if(!await user.comparePassword(password)) throw new Error("Password incorrecta.");

        //Se crea la sesion del usuario a traces de passport
        req.login(user, function(err) {
            if(err) throw new Error('Error al crear la sesion')
            res.redirect('/')
        })
    } catch (error) {
        // console.log(error)
        // res.send(error.message);
        req.flash("mensajes", [{msg: error.message}]);
        return res.redirect('/auth/login');
    }
}

const cerrarSesion = (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/auth/login");
    });
};

module.exports = {
    loginForm,
    registerForm,
    registerUser, 
    confirmarCuenta,
    loginUser,
    cerrarSesion,
}