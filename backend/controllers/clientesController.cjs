const db = require('../db.cjs');

// Listar todos os clientes
exports.listarClientes = (req, res) => {
    db.query(`SELECT 
                id,
                nome,
                telefone,
                COALESCE(email, "") as email,
                COALESCE(endereco, "") as endereco,
                COALESCE(cpf_cnpj, "") as cpf_cnpj,
                cidade,
                COALESCE(cep, "") as cep,
                COALESCE(contato, "") as contato,
                COALESCE(tel_contato, "") as tel_contato
            FROM 
                clientes 
            ORDER BY 
                nome ASC`, (err, results) => {
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
    const { nome, telefone, email, cidade, cpf_cnpj , endereco, cep, contato, tel_contato  } = req.body;
    db.query(
        'INSERT INTO clientes (nome, telefone, email, cidade, cpf_cnpj, endereco, cep, contato, tel_contato) VALUES (?, ?, ?, ?, ?,?,?,?,?)',
        [nome, telefone, email, cidade, cpf_cnpj, endereco, cep, contato, tel_contato],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ id: result.insertId, message: 'Cliente cadastrado com sucesso' });
        }
    );
};

// Editar cliente
exports.editarCliente = (req, res) => {
    const id = req.params.id;
    const { nome, telefone, email, cidade, cpf_cnpj, endereco, cep, contato, tel_contato } = req.body;
    db.query(
        'UPDATE clientes SET nome = ?, telefone = ?, email = ?, cidade = ?, cpf_cnpj = ? , endereco = ?, cep = ?, contato = ?, tel_contato = ? WHERE id = ?',
        [nome, telefone, email, cidade, cpf_cnpj, endereco, cep, contato, tel_contato, id],
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