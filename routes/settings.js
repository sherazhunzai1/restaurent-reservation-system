const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const locationController = require('../controllers/locationController');
const { isAuthenticated, isSuperAdmin } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', settingsController.general);
router.post('/', settingsController.updateGeneral);

router.get('/hours', settingsController.operatingHours);
router.post('/hours', settingsController.updateOperatingHours);

router.get('/special-dates', settingsController.specialDates);
router.post('/special-dates', settingsController.storeSpecialDate);
router.delete('/special-dates/:id', settingsController.deleteSpecialDate);

router.get('/locations', locationController.index);
router.post('/locations', locationController.store);
router.put('/locations/:id', locationController.update);
router.patch('/locations/:id/toggle', locationController.toggleStatus);
router.delete('/locations/:id', locationController.destroy);

router.get('/staff', settingsController.staffIndex);
router.post('/staff', settingsController.storeStaff);
router.patch('/staff/:id/toggle', settingsController.toggleStaffStatus);
router.delete('/staff/:id', settingsController.deleteStaff);

module.exports = router;
