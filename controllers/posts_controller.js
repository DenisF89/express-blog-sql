const posts = require('../data/post_data.js');	
const connection = require('../data/db.js'); 

const index = (req,res)=>{

    //RECUPERO I TAG PASSATI NELLA QUERYSTRING
    const { tag } = req.query;                      //express unisce piu valori con stessa chiave in array

    if (!tag) {                                     //se non ci sono tag selezionati
        const sql = `SELECT * FROM posts`;          // preparazione query
        connection.query(sql, (err, results) => {   // esecuzione query
            if (err) return res.status(500).json({ error: 'Database query failed' }); //se c'è un errore restituisce messaggio
            return res.json(results); });           // restituisco i risultati della query (tutti i post) in formato json
    }
    else{
    
    const alltags = (Array.isArray(tag)     //trasformo sempre in un array
                    ? tag
                    : [tag]) 
    .map(t => t.toLowerCase().trim());      //normalizzo querystring

    const search = alltags.map(t=>`%${t}%`); //cerca tag "substring" %search% (tipo include)

    
    //SOLUZIONE CON EXISTS per verificare per ogni tag: (TRUE) se esiste almeno una corrispondenza della substring(search) nei tag associati al post
    // per ogni tag creo una EXISTS
    const conditions = alltags.map(() => 
                    `EXISTS (                           -- restituisci vero
                     SELECT 1                            -- convenzione exists non seleziona nulla
                     FROM post_tag PT                    -- considero i risultati della tabella ponte
                     JOIN tags T ON T.id = PT.tag_id     -- join su tabella tags
                     WHERE PT.post_id = P.id             -- condizioni filtro: i risultati con id del post
                     AND LOWER(T.label) LIKE ?           -- e che contengano la stringa del search
                     )`).join(' AND ');                  // mette insieme gli elementi array in una stringa unita da AND

    const sql = `SELECT P.id, P.title, P.content, P.image,

                 -- per recuperare anche i tag associati 
                 -- GROUP_CONCAT(T.label) AS tags        -- restituisce i valori in una stringa unica
                 JSON_ARRAYAGG(T.label) AS tags          -- restituisce i valori in un array
                 
                 FROM posts P 
                 JOIN post_tag PT ON P.id = PT.post_id   -- faccio join per recuperare anche i tag
                 JOIN tags T ON T.id = PT.tag_id

                 WHERE ${conditions}
                 GROUP BY P.id`;                         //raggruppo per id post per non avere doppione post per ogni tag

    connection.query(sql, search, (err, results) => {
        if (err) return res.status(500).json({error: 'Database query failed', err});
        return res.json(results);
    });

    /*SOLUZIONE CON BUG LIKE% + HAVING COUNT
    //Seleziono tutti i post con almeno uno dei tag che ho ricevuto da querystring
    const conditions =  alltags.map(            //per ogni tag nell'array
                        () => `T.label LIKE ?`) //creo una stringa filtro LIKE %tag%
                        .join(' OR ');          //e le unisco in una stringa unica con OR
                                                //Es: T.label LIKE %dolci% OR T.label LIKE %tipast% (trova antipasti)

    
    const sql = `SELECT DISTINCT P.id, P.title, P.content, P.image  -- selezione le colonne (distinct elimina duplicati) 
                FROM posts P                                -- da tabella post         
                JOIN post_tag PT    ON P.id = PT.post_id    -- JOIN su tabella ponte       
                JOIN tags T         ON T.id = PT.tag_id     -- JOIN sui tag
                WHERE ${conditions}                         -- filtro: corrispondenza di almeno uno dei tag        
                GROUP BY P.id                               -- raggruppo per post trovati                             
                HAVING COUNT(DISTINCT T.id) = ?`;           // e filtro solo quelli che hanno n.tag = a quelli passati

    connection.query(sql, [...search, alltags.length], (err, results) => {   // esecuzione query
            if (err) return res.status(500).json({ error: 'Database query failed', err }); 
            return res.json(results); 
        });
        */ 
    }
}

