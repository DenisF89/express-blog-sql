const posts = require('../data/post_data.js');	

function checkPost(req, res, next) {

//RECUPERO IL POST SE ESISTE
    const id = Number(req.params.id);
    console.log("Recupero il post");
    const post = posts.find(post=>post.id===id);
	if(!post){
        console.log("Il post "+id+" non esiste")
        return res.status(404).json(
                                        {
                                            error:"Not Found",
                                            message:"Il post "+id+" non esiste"
                                        }
                                    );
    }
    req.post = post;
    console.log("Post recuperato")
   next();
};

module.exports = checkPost;