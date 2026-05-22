const express = require('express');
const router = express.Router();

// controller per 2 MENIT
const sparingCtrl = require('../controllers/sparing.controller');

// controller per JAM
const sparingHoursCtrl = require('../controllers/sparingHours.controller');

const sparingValidityCtrl = require('../controllers/sparingValidity.controller');


/* ======================
   SPARING PER 2 MENIT
====================== */
router.get('/previous-month-data/:id/:month/:year', sparingCtrl.weeklyById);
router.get('/percentages/:month/:year', sparingCtrl.monthly);
router.get('/percentages/all/:month/:year', sparingCtrl.monthlyAll);
router.get('/percentages/bandung/:month/:year', sparingCtrl.monthlyBandung);
router.get('/percentages/nonbandung/:month/:year', sparingCtrl.monthlyNonBandung);
router.get('/percentages/pwk/:month/:year', sparingCtrl.monthlyPWK);


/* ======================
   SPARING PER JAM
====================== */
router.get('/previous-month-data-hours/:id/:month/:year', sparingHoursCtrl.weeklyById);
router.get('/percentages-hours/all', sparingHoursCtrl.monthlyAll);
router.get('/percentages-hours/bandung', sparingHoursCtrl.monthlyBandung);
router.get('/percentages-hours/nonbandung', sparingHoursCtrl.monthlyNonBandung);
router.get('/percentages-hours/pwk', sparingHoursCtrl.monthlyPWK);

/* ======================
   SPARING VALIDITY
====================== */
router.get('/previous-month-validity/:month/:year', sparingValidityCtrl.validityById);

module.exports = router;
