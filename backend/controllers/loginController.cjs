const db = require('../db.cjs');
const Bcrypt = require('bcrypt');

exports.loginSistem = (req, res) => {
    const {nickname, senha} = req.body;

    db.query(`SELECT senha, nome FROM usuario WHERE nome = ?`, [nickname], (err, data) => {
        if (err) throw err;

        if (data[0]){
            Bcrypt.compare(senha, data[0].senha, (err, hash) => {
                if (err) throw err;
                res.status(200).json({autenticado: hash, userName: data[0].nome})
            })
        } else {
            res.status(404).json({autenticado: false})
        }
    })
};
