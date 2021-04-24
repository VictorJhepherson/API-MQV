const express = require('express');
const router = express.Router();
const mysql = require('../mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.RegisterSystem = async (req, res, next) => {
    try 
    {
        const query = `SELECT * FROM SYSTEMUSERS WHERE SU_LOGINNAME = ?`;
        var results = await mysql.execute(query, [req.body.SU_LOGINNAME]);
        if (results.length > 0) 
            return res.status(401).send({ message: 'Usuário já cadastrado' })

        const hash = await bcrypt.hashSync(req.body.SU_PASSWORD, 10);

        query = 'CALL REGISTER_SYSTEMUSERS(?, ?)';
        const result = await mysql.execute(query, [req.body.SU_LOGINNAME, hash]);
        if(result) {
            let token = jwt.sign({ SU_LOGINNAME: result[0].SU_LOGINNAME }, process.env.JWT_KEY, {expiresIn: "7d" });
            return res.status(201).send({ mensagem: 'Usuário criado com sucesso', data: result[0], token: token});
        }
    } catch (error) {
        return res.status(500).send({ error });
    }
};

exports.Login = async (req, res, next) => {
    try 
    {
        const query = `SELECT * FROM SYSTEMUSERS WHERE SU_LOGINNAME = ?`;
        var results = await mysql.execute(query, [req.body.SU_LOGINNAME]);
        if (results.length < 1) 
            return res.status(401).send({ message: 'Falha na autenticação' })

        if (await bcrypt.compareSync(req.body.SU_PASSWORD, results[0].SU_PASSWORD)) {
            const token = jwt.sign({
                SU_LOGINNAME: results[0].SU_LOGINNAME
            }, process.env.JWT_KEY, { expiresIn: "7d" });

            return res.status(200).send({
                message: 'Autenticado com sucesso',
                token: token,
                data: results[0]
            });
        }
        
        return res.status(401).send({ message: 'Falha na autenticação' })

    } catch (error) {
        return res.status(500).send({ message: 'Falha na autenticação' });
    }
};

exports.Logout = (req, res, next) => {
    try { 
        if (req.body.token != null && req.body.token != undefined) {
            return res.status(200).send({ mensagem: 'Logout com sucesso', token: null });
        }
    } catch(error) {
        return res.status(500).send({ message: 'Falha no logout' });
    }
};

exports.Refresh = async (req, res, next) => {
    try 
    {
        if (req.body.token != null && req.body.token != undefined) {
            const query = `SELECT * FROM SYSTEMUSERS WHERE SU_ID = ?`;
            var results = await mysql.execute(query, [req.body.user]);
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação'});
            } else {
                let token = jwt.sign({ SU_LOGINNAME: results[0].SU_LOGINNAME }, process.env.JWT_KEY, {expiresIn: "7d" });
                return res.status(200).send({ mensagem: 'Autenticado com sucesso', data: results[0], token: token});
            }
        }

        return res.status(401).send({ mensagem: 'Falha na autenticação'});

    } catch (error) {
        return res.status(500).send({ message: 'Falha na autenticação' });
    }
};
