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
