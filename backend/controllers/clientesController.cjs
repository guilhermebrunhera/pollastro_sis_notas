const db = require('../db.cjs');

// Listar todos os clientes
exports.listarClientes = (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Buscar cliente por ID
exports.buscarClientePorId = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM clientes WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
        res.json(results[0]);
    });
};

// Cadastrar novo cliente
exports.cadastrarCliente = (req, res) => {
    const { nome, telefone, email, endereco } = req.body;
    db.query(
        'INSERT INTO clientes (nome, telefone, email, endereco) VALUES (?, ?, ?, ?)',
        [nome, telefone, email, endereco],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, message: 'Cliente cadastrado com sucesso' });
        }
    );
};

// Editar cliente
exports.editarCliente = (req, res) => {
    const id = req.params.id;
    const { nome, telefone, email, endereco } = req.body;
    db.query(
        'UPDATE clientes SET nome = ?, telefone = ?, email = ?, endereco = ? WHERE id = ?',
        [nome, telefone, email, endereco, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Cliente atualizado com sucesso' });
        }
    );
};

// Deletar cliente
exports.deletarCliente = (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM clientes WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Cliente removido com sucesso' });
    });
};