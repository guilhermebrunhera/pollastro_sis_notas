const express = require('express');
const router = express.Router();
const controller = require('../controllers/produtosController.cjs');

// Rotas básicas de CRUD
router.get('/produtos', controller.listarProdutos);
router.get('/produtos/:id', controller.buscarProdutoPorId);
router.post('/produtos', controller.cadastrarProduto);
router.put('/produtos/:id', controller.editarProduto);
router.delete('/produtos/:id', controller.deletarProduto);
router.put('/produtos/changeDesc/:id', controller.alterarDescProdutoServico);
router.delete('/produtos/removeFoto/:id', controller.removeFotoProd);

module.exports = router;