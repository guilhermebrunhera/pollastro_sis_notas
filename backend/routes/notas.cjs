const express = require('express');
const router = express.Router();
const controller = require('../controllers/notasController.cjs');

// Rotas para notas de serviço
router.get('/', controller.listarNotas);
router.get('/:id', controller.detalharNota);
router.post('/', controller.criarNota);
router.delete('/:id', controller.deletarNota);

module.exports = router;