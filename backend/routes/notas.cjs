const express = require('express');
const router = express.Router();
const controller = require('../controllers/notasController.cjs');

// Rotas para notas de serviço
router.get('/notas/:mes', controller.listarNotas);
router.get('/notas/id/:id', controller.detalharNota);
router.put('/notas/:id', controller.atualizarNota);
router.post('/notas', controller.criarNota);
router.delete('/notas/:id', controller.deletarNota);
router.put('/notasAlterStatus/:id/:status', controller.alterStatusNota);
router.put('/notasAlterImpressa/:id', controller.alterNotaImpressa);
router.post('/notas/:id/imagens', controller.uploadImagensNota);
router.get('/notas/:id/imagens', controller.getImagensNota);
router.delete('/notas/:id/imagens', controller.deleteImagensNota);

router.post('/pagamentos/:notaId', controller.postPagamento);
router.put('/pagamentos/:notaId/:id', controller.putPagamento);
router.get('/pagamentos/:notaId', controller.getPagamentos);
router.get('/pagamentos/:notaId/:id', controller.getPagamentoId);
router.delete('/pagamentos/:id', controller.deletePagamento);

module.exports = router;