const { URL } = require("url");

const urlValidar = (req, res, next) => {
    try {
        const { origin } = req.body; // leo nuevamente la solicitud que se llama origin
        const urlFrontend = new URL(origin); // 
        if(urlFrontend.origin !== "null"){
            if(
                urlFrontend.protocol === "http:" || 
                urlFrontend.protocol === "https:"
            ) {
                return next();
            }
            throw new Error("La URL debe tener http o https");
        }
        throw new Error("no valida ❌");
        
    } catch (error) {
        if(error.message === "Invalid URL"){
            req.flash("mensajes", [{ msg: "URL no valida" }]);
        }else{
            req.flash("mensajes", [{msg: error.message}]);
        }
        // console.log(error);
        // return res.send("url no valida");
        return res.redirect('/');
    }
};

module.exports = urlValidar;