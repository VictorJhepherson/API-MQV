const express = require('express');
const router = express.Router();
const login = require('../middleware/login');

const SystemUserController = require('../controllers/systemusers-controller');

router.post('/', SystemUserController.Login);
router.post('/logout', login, SystemUserController.Logout);
router.post('/refresh', login, SystemUserController.Refresh);

module.exports = router;