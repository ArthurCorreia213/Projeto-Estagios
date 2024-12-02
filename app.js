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
app.get('/api/empresas-aprovadas', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Empresas WHERE Status_Cadastro = 'Aprovado'");
        res.json(result.recordset); // Retorna as empresas no formato JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar empresas.');
    }
})

app.get('/api/empresas-pendentes', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query("SELECT * FROM Empresas WHERE Status_Cadastro = 'Pendente'");
        res.json(result.recordset); // Retorna as empresas no formato JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar empresas.');
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

app.get('/api/vagas', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT * FROM Vagas');
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
    const { nome, cnpj, email, telefone, status_cadastro } = req.body;

    try {
        await sql.connect(dbConfig);
        const query = `
            INSERT INTO Empresas (Nome, CNPJ, Email, Telefone, Status_Cadastro)
            VALUES (@Nome, @CNPJ, @Email, @Telefone, @Status_Cadastro)
        `;

        const request = new sql.Request();
        request.input('nome', sql.NVarChar, nome);
        request.input('cnpj', sql.NVarChar, cnpj);
        request.input('email', sql.NVarChar, email);
        request.input('telefone', sql.NVarChar, telefone);
        request.input('status_cadastro', sql.NVarChar, status_cadastro);
        await request.query(query);

        res.send('Produto adicionado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao adicionar produto: ' + error.message);
    }
});


app.post('/add_vaga_endereco', async (req, res) => {
    const { cargo, contato, vagas, salario, tempo_de_contrato, horario, beneficios, requisitos } = req.body;
    const { rua, bairro, cidade, estado, numero } = req.body;

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Iniciar uma transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Inserir o endereço e obter o ID gerado
        const resultEndereco = await transaction.request()
            .input('rua', sql.VarChar, rua)
            .input('bairro', sql.VarChar, bairro)
            .input('cidade', sql.VarChar, cidade)
            .input('estado', sql.VarChar, estado)
            .input('numero', sql.VarChar, numero)
            .query(`INSERT INTO Endereco (rua, bairro, cidade, estado, numero) 
                    OUTPUT INSERTED.ID_Endereco
                    VALUES (@rua, @bairro, @cidade, @estado, @numero)`);

        const ID_Endereco = resultEndereco.recordset[0].ID_Endereco;

        // Inserir o cliente com o ID do endereço
        await transaction.request()
            .input('cargo', sql.NVarChar, cargo)
            .input('contato', sql.NVarChar, contato)
            .input('vagas', sql.Int, vagas)
            .input('salario', sql.Float, salario)
            .input('tempo_de_contrato', sql.NVarChar, tempo_de_contrato)
            .input('horario', sql.NVarChar, horario)
            .input('beneficios', sql.NVarChar, beneficios)
            .input('requisitos', sql.NVarChar, requisitos)
            .input('ID_Endereco', sql.Int, ID_Endereco)
            .query(`INSERT INTO Vagas (Cargo, Contato, Vagas, Salario, Tempo_De_Contrato, Horario, Beneficios, Requisitos, ID_Endereco)
                    VALUES (@Cargo, @Contato, @Vagas, @Salario, @Tempo_De_Contrato, @Horario, @Beneficios, @Requisitos, @ID_Endereco)`);

        // Confirmar a transação
        await transaction.commit();

        res.status(201).send({ message: 'Cliente e endereço cadastrados com sucesso!' });
    } catch (error) {
        console.error(error);

        // Reverter a transação em caso de erro
        // if (transaction) {
        //     await transaction.rollback();
        // }
        res.status(500).send({ error: 'Erro ao cadastrar cliente e endereço' });
    } finally {
        sql.close();
    }
});

app.post('/add_candidato', async (req, res) => {
    const { nome, telefone, data_nascimento, escolaridade, data_de_inicio, horario, cpf, ra } = req.body;
    const { rua, bairro, cidade, estado, numero } = req.body;

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Iniciar uma transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Inserir o endereço e obter o ID gerado
        const resultEndereco = await transaction.request()
            .input('rua', sql.VarChar, rua)
            .input('bairro', sql.VarChar, bairro)
            .input('cidade', sql.VarChar, cidade)
            .input('estado', sql.VarChar, estado)
            .input('numero', sql.VarChar, numero)
            .query(`INSERT INTO Endereco (rua, bairro, cidade, estado, numero) 
                    OUTPUT INSERTED.ID_Endereco
                    VALUES (@rua, @bairro, @cidade, @estado, @numero)`);

        const ID_Endereco = resultEndereco.recordset[0].ID_Endereco;

        // Inserir o cliente com o ID do endereço
        await transaction.request()
            .input('nome', sql.NVarChar, nome)
            .input('telefone', sql.NVarChar, telefone)
            .input('data_nascimento', sql.DateTime, data_nascimento)
            .input('escolaridade', sql.NVarChar, escolaridade)
            .input('data_de_inicio', sql.Date, data_de_inicio)
            .input('horario', sql.Time, horario)
            .input('cpf', sql.NVarChar, cpf)
            .input('ra', sql.NVarChar, ra)
            .input('ID_Endereco', sql.Int, ID_Endereco)
            .query(`INSERT INTO Vagas (Nome, Telefone, Data_Nascimento, Escolaridade, Data_De_Inicio, Horario, CPF, RA, ID_Endereco)
                    VALUES (@Nome, @Telefone, @Data_Nascimento, @Escolaridade, @Data_De_Inicio, @Horario, @CPF, @RA, @ID_Endereco)`);

        // Confirmar a transação
        await transaction.commit();

        res.status(201).send({ message: 'Cliente e endereço cadastrados com sucesso!' });
    } catch (error) {
        console.error(error);

        // Reverter a transação em caso de erro
        // if (transaction) {
        //     await transaction.rollback();
        // }
        res.status(500).send({ error: 'Erro ao cadastrar cliente e endereço' + error.message});
    } finally {
        sql.close();
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
        .query("UPDATE Empresas SET Status_Cadastro = 'Aprovado' WHERE ID_Empresa = @id");
  
      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: 'Registro atualizado com sucesso', status: 'Aprovado' });
      } else {
        res.status(404).json({ message: 'Registro não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error.message);
      res.status(500).json({ message: 'Erro ao atualizar registro' });
    } finally {
      sql.close();
    }
  });