const db = require('../db.cjs');
const upload = require('../utils/uploadImages.cjs');
const path = require('path');
const fs = require('fs');

// Listar todos os produtos
exports.listarProdutos = (req, res) => {
    db.query('SELECT * FROM produtos ORDER BY CONCAT(trim(nome),trim(descricao)) ASC', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Buscar produto por ID
exports.buscarProdutoPorId = (req, res) => {
    const id = req.params.id;
    db.query(`SELECT 
	nota_itens.preco_unitario as preco_unitario,
	nota_itens.quantidade as quantidade,
	CONCAT(produtos.nome, IF(produtos.descricao != '', CONCAT(' - ', produtos.descricao), '')) as nome,
    (nota_itens.preco_unitario * nota_itens.quantidade) as preco_total,
    produtos.tipo,
    COALESCE(produtos.foto, '') as foto
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
exports.cadastrarProduto = [upload.single('foto'), (req, res) => {
    const { nome, descricao, preco, tipo } = req.body;
    const foto = req.file ? req.file.filename : ""
    db.query(
        'INSERT INTO produtos (nome, descricao, preco, tipo, foto) VALUES (?, ?, ?, ?, ?)',
        [nome, descricao, preco, tipo, foto],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, message: 'Produto cadastrado com sucesso' });
        }
    );
}];

// Editar produto
exports.editarProduto = [upload.single('foto'), (req, res) => {
    const id = req.params.id;
    const { nome, descricao, preco, tipo } = req.body;
    const foto = req.file ? req.file.filename : ""

    db.query(
        'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, tipo = ?, foto = ? WHERE id = ?',
        [nome, descricao, preco, tipo, foto, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Produto atualizado com sucesso' });
        }
    );
}];

// Deletar produto
exports.deletarProduto = (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM produtos WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Produto removido com sucesso' });
    });
};

exports.removeFotoProd = (req, res) => {
    const { id } = req.params;

  // Primeiro, pega o nome do arquivo atual
  db.query('SELECT foto FROM produtos WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar produto' });
    if (results.length === 0) return res.status(404).json({ erro: 'Produto não encontrado' });

    const foto = results[0].foto;
    if (!foto) return res.status(400).json({ erro: 'Produto não possui foto' });

    const caminho = path.join(__dirname, '../uploads/', foto);

    // Remove o arquivo fisicamente
    fs.unlink(caminho, (err) => {
      if (err && err.code !== 'ENOENT') {
        return res.status(500).json({ erro: 'Erro ao apagar a imagem' });
      }

      // Limpa o campo no banco
      db.query('UPDATE produtos SET foto = NULL WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ erro: 'Erro ao limpar campo de foto' });
        res.json({ mensagem: 'Foto removida com sucesso', removed: true });
      });
    });
  });
};

exports.alterarDescProdutoServico = (req, res) => {
    const id = req.params.id;
    const { descricao } = req.body;
    db.query(
        'UPDATE produtos SET descricao = ? WHERE id = ?',
        [descricao, id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Descricao do Produto atualizado com sucesso' });
        }
    );
};