const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const port = 3000;

const JWT_SECRET = 'senha'

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

const autenticarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do cabeçalho

    if (!token) return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
        req.user = user; // Armazena o payload decodificado para uso posterior
        next();
    });
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
        const result = await pool.request().query('SELECT * FROM Vagas JOIN Endereco on vagas.ID_Endereco = Endereco.ID_Endereco');
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
		
		try {
			// const emailExists = await isEmailRegistered(email);

				const result = await pool.request()
					.input('email', sql.VarChar, email)
					.query('SELECT COUNT(*) AS count FROM Login WHERE email = @email');
        
			const emailExists = result.recordset[0].count > 0;

			if (emailExists) {
				return res.status(200).json({ exists: true, message: 'Email já registrado.' });
				return
			}
		} catch (error) {
			return res.status(500).json({ error: 'Erro ao verificar o email.' });
		}
	
		//
		
		async function hash_senha(senha) {
		const saltRounds = 10; // Número de rounds para aumentar a complexidade
		const senha_hash = await bcrypt.hash(senha, saltRounds);
		return senha_hash;
		}

		const senha_com_hash = await hash_senha(senha);

        const resultLogin = await transaction.request()
        .input('email', sql.VarChar, email)
        .input('senha_com_hash', sql.VarChar, senha_com_hash)
        .input('categoria_login', sql.VarChar, categoria_login)
        .query(`INSERT INTO Login (Email, Senha, Categoria_Login) 
                OUTPUT INSERTED.ID_Login
                VALUES (@email, @senha_com_hash, @categoria_login)`);

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
            .input('email', sql.NVarChar, email)
            .input('telefone', sql.NVarChar, telefone)
            .input('ID_Login', sql.Int, ID_Login)
            .input('status_cadastro', sql.NVarChar, status_cadastro)
            .query(`INSERT INTO Empresas (Nome, CNPJ, Email, Telefone, ID_Login, Status_Cadastro)
                    VALUES (@Nome, @CNPJ, @Email, @Telefone, @ID_Login, @Status_Cadastro)`);

        // Confirmar a transação
        await transaction.commit();

        res.send('Produto adicionado com sucesso!');
    } catch (error) {
        res.status(500).send('Erro ao adicionar produto: ' + error.message);
    }
});

