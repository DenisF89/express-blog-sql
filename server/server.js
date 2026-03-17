const express = require('express');		//CommonJS(require) vs ModuleJS(import)
const posts = require('../data/post_data.js');	//o uno o l'altro, non si usano insieme (package.json --> "type": "commonjs" o "module")

const app = express();					//creo server		
const port = 3000;						//ingresso su dove il server riceve richieste

app.use(express.static('public'));		//rendo disponibile al serve i file dentro cartella public

app.get('/', (req, res) => {			//richiesta su rotta principale
	console.log("Chiamata ricevuta!");
	res.send('<html><body><h1>Server del mio blog</h1></body></html>') //response:quello che restituisce il server
})

app.get('/bacheca', (req, res) => {		//richiesta su rotta "/bacheca" restituisce un array in formato json
	// res.send(persona); 				//invio JSON e lascio che express "intuisca" il type
	// res.type("json").send(persona) 	//esplicito il type a mano
	res.json(posts); 					//esplicito il type in forma concisa
})


app.listen(port, () => {				//avvio del server che si mette in ascolto di richieste sulla porta indicata
     console.log(`Server avviato su http://localhost:${port}`);
})