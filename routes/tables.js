const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', tableController.index);
router.get('/create', tableController.create);
router.post('/', tableController.store);
router.get('/:id/edit', tableController.edit);
router.put('/:id', tableController.update);
router.delete('/:id', tableController.destroy);

module.exports = router;
