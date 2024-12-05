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
        res.status(500).send('Erro ao buscar vagas.' + err.message);
    }
})

app.get('/api/emails-registrados', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request().query('SELECT Email FROM Login');
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
    const { senha, categoria_login } = req.body

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Iniciar uma transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
		
		
		//                    TESTE CHECAR SE EMAIL JA FOI REGISTRADO
		
		
		// async function isEmailRegistered(email) {
			// try {
				// const pool = await sql.connect(yourDbConfig);
				// const result = await pool.request()
					// .input('email', sql.VarChar, email)
					// .query('SELECT COUNT(*) AS count FROM Login WHERE email = @email');
        
			// return result.recordset[0].count > 0;
			// } catch (error) {
			// console.error('Erro ao verificar o email no banco de dados:', error);
			// throw error;
			// }
		// }
		
		// try {
			// // const emailExists = await isEmailRegistered(email);

				// const result = await pool.request()
					// .input('email', sql.VarChar, email)
					// .query('SELECT COUNT(*) AS count FROM Login WHERE email = @email');
        
			// const emailExists = result.recordset[0].count > 0;

			// if (emailExists) {
				// return res.status(200).json({ exists: true, message: 'Email já registrado.' });
			// }
		// } catch (error) {
			// return res.status(500).json({ error: 'Erro ao verificar o email.' });
		// }
	
		//

        const resultLogin = await transaction.request()
        .input('email', sql.VarChar, email)
        .input('senha', sql.VarChar, senha)
        .input('categoria_login', sql.VarChar, categoria_login)
        .query(`INSERT INTO Login (Email, Senha, Categoria_Login) 
                OUTPUT INSERTED.ID_Login
                VALUES (@email, @senha, @categoria_login)`);

        const ID_Login = resultLogin.recordset[0].ID_Login;


        // await sql.connect(dbConfig);
        // const query = `
            // INSERT INTO Empresas (Nome, CNPJ, Email, Telefone, Status_Cadastro, ID_Login)
            // VALUES (@Nome, @CNPJ, @Email, @Telefone, @Status_Cadastro, @ID_Login)
        // `;

        // const request = new sql.Request();
        // request.input('nome', sql.NVarChar, nome);
        // request.input('cnpj', sql.NVarChar, cnpj);
        // request.input('email', sql.NVarChar, email);
        // request.input('telefone', sql.NVarChar, telefone);
        // request.input('ID_Login', sql.Int, ID_Login);
        // request.input('status_cadastro', sql.NVarChar, status_cadastro);
        // await request.query(query);
		
		        // Inserir o cliente com o ID do endereço
        await transaction.request()
            .input('nome', sql.NVarChar, nome)
            .input('cnpj', sql.NVarChar, cnpj)
            .input('email', sql.DateTime, email)
            .input('telefone', sql.NVarChar, telefone)
            .input('ID_Login', sql.Int, ID_Login)
            .input('status_cadastro', sql.NVarChar, status_cadastro)
            .query(`INSERT INTO Candidatos (Nome, CNPJ, Email, Telefone, ID_Login, Status_Cadastro)
                    VALUES (@Nome, @CNPJ, @Email, @Telefone, @ID_Login, @Status_Cadastro)`);

        // Confirmar a transação
        await transaction.commit();

        res.send('Produto adicionado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao adicionar produto: ' + error.message);
    }
});

app.post('/add_vaga_endereco', async (req, res) => {
    const { cargo, contato, vagas, salario, tempo_de_contrato, horario, beneficios, requisitos } = req.body;
    const { rua, cidade, estado, numero, complemento } = req.body;

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Iniciar uma transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // Inserir o endereço e obter o ID gerado
        const resultEndereco = await transaction.request()
            .input('rua', sql.VarChar, rua)
            .input('cidade', sql.VarChar, cidade)
            .input('estado', sql.VarChar, estado)
            .input('numero', sql.VarChar, numero)
            .input('complemento', sql.VarChar, complemento)
            .query(`INSERT INTO Endereco (rua, cidade, estado, numero, complemento) 
                    OUTPUT INSERTED.ID_Endereco
                    VALUES (@rua, @cidade, @estado, @numero, @complemento)`);

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
    const { nome, telefone, data_nascimento, escolaridade, data_de_inicio, cpf } = req.body;
    const { rua, cidade, estado, numero, complemento } = req.body;
    const { email, senha, categoria_login } = req.body

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Iniciar uma transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        const resultLogin = await transaction.request()
        .input('email', sql.VarChar, email)
        .input('senha', sql.VarChar, senha)
        .input('categoria_login', sql.VarChar, categoria_login)
        .query(`INSERT INTO Login (Email, Senha, Categoria_Login) 
                OUTPUT INSERTED.ID_Login
                VALUES (@email, @senha, @categoria_login)`);

        const ID_Login = resultLogin.recordset[0].ID_Login;

        // Inserir o endereço e obter o ID gerado
        const resultEndereco = await transaction.request()
            .input('rua', sql.VarChar, rua)
            .input('cidade', sql.VarChar, cidade)
            .input('estado', sql.VarChar, estado)
            .input('numero', sql.VarChar, numero)
            .input('complemento', sql.VarChar, complemento)
            .query(`INSERT INTO Endereco (rua, cidade, estado, numero, complemento) 
                    OUTPUT INSERTED.ID_Endereco
                    VALUES (@rua, @cidade, @estado, @numero, @complemento)`);

        const ID_Endereco = resultEndereco.recordset[0].ID_Endereco;

        // Inserir o cliente com o ID do endereço
        await transaction.request()
            .input('nome', sql.NVarChar, nome)
            .input('telefone', sql.NVarChar, telefone)
            .input('data_nascimento', sql.DateTime, data_nascimento)
            .input('escolaridade', sql.NVarChar, escolaridade)
            .input('data_de_inicio', sql.Date, data_de_inicio)
            .input('cpf', sql.NVarChar, cpf)
            .input('ID_Endereco', sql.Int, ID_Endereco)
            .input('ID_Login', sql.Int, ID_Login)
            .query(`INSERT INTO Candidatos (Nome, Telefone, Data_Nascimento, Escolaridade, Data_De_Inicio, CPF, ID_Endereco, ID_Login)
                    VALUES (@Nome, @Telefone, @Data_Nascimento, @Escolaridade, @Data_De_Inicio, @CPF, @ID_Endereco, @ID_Login)`);

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
  
  // Rota de login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Consultar o usuário no banco
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT ID_Login, Email, Senha FROM Login WHERE Email = @email');

        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar a senha
        // const isPasswordValid = await bcrypt.compare(password, user.password_hash);
		const isPasswordValid = await (senha==user.Senha;
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas' });
        }

        // Gerar o JWT
        // const token = jwt.sign(
            // { id: user.id, email: user.email, nome: user.nome },
            // JWT_SECRET,
            // { expiresIn: '1h' } // Tempo de expiração do token
        // );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
});