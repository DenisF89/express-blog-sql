const express = require('express');
const postsController = require('../controllers/posts_controller');
const checkId = require('../middlewares/checkId');
const checkRequired = require('../middlewares/checkRequired');
const checkBody = require('../middlewares/checkBody');

const router = express.Router();

router.use('/:id', checkId);    // MIDDLEWARE sul router posts valido su tutti i path con parametro id

//Index (cRud)
router.get('/', postsController.index );

//Show (cRud)	
router.get('/:id', postsController.show );

//Store (Crud) 
router.post('/', checkRequired, checkBody, postsController.store );

//Update (crUd)	
router.put('/:id', checkRequired, checkBody, postsController.update );

//Modify (crUd) 
router.patch('/:id', checkBody, postsController.modify );

//Destroy (cruD) 
router.delete('/:id', postsController.destroy );

module.exports = router;