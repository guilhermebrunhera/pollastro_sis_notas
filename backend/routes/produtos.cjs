const express = require('express');
const router = express.Router();
const controller = require('../controllers/produtosController.cjs');

// Rotas básicas de CRUD
router.get('/', controller.listarProdutos);
router.get('/:id', controller.buscarProdutoPorId);
router.post('/', controller.cadastrarProduto);
router.put('/:id', controller.editarProduto);
router.delete('/:id', controller.deletarProduto);

module.exports = router;