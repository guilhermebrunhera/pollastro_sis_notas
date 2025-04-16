const db = require('../db.cjs');

// Listar todas as notas (sem itens)
exports.listarNotas = (req, res) => {
    const sql = `
        SELECT notas.id, clientes.nome AS cliente, data, hora
        FROM notas
        JOIN clientes ON notas.cliente_id = clientes.id
        ORDER BY notas.id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Detalhar uma nota com cliente + itens
exports.detalharNota = (req, res) => {
    const id = req.params.id;
    const notaQuery = `
        SELECT notas.id, clientes.nome AS cliente, clientes.telefone, clientes.email, clientes.endereco, data, hora
        FROM notas
        JOIN clientes ON notas.cliente_id = clientes.id
        WHERE notas.id = ?
    `;
    const itensQuery = `
        SELECT produtos.nome, produtos.descricao, itens.quantidade, itens.preco
        FROM itens
        JOIN produtos ON itens.produto_id = produtos.id
        WHERE itens.nota_id = ?
    `;

    db.query(notaQuery, [id], (err, notaResult) => {
        if (err) return res.status(500).json({ error: err });
        if (notaResult.length === 0) return res.status(404).json({ error: 'Nota não encontrada' });

        db.query(itensQuery, [id], (err, itensResult) => {
            if (err) return res.status(500).json({ error: err });
            res.json({
                nota: notaResult[0],
                itens: itensResult
            });
        });
    });
};

// Criar nova nota com itens
exports.criarNota = (req, res) => {
    const { cliente_id, data, hora, itens } = req.body;

    const notaSQL = 'INSERT INTO notas (cliente_id, data, hora) VALUES (?, ?, ?)';
    db.query(notaSQL, [cliente_id, data, hora], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        const notaId = result.insertId;

        const itensSQL = 'INSERT INTO itens (nota_id, produto_id, quantidade, preco) VALUES ?';
        const valores = itens.map(i => [notaId, i.produto_id, i.quantidade, i.preco]);

        db.query(itensSQL, [valores], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.status(201).json({ message: 'Nota criada com sucesso', id: notaId });
        });
    });
};

// Deletar nota e seus itens
exports.deletarNota = (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM itens WHERE nota_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        db.query('DELETE FROM notas WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json({ message: 'Nota e itens deletados com sucesso' });
        });
    });
};