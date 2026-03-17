function errorsHandler(err, req, res, next) {
    console.log("Errore rilevato: "+err.message)

    if (err.status === 400) {
        return res.status(400).json({ error: "Dati passati formati male" });
    }

    res.status(500)
    res.json({
    error: "Errore interno del server"
    });
};
module.exports = errorsHandler;