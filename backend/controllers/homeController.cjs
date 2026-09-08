const db = require('../db.cjs');

exports.listarDadosHome = (req, res) => {
    let array = [];

    const sqlCountProdutos = `
        SELECT count(produtos.id) AS countProdutos FROM produtos
    `;
    const sqlCountClientes = `
        SELECT count(id) AS countClientes FROM clientes
    `;
    const sqlCountNotasEmAberto = `
        SELECT count(id) AS countNotasEmAberto FROM notas WHERE status = 'Producao'
    `;

    const sqlValorNotasReceber = `
        SELECT 
            SUM(subtotal - COALESCE(desconto, 0)) AS precoEmProducao
        FROM (
            SELECT 
                notas.id,
                SUM(nota_itens.preco_unitario * nota_itens.quantidade) AS subtotal,
                notas.desconto
            FROM 
                notas
                JOIN nota_itens ON notas.id = nota_itens.nota_id
            WHERE
                notas.status != "Paga"
            GROUP BY notas.id
        ) AS notas_sub
    `;

    const sqlValorRecebido = `
        SELECT 
            SUM(subtotal - COALESCE(desconto, 0)) AS precoFinalizada
        FROM (
            SELECT 
                notas.id,
                SUM(nota_itens.preco_unitario * nota_itens.quantidade) AS subtotal,
                notas.desconto
            FROM 
                notas
                JOIN nota_itens ON notas.id = nota_itens.nota_id
            WHERE
                notas.status = "Paga"
            GROUP BY notas.id
        ) AS notas_sub
    `;

    db.query(sqlCountProdutos, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        array.push(results[0]);
        db.query(sqlCountClientes, (err, results) => {
            if (err) return res.status(500).json({ error: err });
            array.push(results[0]);
            db.query(sqlCountNotasEmAberto, (err, results) => {
                if (err) return res.status(500).json({ error: err });
                array.push(results[0]);
                db.query(sqlValorNotasReceber, (err, results) => {
                    if (err) return res.status(500).json({ error: err });
                    array.push(results[0]);
                    db.query(sqlValorRecebido, (err, results) => {
                        if (err) return res.status(500).json({ error: err });
                        array.push(results[0]);
                        res.json(array)
                    });
                });
            });
        });
    });
};

exports.listarPedidosVencidos = (req, res) => {

    db.query(`
        SELECT
	notas.id,
    DATEDIFF(now(), data_emissao) AS dias_atraso,
    SUM(nota_itens.preco_unitario * nota_itens.quantidade) - COALESCE(notas.desconto, 0) AS totalNota,
    clientes.nome as clienteNome,
    data_emissao,
    clientes.telefone
FROM 
	notas
    JOIN nota_itens ON nota_itens.nota_id = notas.id
    JOIN clientes ON clientes.id = notas.cliente_id
WHERE 
	data_emissao <= NOW() - INTERVAL 30 DAY
    AND status != 'Paga' AND status != 'Cancelada'
GROUP BY
	notas.id
ORDER BY 
	clientes.nome
        `, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.listarBoletos = (req, res) => {
  const sql = `
    SELECT
      b.id,
      b.nome_boleto,
      b.valor_boleto,
      DATE_FORMAT(b.data_vencimento, '%d/%m/%Y') AS data_vencimento,
      b.status,
      b.local_foto,
      b.linha_digitavel
    FROM
      boletos_pagar AS b
    ORDER BY
      CASE
        WHEN b.status = 'Em Aberto' THEN 0
        ELSE 1
      END,
      b.data_vencimento ASC,
      b.id ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json(results);
  });
};

exports.boletoParaVencer = (req, res) => {
    db.query(`SELECT 
	    nome_boleto,
        DATEDIFF(data_vencimento, current_date) as dias_vencimento,
        valor_boleto,
        linha_digitavel
    FROM boletos_pagar
    WHERE 
        status = "Em Aberto"
        AND DATEDIFF(data_vencimento, current_date) <= 4
    GROUP BY
        id
    `, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.deletarBoleto = (req, res) => {
    const { id } = req.params;  
    db.query(`DELETE FROM boletos_pagar WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({message: "Boleto deletado com sucesso!"})
    })
}

exports.updateStatusBoleto = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const updateNotaSQL = `
            UPDATE boletos_pagar
            SET status = ?
            WHERE id = ?
        `;

    db.query(updateNotaSQL, [status, id], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({message: "Status do boleto atualizado com sucesso!"})
    })
};

exports.adicionarBoleto = (req, res) => {
    const { nome_boleto, valor_boleto, data_vencimento, status, linha_digitavel } = req.body;
    
    const foto = req.file?.filename || null;
    const updateNotaSQL = `
            INSERT INTO boletos_pagar (
                nome_boleto,
                valor_boleto,
                data_vencimento,
                status,
                local_foto,
                linha_digitavel
            )
            VALUES (?, ?, ?, ?, ?, ?);
        `;

    db.query(updateNotaSQL, [nome_boleto, valor_boleto, data_vencimento, status, foto, linha_digitavel], (err) => {
        if (err) return res.status(500).json({ error: err });

        res.json({success: true, message: "Boleto adicionado com sucesso!"})
    })
}
