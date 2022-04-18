const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const YoungsController = require('../controllers/youngs-controller');

router.get('/', login, YoungsController.getYoungs);
router.get('/departaments', login, YoungsController.getDepartaments);
router.post('/', login, YoungsController.registerYoungs);

module.exports = router;