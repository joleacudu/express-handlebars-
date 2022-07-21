const express = require('express');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const mongoSanitize = require('express-mongo-sanitize'); //para evitar mongodb injection}
const cors = require('cors'); //para bloquear solicitudes que hagan ciertos dominios
const { create } = require("express-handlebars");
const csrf = require("csurf"); //se agrega seguridad por medio de los token 
const User = require('./models/User');

require('dotenv').config();
const clientDB = require('./database/db');

const app = express();

const corsOptions = {
    Credential: true,
    origin: process.env.pathHeroku || "*", //con "*" cualquiera puede hacer solicitudes
    methods: ['GET', 'POST'],
};
app.use(cors());

app.use(session({
    secret: process.env.secretSession,
    resave: false,
    saveUninitialized: false,
    name: "secret-name-joleacud",
    store: MongoStore.create({
        clientPromise: clientDB,
        dbName: process.env.dbName,
    }),
    cookie: { secure: process.env.modo === 'produccion', maxAge: 30 * 24 * 60 * 60 * 1000 }, // esto no sirve en la parte de desarrollo tiene que estar en false. ademas el 30 en maxAge indica el tiempo en dias que se guardara la sesion en la bd.
}))

app.use(flash())

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done (null, { id: user._id, userName: user.userName})); //req.user
passport.deserializeUser(async(user, done) => {
    const userDB = await User.findById(user.id);
    return done(null, {id: userDB._id, userName: userDB.userName});
})
// app.get('/mensaje-flash', (req, res) => {
//     res.json(req.flash('mensaje'))
// });
// app.get('/crear-mensaje', (req, res) => {
//     req.flash("mensaje", "Este es un mensaje de error");
//     res.redirect("/mensaje-flash"); 
// })

const hbs = create({
    extname: ".hbs",
    partialsDir: ["views/components"],
});

// console.log("Hola soy el backend 😊") //sale en consola

app.engine(".hbs", hbs.engine); //motor de busqueda
app.set("view engine", ".hbs"); //extencion hbs
app.set("views", "./views"); // busca en la carpeta views

app.use(express.urlencoded({extended: true}));

app.use(csrf());
app.use(mongoSanitize()); //se pone antes de las rutas porque se hacen las lecturas del req ya que interviene con este y hace una limpieza
//para las respuestas globales, y no tener que llamarlas en cada funcion
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    res.locals.mensajes = req.flash("mensajes");
    next();
})

app.use("/", require('./routes/home'));
app.use("/auth", require('./routes/auth'));

app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Servidor funcionando 😎 " + PORT));
 