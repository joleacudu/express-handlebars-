const express = require('express');
const { leerUrls, agregarUrl, eliminarUrl, editarUrl, editar, redireccionamiento } = require('../controllers/homeControl');
const { formPerfil, editarFotoPerfil } = require('../controllers/perfilController');
const urlValidar = require('../middlewares/urlValida');
const verificarUser = require('../middlewares/verificarUser');

const router = express.Router()

//con el next() de las otras funciones hago que pase de una a otra de las funciones
router.get("/", verificarUser, leerUrls);
router.post("/", verificarUser, urlValidar, agregarUrl);

router.get("/eliminar/:id", verificarUser, eliminarUrl);

router.get("/editar/:id", verificarUser, editarUrl);
router.post("/editar/:id", verificarUser, urlValidar, editar);

router.get("/perfil", verificarUser, formPerfil)
router.post("/perfil", verificarUser, editarFotoPerfil)

router.get("/:shortURL", redireccionamiento)

module.exports = router;