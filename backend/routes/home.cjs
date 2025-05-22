const express = require('express');
const router = express.Router();
const controller = require('../controllers/homeController.cjs');

router.get('/home', controller.listarDadosHome);

module.exports = router;