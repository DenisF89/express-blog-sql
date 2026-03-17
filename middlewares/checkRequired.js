const posts = require('../data/post_data.js');	
//ESEMPIO CON TUTTI I PARAMETRI OBBLIGATORI DA PASSARE O ERRORE

function checkRequired(req,res,next){

    const required = Object.keys(posts[0]).filter(key=>key !=="id");     //parametri obbligatori: ["title", "content", "image", "tags"]; 
    console.log(required);
    const missing = required.filter(r => req.body[r] === undefined);    //se nella richiesta non è presente il parametro obbligatorio scrivilo in "missing"
    console.log(missing);
    if (missing.length)                                                 //se ci sono parametri mancanti
        { return res.status(400).json(                                  //torna errore json
                { error: "Bad Request", 
                message: "Parametri obbligatori mancanti", 
                missing}                                                //parametri mancanti
        );} 

    next();
}

module.exports = checkRequired;