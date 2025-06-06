const db = require('../db.cjs');
const upload = require('../utils/uploadImages.cjs');
const path = require('path');
const fs = require('fs');

// Listar todas as notas (sem itens)
exports.listarNotas = (req, res) => {
    const mes = req.params.mes;

    console.log(mes + " - " + typeof(mes))

    if(mes === null || mes === `null`){
        const sql = `
        SELECT 
            notas.id, 
            clientes.nome AS cliente, 
            COALESCE(clientes.endereco, "") AS endereco, 
            COALESCE(clientes.cidade, "") AS cidade, 
            COALESCE(clientes.cep, "") AS cep, 
            COALESCE(clientes.contato, "") AS contato, 
            COALESCE(clientes.tel_contato, "") AS tel_contato, 
            clientes.telefone AS telefone, 
            COALESCE(clientes.email, '') AS email, 
            data_emissao, 
            status,
            COALESCE(notas.observacoes, "") AS observacoes,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) - COALESCE(notas.desconto, 0) AS totalNota,
            notas.desconto as desconto,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) as totalNotaSemDesconto,
            notas.desconto_obs,
            notas.nota_impressa
        FROM 
            notas
            JOIN clientes ON notas.cliente_id = clientes.id
            JOIN nota_itens ON notas.id = nota_itens.nota_id
        GROUP BY
            notas.id, clientes.nome, clientes.endereco, clientes.telefone, clientes.email, data_emissao
        ORDER BY 
            notas.id DESC
        `;
        db.query(sql, (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        });
    } else {
        const sql = `
        SELECT 
            notas.id, 
            clientes.nome AS cliente, 
            COALESCE(clientes.endereco, "") AS endereco, 
            COALESCE(clientes.cidade, "") AS cidade, 
            COALESCE(clientes.cep, "") AS cep, 
            COALESCE(clientes.contato, "") AS contato, 
            COALESCE(clientes.tel_contato, "") AS tel_contato, 
            clientes.telefone AS telefone, 
            COALESCE(clientes.email, '') AS email, 
            data_emissao, 
            status,
            COALESCE(notas.observacoes, "") AS observacoes,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) - COALESCE(notas.desconto, 0) AS totalNota,
            notas.desconto as desconto,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) as totalNotaSemDesconto,
            notas.desconto_obs,
            notas.nota_impressa
        FROM 
            notas
            JOIN clientes ON notas.cliente_id = clientes.id
            JOIN nota_itens ON notas.id = nota_itens.nota_id
        WHERE
            DATE_FORMAT(data_emissao, '%Y-%m') = ?
        GROUP BY
            notas.id, clientes.nome, clientes.endereco, clientes.telefone, clientes.email, data_emissao
        ORDER BY 
            notas.id DESC
        `;
        db.query(sql, [mes], (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        });
    }
    
};


