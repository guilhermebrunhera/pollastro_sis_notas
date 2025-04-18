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
            SUM(produtos.preco * nota_itens.quantidade) AS precoEmProducao 
        FROM 
            notas
            JOIN nota_itens ON notas.id = nota_itens.nota_id
            JOIN produtos ON produtos.id = nota_itens.produto_id
        WHERE
            notas.status = "Producao"
    `;

    const sqlValorRecebido = `
        SELECT 
            SUM(produtos.preco * nota_itens.quantidade) AS precoFinalizada 
        FROM 
            notas
            JOIN nota_itens ON notas.id = nota_itens.nota_id
            JOIN produtos ON produtos.id = nota_itens.produto_id
        WHERE
            notas.status = "Finalizada"
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
