function checkBody(req,res,next){

    let {title,tags} = req.body;

    //CONTROLLO STRINGA TITLE
    if(title !== undefined){
    if(String(title).length<3){                                         //Se il titolo non ha almeno 3 caratteri restituisci errore
        return res.status(400).json(                                    //torna errore json
                { error: "Bad Request", 
                message: "Il titolo è troppo corto", 
                title}                                    
        );} 
    }
    //CONTROLLO TAGS SEMPRE ARRAY
    if(tags !== undefined){
    tags = (Array.isArray(tags)                                         //se array
                    ? tags                                              //lascia array
                    : String(tags).split(","))                          //se no trasforma in stringa, dividi con virgola e restituisci array
    .map(t => {
                const result = t.toLowerCase().trim();                  //normalizzo tags
                return result.charAt(0).toUpperCase()+result.slice(1);  //inizio lettera maiuscola
                }
        ); 
    
    req.body.tags = tags;                                               //aggiorno il body-request
    }

    
    next();
}

module.exports = checkBody;