exports.listarNotasItem = (req, res) => {
    const sql = `
        SELECT 
            notas.id, 
            clientes.nome AS cliente, 
            clientes.endereco AS endereco, 
            clientes.telefone AS telefone, 
            COALESCE(clientes.email, '') AS email, 
            data_emissao, 
            status,
            COALESCE(notas.observacoes, "") AS observacoes,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) AS totalNota,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) - COALESCE(notas.desconto, 0) AS totalNota,
            notas.desconto as desconto,
            SUM(nota_itens.preco_unitario * nota_itens.quantidade) as totalNotaSemDesconto,
            notas.desconto_obs,
            notas.nota_impressa
        FROM 
            notas
            JOIN clientes ON notas.cliente_id = clientes.id
            JOIN nota_itens ON notas.id = nota_itens.nota_id
        GROUP BY
            notas.id, clientes.nome, clientes.endereco, clientes.telefone, clientes.email, data_emissao
        ORDER BY 
            notas.id DESC
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
        SELECT notas.id, clientes.nome AS cliente, clientes.telefone, clientes.email, clientes.endereco, notas.cliente_id,
               data_emissao, COALESCE(observacoes, "") as observacoes, status, notas.nota_impressa, notas.desconto, notas.desconto_obs
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
        console.log(1, err)
        if (err) return res.status(500).json({ error: err });
        if (notaResult.length === 0) return res.status(404).json({ error: 'Nota não encontrada' });

        db.query(itensQuery, [id], (err2, itensResult) => {
            console.log(2, err2)
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
    const { cliente_id, itens, data_emissao, observacoes, desconto, status, desconto_obs } = req.body;

    const notaSQL = 'INSERT INTO notas (cliente_id, data_emissao, status, observacoes, desconto, desconto_obs) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(notaSQL, [cliente_id, data_emissao, status, observacoes, desconto, desconto_obs], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        const notaId = result.insertId;

        const itensSQL = 'INSERT INTO nota_itens (nota_id, produto_id, quantidade, preco_unitario, descricao_servico) VALUES ?';
        const valores = itens.map(i => [notaId, i.produto_id, i.quantidade, i.preco_unitario, i.descricaoChange]);

        db.query(itensSQL, [valores], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });
            res.status(201).json({ message: 'Nota criada com sucesso', id: notaId });
        });
    });
};

// Atualizar nota e seus itens (NOVO)
exports.atualizarNota = (req, res) => {
    const notaId = req.params.id;
    const { cliente_id, data_emissao, observacoes, status, itens, desconto, desconto_obs } = req.body;

    const updateNotaSQL = `
        UPDATE notas
        SET cliente_id = ?, data_emissao = ?, observacoes = ?, status = ?, desconto = ?, desconto_obs = ?
        WHERE id = ?
    `;

    db.query(updateNotaSQL, [cliente_id, data_emissao, observacoes, status, desconto, desconto_obs, notaId], (err) => {
        if (err) return res.status(500).json({ error: err });

        // Deletar os itens antigos
        db.query('DELETE FROM nota_itens WHERE nota_id = ?', [notaId], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            const insertItensSQL = `
                INSERT INTO nota_itens (nota_id, produto_id, quantidade, preco_unitario, descricao_servico)
                VALUES ?
            `;

            const valores = itens.map(item => [
                notaId,
                item.produto_id,
                item.quantidade,
                item.preco_unitario,
                item.descricaoChange
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

// Atualizar nota e seus itens (NOVO)
exports.alterStatusNota = (req, res) => {
    const notaId = req.params.id;
    const status = req.params.status;

    const updateNotaSQL = `
        UPDATE notas
        SET status = ?
        WHERE id = ?
    `;

    db.query(updateNotaSQL, [status, notaId], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({message: "Status da nota atualizada com sucesso!"})
    });
};

exports.alterNotaImpressa = (req, res) => {
    const notaId = req.params.id;

    const updateNotaSQL = `
        UPDATE notas
        SET nota_impressa = 1
        WHERE id = ?
    `;

    db.query(updateNotaSQL, [notaId], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({message: "Nota Impressa!"})
    });
};

exports.uploadImagensNota = [
    upload.array('imagens', 15), // aceita até 15 imagens de uma vez
    (req, res) => {
      const notaId = req.params.id;
  
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada' });
      }
  
      // Monta os valores para inserir no banco
      const valores = req.files.map(file => [notaId, `uploads/` + file.filename]);
  
      const sql = 'INSERT INTO notas_imagens (nota_id, caminho_imagem) VALUES ?';
      db.query(sql, [valores], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: 'Imagens salvas com sucesso!' });
      });
    }
  ];

exports.getImagensNota = [
    (req, res) => {
      const notaId = req.params.id;
  
      const sql = 'SELECT * FROM notas_imagens WHERE nota_id = ?';
      db.query(sql, [notaId], (err, data) => {
        if (err) return res.status(500).json({ error: err });
        res.json(data);
      });
    }
  ];

  exports.deleteImagensNota = [
    (req, res) => {
      const idImage = req.params.id;
  
      db.query('SELECT caminho_imagem FROM notas_imagens WHERE id = ?', [idImage], (err, data) => {
        if (err) return res.status(500).json({ error: err });
        const caminhoFisico = path.join(__dirname, '..', data[0].caminho_imagem);

        fs.unlink(caminhoFisico, (err) => {
            if(err){
                return res.json({message: 'erro ao excluir a foto fisica do sistema'})
            }
            const sql = 'DELETE FROM notas_imagens WHERE id = ?';
            db.query(sql, [idImage], (err, data) => {
                if (err) return res.status(500).json({ error: err });
                res.json(data);
            });
        })
      })
    }
  ];