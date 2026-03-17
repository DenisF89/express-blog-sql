const express = require('express');		//CommonJS(require) vs ModuleJS(import)
const postsRouter = require('./routers/posts.js'); //recupera file di routing 
const notFound = require('./middlewares/notFound.js');
const errorsHandler = require('./middlewares/errorsHandler.js')

const app = express();					//creo server		
const port = 3000;						//ingresso su dove il server riceve richieste

app.use(express.json());                     //bodyparser -json 
app.use(express.static('public'));		     //rendo disponibile al server i file dentro cartella public
app.use("/posts", postsRouter);              //contiene tutte le richieste fatte all'indirizzo /posts


app.get('/', (req, res) => {			//richiesta su rotta principale
	res.send('<html><body><h1>Server del mio blog</h1></body></html>')
})

app.use(notFound); //se viene chiamato un path inesistente -> 404 page not found

app.use(errorsHandler); //se viene rilevato un errore -> 500 internal server error

app.listen(port, () => {				//avvio del server che si mette in ascolto di richieste sulla porta indicata
     console.log(`Server avviato su http://localhost:${port}`);
})