app.post('/add_vaga_endereco', async (req, res) => {
    const { cargo, contato, vagas, salario, tempo_de_contrato, horario, beneficios, requisitos, empresa, detalhes } = req.body;
    const { rua, cidade, estado, numero, complemento } = req.body;
	
	const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extrai o token do cabeçalho

    if (!token) return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
        req.user = user; // Armazena o payload decodificado para uso posterior
    });

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
            .input('detalhes', sql.NVarChar, detalhes)
            .input('ID_Endereco', sql.Int, ID_Endereco)
			.input('empresa', sql.Int, empresa)
            .query(`INSERT INTO Vagas (Cargo, Contato, Vagas, Salario, Tempo_De_Contrato, Horario, Beneficios, Requisitos, ID_Endereco, ID_Empresa, Detalhes)
                    VALUES (@Cargo, @Contato, @Vagas, @Salario, @Tempo_De_Contrato, @Horario, @Beneficios, @Requisitos, @ID_Endereco, @empresa, @detalhes)`);

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
		
		async function hash_senha(senha) {
		const saltRounds = 10; // Número de rounds para aumentar a complexidade
		const senha_hash = await bcrypt.hash(senha, saltRounds);
		return senha_hash;
		}

		const senha_com_hash = await hash_senha(senha);
		
		try {
			// const emailExists = await isEmailRegistered(email);

				const result = await pool.request()
					.input('email', sql.VarChar, email)
					.query('SELECT COUNT(*) AS count FROM Login WHERE email = @email');
        
			const emailExists = result.recordset[0].count > 0;

			if (emailExists) {
				return res.status(200).json({ exists: true, message: 'Email já registrado.' });
			}
		} catch (error) {
			return res.status(500).json({ error: 'Erro ao verificar o email.' });
		}		

        const resultLogin = await transaction.request()
        .input('email', sql.VarChar, email)
        .input('senha_com_hash', sql.VarChar, senha_com_hash)
        .input('categoria_login', sql.VarChar, categoria_login)
        .query(`INSERT INTO Login (Email, Senha, Categoria_Login) 
                OUTPUT INSERTED.ID_Login
                VALUES (@email, @senha_com_hash, @categoria_login)`);

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
    
        // Atualizar a tabela Empresas e retornar o ID_Login relacionado
        const updateEmpresas = await pool
          .request()
          .input('id', sql.Int, id)
          .query(
            "UPDATE Empresas SET Status_Cadastro = 'Aprovado' OUTPUT INSERTED.ID_Login WHERE ID_Empresa = @id"
          );
    
        // Garantir que o registro foi encontrado
        if (updateEmpresas.recordset.length === 0) {
          return res.status(404).json({ message: 'Empresa não encontrada.' });
        }
    
        const ID_Login = updateEmpresas.recordset[0].ID_Login;
    
        // Atualizar a tabela Login com o ID_Login obtido
        const updateLogin = await pool
          .request()
          .input('idLogin', sql.Int, ID_Login)
          .query(
            "UPDATE Login SET Categoria_Login = 'Empresa' WHERE ID_Login = @idLogin"
          );
    
        if (updateLogin.rowsAffected[0] > 0) {
          res.status(200).json({
            message: 'Registro atualizado com sucesso',
            status: 'Aprovado',
          });
        } else {
          res.status(404).json({
            message: 'Login relacionado não encontrado.',
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar registro:', error);
        res.status(500).json({ message: 'Erro ao atualizar registro: ' + error });
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
            .query('SELECT Login.*, Empresas.*, Candidatos.*, Endereco.*  FROM Login LEFT JOIN Empresas ON Login.ID_Login = Empresas.ID_Login LEFT JOIN Candidatos ON Login.ID_Login = Candidatos.ID_Login LEFT JOIN Endereco ON Candidatos.ID_Endereco =  Endereco.ID_Endereco WHERE Login.Email = @email AND (Empresas.ID_Login IS NOT NULL OR Candidatos.ID_Login IS NOT NULL);');

        const user = result.recordset[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar a senha
        const isPasswordValid = await bcrypt.compare(senha, user.Senha);
		// const isPasswordValid = (senha==user.Senha);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas'});
        }

        if(user.Categoria_Login == "Pendente/Empresa") {
            return res.status(401).json({ message: 'Seu cadastro ainda não foi aprovado'});
        }


        // Gerar o JWT
        const token = jwt.sign(
            { user },
            JWT_SECRET,
            //  expiresIn: '1h' } // Tempo de expiração do token
        );

        var decoded = jwt.verify(token, JWT_SECRET)

        return res.status(200).json({ message: 'Login aprovado', decoded, token});
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

app.post('/add_curriculo', async (req, res) => {
    const { habilidades, experiencia, sobre_mim, id } = req.body;

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Consultar o usuário no banco
        const result = await pool.request()
			.input('habilidades', sql.NVarChar(300), habilidades)
			.input('experiencia', sql.NVarChar(300), experiencia)
			.input('sobre_mim', sql.NVarChar(300), sobre_mim)
			.input('id', sql.Int, id)
			.query('UPDATE Candidatos SET Habilidades = @habilidades, Experiencia = @experiencia, Sobre_mim = @sobre_mim WHERE ID_Candidato = @id')

        return res.status(200).json({ message: 'Alterações salvas'});
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

// app.post('/logout', (req, res) => {
//     // Remove o cookie que armazena o token
//     localStorage.removeItem('token');
// 	window.location.href = '/'
//     return res.status(200).json({ message: 'Logout realizado com sucesso' });
// });

app.get('/api/vagas-empresa-selecionada', async (req, res) => {
    const id = req.query.id; // Busca o ID nos query params
    try {
        const pool = await sql.connect(dbConfig);
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Vagas JOIN Endereco on vagas.ID_Endereco = Endereco.ID_Endereco JOIN Empresas ON Empresas.ID_Empresa = Vagas.ID_Empresa WHERE Vagas.ID_Empresa = @id');
        res.json(result.recordset); // Retorna os alunos no formato JSON
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar vagas.');
    }
    // Consulta ao banco
    // const result = await pool.request()
    //     .query('SELECT * FROM Vagas WHERE id = ?', [id], (err, result) => {
    //         if (err) return res.status(500).send(err);
    //         res.status(200).json(result);
    //     });
});

// app.get('/api/', (req, res) => {
//     const token = req.headers.authorization?.split(' ')[1]; // Extrai o token do cabeçalho

//     if (!token) {
//         return res.status(401).send('Token não fornecido.');
//     }

//     try {
//         // Verifica e decodifica o token
//         const payload = jwt.verify(token, 'sua-chave-secreta'); // Substitua pela chave secreta do JWT
//         const id = payload.ID_Empresa;

//         // Consulta ao banco de dados
//         db.query('SELECT * FROM items WHERE id = @id', (err, result) => {
//             if (err) return res.status(500).send('Erro ao consultar o banco de dados.');
//             res.json(result);
//         });
//     } catch (err) {
//         return res.status(401).send('Token inválido.');
//     }
// });

app.post('/candidatar', async (req, res) => {
    const { id_vaga, id_candidato } = req.body;

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Consultar o usuário no banco
        const result = await pool.request()
			.input('id_vaga', sql.Int, id_vaga)
			.input('id_candidato', sql.Int, id_candidato)
			.query('INSERT INTO Candidaturas (ID_Candidato, ID_Vaga) VALUES (@id_candidato, @id_vaga)')

        return res.status(200).json({ message: 'Candidatura enviada'});
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

app.post('/candidatos-vaga', async (req, res) => {
    const { id_vaga } = req.body;

    try {
        // Conectar ao banco de dados
        const pool = await sql.connect(dbConfig);

        // Consultar o usuário no banco
        const result = await pool.request()
			.input('id_vaga', sql.Int, id_vaga)
			.query('SELECT * FROM Candidaturas INNER JOIN Candidatos ON Candidatos.ID_Candidato = Candidaturas.ID_Candidato LEFT JOIN Cursos ON Candidatos.ID_Curso = Cursos.ID_Curso')

        return res.status(200).json({ message: 'Candidatura enviada'});
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
});