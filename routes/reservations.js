const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { isAuthenticated } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', reservationController.index);
router.get('/create', reservationController.create);
router.post('/', reservationController.store);
router.get('/today', reservationController.todayView);
router.get('/calendar', reservationController.calendar);
router.get('/reports', reservationController.reports);
router.get('/:id', reservationController.show);
router.get('/:id/edit', reservationController.edit);
router.put('/:id', reservationController.update);
router.patch('/:id/status', reservationController.updateStatus);
router.delete('/:id', reservationController.destroy);

module.exports = router;
