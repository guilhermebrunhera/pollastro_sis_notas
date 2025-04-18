const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use(require('./routes/clientes.cjs'));
app.use(require('./routes/produtos.cjs'));
app.use(require('./routes/notas.cjs'));
app.use(require('./routes/home.cjs'));

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});