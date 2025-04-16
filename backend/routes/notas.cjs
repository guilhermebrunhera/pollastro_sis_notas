const express = require('express');
const router = express.Router();
const controller = require('../controllers/notasController.cjs');

// Rotas para notas de serviço
router.get('/notas', controller.listarNotas);
router.get('/notas/:id', controller.detalharNota);
router.post('/notas', controller.criarNota);
router.delete('/notas/:id', controller.deletarNota);

module.exports = router;