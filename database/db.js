const mongoose = require("mongoose");
require('dotenv').config();

const clientDB = mongoose
    .connect(process.env.URI)
    .then((m) => {
        console.log("bd conectada ✅");
        return m.connection.getClient();
    })
    .catch(e => console.log("fallo la conexion "+ e))

module.exports = clientDB;