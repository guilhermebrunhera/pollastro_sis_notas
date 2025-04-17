const db = require('../db.cjs');

// Listar todas as notas (sem itens)
exports.listarNotas = (req, res) => {
    const sql = `
        SELECT notas.id, clientes.nome AS cliente, clientes.endereco AS endereco, clientes.telefone AS telefone, COALESCE(clientes.email, '') AS email, data_emissao, status
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
        SELECT notas.id, clientes.nome AS cliente, clientes.telefone, clientes.email, clientes.endereco,
               data_emissao, observacoes, status
        FROM notas
        JOIN clientes ON notas.cliente_id = clientes.id
        WHERE notas.id = ?
    `;
    const itensQuery = `
        SELECT produtos.id AS produto_id, produtos.nome, produtos.descricao, nota_itens.quantidade, nota_itens.preco_unitario
        FROM nota_itens
        JOIN produtos ON nota_itens.produto_id = produtos.id
        WHERE nota_itens.nota_id = ?
    `;

    db.query(notaQuery, [id], (err, notaResult) => {
        if (err) return res.status(500).json({ error: err });
        if (notaResult.length === 0) return res.status(404).json({ error: 'Nota não encontrada' });

        db.query(itensQuery, [id], (err2, itensResult) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json({
                nota: notaResult[0],
                itens: itensResult
            });
        });
    });
};

// Criar nova nota com itens
exports.criarNota = (req, res) => {
    const { cliente_id, itens } = req.body;

    // Configurar data e status default
    const data_emissao = new Date().toISOString().split('T')[0];  // Pega a data no formato YYYY-MM-DD
    const status = 'Producao';  // Valor padrão de status

    const notaSQL = 'INSERT INTO notas (cliente_id, data_emissao, status) VALUES (?, ?, ?)';
    db.query(notaSQL, [cliente_id, data_emissao, status], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        const notaId = result.insertId;

        const itensSQL = 'INSERT INTO nota_itens (nota_id, produto_id, quantidade, preco_unitario) VALUES ?';
        const valores = itens.map(i => [notaId, i.produto_id, i.quantidade, i.preco_unitario]);

        db.query(itensSQL, [valores], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.status(201).json({ message: 'Nota criada com sucesso', id: notaId });
        });
    });
};

// Atualizar nota e seus itens (NOVO)
exports.atualizarNota = (req, res) => {
    const notaId = req.params.id;
    const { cliente_id, data_emissao, observacoes, status, itens } = req.body;

    const updateNotaSQL = `
        UPDATE notas
        SET cliente_id = ?, data_emissao = ?, observacoes = ?, status = ?
        WHERE id = ?
    `;

    db.query(updateNotaSQL, [cliente_id, data_emissao, observacoes, status, notaId], (err) => {
        if (err) return res.status(500).json({ error: err });

        // Deletar os itens antigos
        db.query('DELETE FROM nota_itens WHERE nota_id = ?', [notaId], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            const insertItensSQL = `
                INSERT INTO nota_itens (nota_id, produto_id, quantidade, preco_unitario)
                VALUES ?
            `;

            const valores = itens.map(item => [
                notaId,
                item.produto_id,
                item.quantidade,
                item.preco_unitario
            ]);

            db.query(insertItensSQL, [valores], (err3) => {
                if (err3) return res.status(500).json({ error: err3 });
                res.json({ message: 'Nota atualizada com sucesso' });
            });
        });
    });
};

// Deletar nota e seus itens
exports.deletarNota = (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM nota_itens WHERE nota_id = ?', [id], (err) => {
        if (err) return res.status(500).json({ error: err });

        db.query('DELETE FROM notas WHERE id = ?', [id], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.json({ message: 'Nota e itens deletados com sucesso' });
        });
    });
};