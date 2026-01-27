const express = require('express');
const router = express.Router();
const controller = require('../controllers/homeController.cjs');

router.get('/home', controller.listarDadosHome);
router.get('/pedidos_vencidos', controller.listarPedidosVencidos);

module.exports = router;