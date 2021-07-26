const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

exports.getYoungs = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * 
                         FROM YOUNGS
                        ORDER BY YOU_NAME ASC`;
        conn.query(query, (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            
            return res.status(200).send({ data: results });
        });
    });
};

exports.registerYoungs = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(`SELECT YOU_PHONE
                      FROM YOUNGS
                     WHERE YOU_PHONE = ?`, [req.body.YOU_PHONE], (error, results) => {
            if(error) { return res.status(500).send({ error: error }) }
            if(results.length > 0){
                res.status(409).send({ mensagem: 'Jovem já cadastrado'})
            } else {
                conn.query(
                    'CALL REGISTER_YOUNGS(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                    [
                        req.body.YOU_NAME, req.body.YOU_MAIL, req.body.YOU_DATEBIRTHDAY, 
                        req.body.YOU_PHONE, req.body.YOU_INSTAGRAM, 
                        req.body.YOU_GENRE, req.body.YOU_STATUS, req.body.YADD_STREET,
                        req.body.YADD_NEIGHBORHOOD, req.body.YADD_NUMBER,
                        req.body.YADD_CITY, req.body.YADD_ZIPCODE, req.body.DP_ID
                    ],
                    (error, result, field) => {
                        conn.release();
                        if(error) { res.status(500).send({ error: error }) }

                        return res.status(201).send({
                            mensagem: 'Jovem criado com sucesso'
                        });
                    }
                );
            }
        })
    });
};

exports.getDepartaments = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT YOU.YOU_NAME,
                              DP.DP_DESC,
                              DP.DP_STATUS
                         FROM YOUNGS YOU
                        INNER JOIN YOUNGS_DEPARTAMENTS YDP
                           ON YOU.YOU_ID = YDP.YOU_ID
                        INNER JOIN DEPARTAMENTS DP
                           ON YDP.DP_ID = DP.DP_ID
                        ORDER BY DP_DESC ASC`;
        conn.query(query, (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            
            return res.status(200).send({ data: results });
        });
    });
};