const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Rotas
app.use(require('./routes/clientes.cjs'));
app.use(require('./routes/produtos.cjs'));
app.use(require('./routes/notas.cjs'));
app.use(require('./routes/home.cjs'));
app.use(require('./routes/acompanhamento.cjs'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html')); // ou 'build'
// });

app.listen(3000, () => {
    console.log('Servidor rodando na porta 80');
});