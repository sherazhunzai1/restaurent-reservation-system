const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/', publicController.home);
router.get('/reserve', publicController.reservePage);
router.post('/reserve', publicController.submitReservation);

module.exports = router;
