const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/Clientes', require('./routes/clientes.cjs'));
app.use('/Produtos', require('./routes/produtos.cjs'));
app.use('/Notas', require('./routes/notas.cjs'));

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});