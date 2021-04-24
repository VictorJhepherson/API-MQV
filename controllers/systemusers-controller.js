const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.RegisterSystem = async (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(`SELECT SU_LOGINNAME FROM SYSTEMUSERS WHERE SU_LOGINNAME = ?`, 
        [req.body.SU_LOGINNAME], (error, results) => {
            if(error) { return res.status(500).send({ error: error }) }
            if(results.length > 0){
                res.status(409).send({ message: 'Usuário já cadastrado'})
            } else {
                bcrypt.hash(req.body.SU_PASSWORD, 10, (errBcrypt, hash) => {
                    if(errBcrypt){ return res.status(500).send({ error: errBcrypt }) }
                    conn.query(
                        'CALL REGISTER_SYSTEMUSERS(?, ?);', 
                        [ req.body.SU_LOGINNAME, hash ],
                        (error, result, field) => {
                            conn.release();
                            if(error) { res.status(500).send({ error: error }) }

                            let token = jwt.sign({ SU_LOGINNAME: req.body.SU_LOGINNAME }, process.env.JWT_KEY, { expiresIn: "7d" });  
                            return res.status(201).send({
                                message: 'Usuário criado com sucesso',
                                token: token
                            });
                        }
                    );
                });
            }
        })
    });
};

exports.Login = async (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM SYSTEMUSERS WHERE SU_LOGINNAME = ?`;
        conn.query(query, [req.body.SU_LOGINNAME], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ message: 'Falha na autenticação'});
            }
            bcrypt.compare(req.body.SU_PASSWORD, results[0].SU_PASSWORD, (err, result) => {
                if (err) {
                    return res.status(401).send({ message: 'Falha na autenticação'});
                }
                if (result) {
                    let token = jwt.sign({
                        SU_LOGINNAME: results[0].SU_LOGINNAME
                    }, process.env.JWT_KEY, { expiresIn: "7d" });
                    return res.status(200).send({ message: 'Autenticado com sucesso', data: results[0], token: token });
                }
                return res.status(401).send({ message: 'Falha na autenticação'});
            });
        });
    });
};

exports.Logout = (req, res, next) => {
    if (req.body.token != null && req.body.token != undefined) {
        return res.status(200).send({ message: 'Logout com sucesso', token: null });
    }
};

exports.Refresh = async (req, res, next) => {
    if (req.body.token != null && req.body.token != undefined) {
        mysql.getConnection((error, conn) => {
            if(error) { return res.status(500).send({ error: error }) }
            const query = `SELECT * FROM SYSTEMUSERS WHERE SU_ID = ?`;
            conn.query(query, [req.body.user], (error, results, fields) => {
                conn.release();
                if(error) { return res.status(500).send({ error: error }) }
                if (results.length < 1) {
                    return res.status(401).send({ message: 'Falha na autenticação'});
                }
                let token = jwt.sign({ SU_LOGINNAME: results[0].SU_LOGINNAME }, process.env.JWT_KEY, { expiresIn: "7d" });
                return res.status(200).send({ message: 'Autenticado com sucesso', data: results[0], token: token });
            });
        });
    } else { 
        return res.status(401).send({ message: 'Falha na autenticação'});
    }
};
