const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { isAuthenticated, isSuperAdmin } = require('../middlewares/auth');

router.use(isAuthenticated);

router.get('/', settingsController.general);
router.post('/', settingsController.updateGeneral);

router.get('/hours', settingsController.operatingHours);
router.post('/hours', settingsController.updateOperatingHours);

router.get('/special-dates', settingsController.specialDates);
router.post('/special-dates', settingsController.storeSpecialDate);
router.delete('/special-dates/:id', settingsController.deleteSpecialDate);

router.get('/staff', settingsController.staffIndex);
router.post('/staff', settingsController.storeStaff);
router.patch('/staff/:id/toggle', settingsController.toggleStaffStatus);
router.delete('/staff/:id', settingsController.deleteStaff);

module.exports = router;
