console.log("Estoy aqui frontend 😊") //sale en el navegador

document.addEventListener('click', (e) => {
   if(e.target.dataset.copiar){
    // console.log("existe")
        const url = `${window.location.origin}/${e.target.dataset.copiar}`

        navigator.clipboard
            .writeText(url) 
            .then(() => {
                console.log("se copio la URL");
            })
            .catch((err) => {
                console.log("No se pudo copiar " + err);
            });
   };
});