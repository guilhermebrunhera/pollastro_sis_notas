const db = require('../db.cjs');

// Listar todos os produtos
exports.listarProdutos = (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Buscar produto por ID
exports.buscarProdutoPorId = (req, res) => {
    const id = req.params.id;
    db.query(`SELECT 
	produtos.preco as preco_unitario,
	nota_itens.quantidade as quantidade,
	CONCAT(produtos.nome, " - ", produtos.descricao) as nome,
    (produtos.preco * nota_itens.quantidade) as preco_total
FROM 
	notas
	JOIN nota_itens ON notas.id = nota_itens.nota_id
	JOIN produtos ON nota_itens.produto_id = produtos.id
WHERE 
	notas.id = ?
ORDER BY 
	notas.id DESC`, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json(results);
    });
};

// Cadastrar novo produto
exports.cadastrarProduto = (req, res) => {
    const { nome, descricao, preco } = req.body;
    db.query(
        'INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)',
        [nome, descricao, preco],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, message: 'Produto cadastrado com sucesso' });
        }
    );
};

// Editar produto
exports.editarProduto = (req, res) => {
    const id = req.params.id;
    const { nome, descricao, preco } = req.body;
    db.query(
        'UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
        [nome, descricao, preco, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Produto atualizado com sucesso' });
        }
    );
};

// Deletar produto
exports.deletarProduto = (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM produtos WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Produto removido com sucesso' });
    });
};