const db = require('../db.cjs');

exports.listarAcompanhamentos = (req, res) => {
    db.query(
        'SELECT produto_id, quantidade, local, data_saida, nome, descricao, preco, tipo, produtos_acompanhamento.id FROM produtos_acompanhamento JOIN produtos ON produtos.id = produto_id',
        (err, data) => {
            if (err) return res.status(500).json({ error: err });
            res.json(data);
        }
    );
};

exports.buscarAcompanhamentosPorId = (req, res) => {
    const id = req.params.id;
    db.query(
        'SELECT * FROM produtos_acompanhamento JOIN produtos ON produtos.id = produto_id WHERE produtos_acompanhamento.id = ?', 
        [id],
        (err, data) => {
            if (err) return res.status(500).json({ error: err });
            res.json(data);
        }
    );
};

exports.cadastrarAcompanhamentos = (req, res) => {
    const { produto_id, quantidade, local, data_saida } = req.body;
    db.query(
        'INSERT INTO produtos_acompanhamento (produto_id, quantidade, local, data_saida) VALUES (?, ?, ?, ?)',
        [produto_id, quantidade, local, data_saida],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, message: 'Acompanhamento cadastrado com sucesso' });
        }
    );
};

exports.deletarAcompanhamentos = (req, res) => {
    const id = req.params.id;
    db.query(
        'DELETE FROM produtos_acompanhamento WHERE id = ?',
        [id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, message: 'Cliente cadastrado com sucesso' });
        }
    );
};