const show = (req, res)=>{

    //RECUPERO IL POST SE ESISTE
    const id = Number(req.params.id);   // recupero id dall'URL (params)

    console.log("Recupero il post");
             
    const post_sql = `SELECT * FROM posts 
                      WHERE id = ? `;          //"?" evita sql injections

    connection.query(   post_sql, [id], (err, postResults) => { 
                            //intercetto errore 
                            if (err) return res.status(500).json({
                                error:"Internal System Error",
                                message:"Errore interno del server"
                            })

                            //se la query non ha dato risultati
                            if (postResults.length === 0) {

                                console.log(err,"Il post "+id+" non esiste")
                                return res.status(404).json(
                                        {
                                            error:"Not Found",
                                            message:`Il post ${id} non esiste`
                                        }
                                    );
                                }

                            const post = postResults[0];
                            console.log("Post recuperato: " +post);

                            console.log("recupero i tag");

                            const tags_sql = `SELECT T.label           
                                            FROM tags T
                                            JOIN post_tag PT
                                            ON T.id = PT.tag_id
                                            WHERE PT.post_id = ? `;  //alias tabelle: T=tags, PT=post_tag
                            

                            connection.query(   tags_sql, [id], (err, tagsResults) => { 

                                //intercetto errore 
                                if (err) return res.status(500).json({
                                    error:"Internal System Error",
                                    message:"Errore interno del server"
                                })

                                //se la query non ha dato risultati
                                if (tagsResults.length === 0) {

                                    console.log(err,"Il post "+id+" non ha tags")    
                                }
                                
                                post.tags = tagsResults.map(tag=>tag.label);

                                return res.json(post); 
                            });

                        });
}

const store = (req, res) => { 
    
    const { title, content, image, tags } = req.body; 

    //Inserisco nuovo post in table posts
    connection.query(   `INSERT INTO posts (title, content, image)      
                         VALUES (?, ?, ?) `,                            //evita sql-injection
                        [title, content, image],                        //parametri da salvare
                        (err, newPostResults)=>{                        //funzione di callback asincrona
                            if (err) return res.status(500).json({
                                error:"Internal System Error",
                                message:"Errore nel salvataggio del nuovo post"
                            })
                        const postId = newPostResults.insertId;         //recupero l'id del nuovo record con insertId
                        console.log(`Inserito nuovo post con id ${postId}`, newPostResults);
                    
    //Inserisco tags in table tags se nuovi

        const tagValues = tags.map(tag => [tag]);   //trasformo i parametri in array di array per SQL per inserimento righe multiple (per ogni tag)

        connection.query(`INSERT IGNORE INTO tags (label)
                          VALUES ?`,                //il comando IGNORE serve in caso il tag esistesse già lo ignora (il campo nella tabella deve essere UNIQUE)
                        [tagValues], 
                        (err,tagResults) => {
                            if (err) return res.status(500).json({
                                error:"Internal System Error",
                                message:"Errore inserimento tag"
                            })
                        console.log(`Inseriti ${tagResults.affectedRows} nuovi tag`, tagResults);

    //Recupero id dei tag
                            connection.query(`SELECT id
                                              FROM tags
                                              WHERE label IN (?)`, 
                                              [tags], 
                                              (err, tagIdResults) => {
                                if (err) return res.status(500).json({
                                    error: "Internal Server Error",
                                    message: "Errore nel recupero degli id dei tag"
                                });

                                console.log(tagIdResults);

    //Inserisco relazioni in post_tag

                                const postTagValues = tagIdResults.map(tag => [postId, tag.id]); //per ogni tag recuperato salvo un array con id del post e id del tag

                                connection.query(`INSERT INTO post_tag (post_id, tag_id)
                                        VALUES ?`, [postTagValues], 
                                      (err) => {
                                        if (err) return res.status(500).json({
                                        error: "Internal Server Error",
                                        message: "Errore nell'associazione tag-post"
                                        });        
                                });
                            });
                        });

                        return res.status(201).json({                   //201 status di nuovo oggetto creato con successo
                                message: "Post creato con successo",
                                id: postId
                        }) 
    });
}

