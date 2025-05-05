const express = require('express');
const router = express.Router();
const controller = require('../controllers/notasController.cjs');

// Rotas para notas de serviço
router.get('/notas', controller.listarNotas);
router.get('/notas/:id', controller.detalharNota);
router.put('/notas/:id', controller.atualizarNota);
router.post('/notas', controller.criarNota);
router.delete('/notas/:id', controller.deletarNota);
router.put('/notasAlterStatus/:id/:status', controller.alterStatusNota);
router.put('/notasAlterImpressa/:id', controller.alterNotaImpressa);
router.post('/notas/:id/imagens', controller.uploadImagensNota);
router.get('/notas/:id/imagens', controller.getImagensNota);
router.delete('/notas/:id/imagens', controller.deleteImagensNota);

module.exports = router;