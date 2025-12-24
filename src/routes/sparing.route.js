const express = require('express');
const router = express.Router();

// controller per 2 MENIT
const sparingCtrl = require('../controllers/sparing.controller');

// controller per JAM
const sparingHoursCtrl = require('../controllers/sparingHours.controller');


/* ======================
   SPARING PER 2 MENIT
====================== */
router.get('/sparing-weekly-data/:id', sparingCtrl.weeklyById);
router.get('/percentages', sparingCtrl.monthly);
router.get('/percentages/all/:month/:year', sparingCtrl.monthlyAll);
router.get('/percentages/bandung/:month/:year', sparingCtrl.monthlyBandung);
router.get('/percentages/nonbandung/:month/:year', sparingCtrl.monthlyNonBandung);
router.get('/percentages/pwk/:month/:year', sparingCtrl.monthlyPWK);


/* ======================
   SPARING PER JAM
====================== */
router.get('/sparing/sparing-hours-data/:id', sparingHoursCtrl.weeklyById);
router.get('/sparing/percentages-hours/all', sparingHoursCtrl.monthlyAll);
router.get('/sparing/percentages-hours/bandung', sparingHoursCtrl.monthlyBandung);
router.get('/sparing/percentages-hours/nonbandung', sparingHoursCtrl.monthlyNonBandung);
router.get('/sparing/percentages-hours/pwk', sparingHoursCtrl.monthlyPWK);

module.exports = router;