const update = (req, res) => { 

    //RECUPERO IL POST SE ESISTE
    const id = Number(req.params.id);   // recupero id dall'URL (params)
    const {title,content,image,tags} = req.body;

    //AGGIORNO IL POST 
    //con id nel parametro e attributi nel body 
    connection.query( `UPDATE posts 
                       SET title = ?, content = ?, image = ? 
                       WHERE id = ?`, 
                       [title, content, image, id], 
                       (err, updatedPost) => { 
                            if (err ) return res.status(500).json({ error: "Errore nell'aggiornamento del post" }); 
                            if (updatedPost.affectedRows === 0) return res.status(404).json({ error: `Nessun post con id ${id} da aggiornare` }); 
                            if (updatedPost.changedRows === 0) return res.status(200).json({ message: `Nessun cambiamento nei dati del post ${id}`});
                            
    //AGGIORNO I TAG
    //Inserisco tags in table tags se nuovi

                        const tagValues = tags.map(tag => [tag]);                       //trasformo i parametri in array di array per SQL per inserimento righe multiple (per ogni tag)
                        connection.query(`INSERT IGNORE INTO tags (label) VALUES ?`,    //il comando IGNORE serve in caso il tag esistesse già lo ignora (il campo nella tabella deve essere UNIQUE)
                        [tagValues],(err,tagResults) => {
                            if (err) return res.status(500).json({error:"Internal System Error",message:"Errore inserimento tag"});
                            console.log(`Inseriti ${tagResults.affectedRows} nuovi tag`, tagResults);
    
    //Recupero id dei tag dal nome

                            connection.query(`SELECT id FROM tags WHERE label IN (?)`,[tags],(err, tagIdResults) => {
                                if (err) return res.status(500).json({error: "Internal Server Error",message: "Errore nel recupero degli id dei tag"});
                                console.log(tagIdResults);

                                const postTagValues = tagIdResults.map(tag => [id, tag.id]); //per ogni tag recuperato salvo un array con id del post e id del tag
    
    //Cancello relazioni legate al post
                                connection.query(`DELETE FROM post_tag WHERE post_id = ?`, [id], (err) => {
                                    if (err) return res.status(500).json({ error: 'Errore nella cancellazione relazioni' }); 
    //Creo le nuove relazioni
                                    connection.query(`INSERT INTO post_tag (post_id, tag_id) VALUES ?`, [postTagValues], (err) => {
                                        if (err) return res.status(500).json({error: "Internal Server Error", message: "Errore nell'associazione tag-post"});     
                                        res.status(200).json({ message: `Il post con id ${id} è stato aggiornato`});
                                    });
                                });
                            });
                        });
    });
}

const modify = (req, res) => {
    
    const id = Number(req.params.id);   // recupero id del post dall'URL (params)

    const allowedProperties = ["title","content","image"];   //campi della tabella posts aggiornabili
    const data = {};                                         //preparo un oggetto chiave-valore per costruire il SET nella query (colonna-valore)
    for (const propertyName of allowedProperties){           //per ogni proprietà consentita
        if(req.body[propertyName] !== undefined){            //se è presente nel body request
            data[propertyName] = req.body[propertyName]      //la aggiungo all'oggetto data
        }
    } 

    //AGGIORNO IL POST  
    connection.query( `UPDATE posts 
                       SET ? 
                       WHERE id = ?`,       //prepared statement con SET ?.  Si aspetta un oggetto 
                       [data, id],          //data -> title = 'valore', content = 'valore', image = 'valore'
                       (err, updatedPost) => { 
                            if (err ) return res.status(500).json({ error: "Errore nell'aggiornamento del post" }); 
                            if (updatedPost.affectedRows === 0) return res.status(404).json({ error: `Nessun post con id ${id} da aggiornare` }); 
                            if (updatedPost.changedRows === 0) return res.status(200).json({ message: `Nessun cambiamento nei dati del post ${id}`});
                            console.log(updatedPost);
                            res.status(200).json({ message: `Il post con id ${id} è stato aggiornato`, updated: data});
                       });
}

const destroy = (req, res) => {

    //RECUPERO IL POST SE ESISTE
    const id = Number(req.params.id);   // recupero id dall'URL (params)

    console.log("Recupero il post");

    const sql = `DELETE FROM posts 
                 WHERE id = ?`

    connection.query(   sql,[id],(err) => { 
                            if (err) return res.status(500).json({ error: 'Errore nella cancellazione post' }); 
                            res.sendStatus(204)
                        });
}

module.exports = {index, show, store, update, modify, destroy};