const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientesController.cjs');

// Rotas básicas de CRUD
router.get('/Clientes', controller.listarClientes);
router.get('/Clientes/:id', controller.buscarClientePorId);
router.post('/Clientes', controller.cadastrarCliente);
router.put('/Clientes/:id', controller.editarCliente);
router.delete('/Clientes/:id', controller.deletarCliente);

module.exports = router;