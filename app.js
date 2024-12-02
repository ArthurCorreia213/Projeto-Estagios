const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();
const port = 3000;

const dbConfig = {
    user: 'usuario',
    password: 'senai103103',
    server: '127.0.0.1',
    database: 'Estagios',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Rota para buscar empresas
app.get('/api/empresas', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Empresas');
        res.json(result.recordset); // Retorna as empresas no formato JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar vagas.');
    }
})

app.get('/api/empresas-pendentes', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Empresas WHERE Status_Cadastro = 'Pendente'");
        res.json(result.recordset); // Retorna as empresas no formato JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar vagas.');
    }
})

app.get('/api/candidatos', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Candidatos');
        res.json(result.recordset); // Retorna os alunos no formato JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar vagas.');
    }
})

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

sql.connect(dbConfig)
    .then(pool => {
        console.log('Conexão com o banco de dados estabelecida!');
        return pool; // Retorna a pool de conexões
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });

app.post('/cadastro', async (req, res) => {
    const { nome, cnpj, contato, status_cadastro } = req.body;

    try {
        await sql.connect(dbConfig);
        const query = `
            INSERT INTO Empresas (Nome, CNPJ, Contato, Status_Cadastro)
            VALUES (@Nome, @CNPJ, @Contato, @Status_Cadastro)
        `;

        const request = new sql.Request();
        request.input('nome', sql.NVarChar, nome);
        request.input('cnpj', sql.NVarChar, cnpj);
        request.input('contato', sql.NVarChar, contato);
        request.input('status_cadastro', sql.NVarChar, status_cadastro);
        await request.query(query);

        res.send('Produto adicionado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao adicionar produto: ' + error.message);
    }
});

app.post('/add_vaga', async (req, res) => {
    const { nome, contato, vagas, salario, tempo_de_contrato, horario, beneficios, requisitos } = req.body;

    try {
        await sql.connect(dbConfig);
        const query = `
            INSERT INTO Vagas (Nome, Contato, Vagas, Salario, Tempo_De_Contrato, Horario, Beneficios, Requisitos)
            VALUES (@Nome, @Contato, @Vagas, @Salario, @Tempo_De_Contrato, @Horario, @Beneficios, @Requisitos)
        `;

        const request = new sql.Request();
        request.input('nome', sql.NVarChar, nome);
        request.input('contato', sql.NVarChar, contato);
        request.input('vagas', sql.Int, vagas);
        request.input('salario', sql.Float, salario);
        request.input('tempo_de_contrato', sql.NVarChar, tempo_de_contrato);
        request.input('horario', sql.NVarChar, horario);
        request.input('beneficios', sql.NVarChar, beneficios);
        request.input('requisitos', sql.NVarChar, requisitos);
        await request.query(query);

        res.send('Produto adicionado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao adicionar produto: ' + error.message);
    }
});






app.put('/api/aprovar/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Conectar ao banco de dados
      const pool = await sql.connect(dbConfig);
  
      // Executar a query de atualização
      const result = await pool
        .request()
        .input('id', sql.Int, id)
        .query('UPDATE Empresa SET Status_Cadastro = @status WHERE id = @id', {
          status: 'Aprovado',
        });
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: 'Registro atualizado com sucesso', status: 'Aprovado' });
      } else {
        res.status(404).json({ message: 'Registro não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      res.status(500).json({ message: 'Erro ao atualizar registro' });
    } finally {
      sql.close();
    }
  });