const express = require('express');
const {body} = require("express-validator");

const { loginForm, registerForm, registerUser, confirmarCuenta, loginUser, cerrarSesion } = require('../controllers/authController');
const router = express.Router();

router.get("/register", registerForm);
router.post("/register", [
    body("userName", "Ingrese un nombre valido").trim().notEmpty().escape(),
    body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail().notEmpty().escape(),
    body("password", "Ingrese una contraseña de minimo 8 caracteres").trim().notEmpty().escape().isLength({ min: 8 }).custom((value, {req}) => {
        if(value !== req.body.repassword){
            throw new Error("No coinciden las paswwords");
        }else{
            return value;
        }
    }),
], registerUser);
router.get("/confirmarCuenta/:token", confirmarCuenta);
router.get("/login", loginForm);
router.post("/login",[
    body("email", "Ingrese un email valido").trim().isEmail().normalizeEmail().notEmpty().escape(),
    body("password", "Ingrese una contraseña de minimo 8 caracteres").trim().notEmpty().escape().isLength({ min: 8 }),
], loginUser);
router.get("/logout", cerrarSesion);

module.exports = router;