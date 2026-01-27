const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientesController.cjs');

// Rotas básicas de CRUD
router.get('/clientes', controller.listarClientes);
router.get('/clientes/:id', controller.buscarClientePorId);
router.post('/clientes/pedidos/:id', controller.BuscarNotasClientes);
router.post('/clientes', controller.cadastrarCliente);
router.put('/clientes/:id', controller.editarCliente);
router.delete('/clientes/:id', controller.deletarCliente);

module.exports = router;