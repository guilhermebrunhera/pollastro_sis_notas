const express = require('express');
const router = express.Router();
const controller = require('../controllers/loginController.cjs');

router.post('/', controller.loginSistem);

module.exports = router;