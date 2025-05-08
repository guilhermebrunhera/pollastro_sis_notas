const express = require('express');
const router = express.Router();
const controller = require('../controllers/acompanhamentoController.cjs');

// Rotas básicas de CRUD
router.get('/acompanhamentos', controller.listarAcompanhamentos);
router.get('/acompanhamentos/:id', controller.buscarAcompanhamentosPorId);
router.post('/acompanhamentos', controller.cadastrarAcompanhamentos);
// router.put('/acompanhamento/:id', controller.editarAcompanhamentos);
router.delete('/acompanhamentos/:id', controller.deletarAcompanhamentos);

module.exports = router;