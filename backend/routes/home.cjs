const express = require('express');
const router = express.Router();
const controller = require('../controllers/homeController.cjs');
const upload = require('../utils/uploadImages.cjs');

router.get('/home', controller.listarDadosHome);
router.get('/pedidos_vencidos', controller.listarPedidosVencidos);
router.get('/boletos', controller.listarBoletos);
router.put('/boletos/:id', controller.updateStatusBoleto);
router.post('/boletos', upload.single('foto'), controller.adicionarBoleto);
router.get('/boletos/para_vencer', controller.boletoParaVencer);
router.delete('/boletos/:id', controller.deletarBoleto);
module.exports = router;