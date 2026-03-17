function checkId(req, res, next) {

//RECUPERO ID E CONTROLLO CHE SIA NUMERICO
   const id = Number(req.params.id); 
   console.log("Controllo se id è un numero")
   if (isNaN(id)){
        console.log("Errore: Id non valido");
        return res.status(400).json(
                                        {   
                                            error:"Invalid request",
                                            message:"Errore: l'id deve essere numerico"
                                        }
                                    )
    } 
    console.log("id valido: "+id);

    next();
};

module.exports = checkId;


