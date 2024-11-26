const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();
const port = 3000;

// const dbConfig = {
    // user: 'user',
    // password: 'password',
    // server: '127.0.0.1',
    // database: 'db',
    // options: {
        // encrypt: true,
        // trustServerCertificate: true
    // }
// };

// Rota para buscar vagas
// app.get('/api/vagas', async (req, res) => {
    // try {
        // const pool = await sql.connect(dbConfig);
        // const result = await pool.request().query('SELECT * FROM Vagas');
        // res.json(result.recordset); // Retorna as vagas no formato JSON
    // } catch (err) {
        // console.error(err);
        // res.status(500).send('Erro ao buscar vagas.');
    // }
// })

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
