// Variável global para armazenar o ID da vaga selecionada
let idVagaSelecionada = null;

function selecionarID(id) {
    idVagaSelecionada = id; // Atualiza o ID da vaga selecionada
    alert('ID da vaga selecionado: ' + id);
}

async function carregarVagas() {
        try {
            // const response = await fetch('/api/vagas');
            // const vagas = await response.json();
			
			const vagas = [1, 2, 3, 4, 5]

            const container = document.getElementById('vagas-container');
            container.innerHTML = ''; // Limpa o container antes de renderizar

            vagas.forEach(vagas => {
                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                <div id="container" style="background-color: #DCDCDC; width: 200px; height: 300px; border: 2px solid #827D7E; padding: 20px;">
                <p id="card-titulo" style="font-size: 22px;">Desenvolvimento de Sistemas</p>
        
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">Padaria Seu Zé</p>
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">Salario: R$980,00</p>
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">São Paulo, SP</p>
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">Vagas: 20</p>
        
                <button type="submit" onclick="carregarInfo('${vagas.Cargo}', '${vagas.Rua}', '${vagas.Numero}', '${vagas.Bairro}', '${vagas.Cidade}', '${vagas.Estado}','${vagas.Vagas}', '${vagas.Tempo_De_Contrato}', '${vagas.Horario}', '${vagas.Beneficios}', '${vagas.Requisitos}', '${vagas.Detalhes},')" style="background-color: #827D7E; color: #FFF; margin-left: 25%; margin-top: 10%;">Ver detalhes</button>
				</div>
                `;

                container.appendChild(card);
            });
        } catch (error) {
            console.error('Erro ao carregar vagas:', error);
        }
    }


	
	    async function carregarInfo(cargo, rua, numero, bairro, cidade, estado, vagas, tempo, horario, beneficios, requisitos, detalhes, id_vaga, id_empresa) {
        try {
            // const response = await fetch('/api/vagas');
            // const vagas = await response.json();
	

            const container = document.getElementById('vagas-info');
            container.innerHTML = ''; // Limpa o container antes de renderizar

            
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
            <p id="cargo">
                <strong> Cargo: ${cargo} </strong>
            </p>

            <p id="localizacao">
                Localização: ${rua}, ${numero}, ${bairro}, ${cidade}, ${estado}
            </p>

            <p id="vagas">
                Vagas: ${vagas}
            </p>

            <p id="tempo-contrato">Tempo de contrato: ${tempo}</p>

            <p id="horario">
              Horário: ${horario}
            </p>

            <p id="beneficios">
                Benefícios: 
				<ul>
                    ${beneficios}
                </ul>
            </p>

            <p id="requisitos">
				Requisitos:
				<ul>
					${requisitos}
                </ul>
            </p>

            <p id="detalhes">
				Detalhes da vaga:
                <ul>
					${detalhes}
                </ul>
            </p>
			
			<p id="detalhes">
				<button id="btnCandidatar" onclick="selecionarID(${id_vaga}); candidatarVaga();">Candidatar</button>
            </p>
            `;

            container.appendChild(card);
            ;
        } catch (error) {
            console.error('Erro ao carregar vagas:', error);
        }
    }

    

//     async function carregarcandvaga(idVaga) {
//         try {
//             // Recuperar o JWT do localStorage
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 alert('Token não encontrado. Faça login para continuar.');
//                 window.location.href = '../login.html'; // Redireciona para o login se necessário
//                 return;
//             }
    
//             // Enviar requisição para o backend para buscar os candidatos
//             const response = await fetch('/candidatos-vaga', {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`, // Enviar o token, se necessário
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ id_Vaga: idVaga }) // Passa o ID da vaga
//             });
    
//             if (!response.ok) {
//                 throw new Error('Erro ao carregar candidatos');
//             }
    
//             // Obter os dados dos candidatos
//             const candidatos = await response.json();
    
//             if (candidatos.length === 0) {
//                 alert('Não há candidatos para esta vaga.');
//                 return;
//             }
    
//             // Formatar os dados para exibir apenas os IDs
//             let listaCandidatos = candidatos.map(candidato => {
//                 return `ID Candidato: ${candidato.ID_Candidato}\nID Candidatura: ${candidato.ID_Candidatura}\n\n`;
//             }).join('');
    
//             // Exibir os dados no alert
//             alert(`Candidatos para esta vaga:\n\n${listaCandidatos}`);
    
//         } catch (error) {
//             console.error('Erro:', error);
//             alert('Ocorreu um erro ao carregar os candidatos.');
//         }
//     }
    
// async function carregarcandvaga(idVaga) {
//     try {
//         // Recuperar o JWT do localStorage
//         const token = localStorage.getItem('token');
//         if (!token) {
//             alert('Token não encontrado. Faça login para continuar.');
//             window.location.href = '../login.html'; // Redireciona para o login se necessário
//             return;
//         }

//         // Enviar requisição para o backend para buscar os candidatos
//         const response = await fetch('/candidatos-vaga', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ id_vaga: idVaga }) // Passa o ID da vaga
//         });

//         if (!response.ok) {
//             throw new Error('Erro ao carregar candidatos');
//         }

//         // Obter os dados dos candidatos
//         const candidatos = await response.json();

//         if (candidatos.length === 0) {
//             alert('Não há candidatos para esta vaga.');
//             return;
//         }

//         // Exibir os IDs de candidatos e candidaturas
//         let listaCandidatos = candidatos.map(candidato => {
//             return `ID Candidato: ${candidato.ID_Candidato}`;
//         }).join('\n');

//         alert(`Candidatos para esta vaga:\n\n${listaCandidatos}`);

//     } catch (error) {
//         console.error('Erro:', error);
//         alert('Ocorreu um erro ao carregar os candidatos.');
//     }
// }

// async function carregarcandvaga(idVaga) {
//     try {
//         const response = await fetch(`/api/candidatos-vaga?id_vaga=${idVaga}`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('token')}`, 
//             },
//         });

//         if (!response.ok) {
//             throw new Error('Erro ao buscar os candidatos.');
//         }

//         const candidatos = await response.json();
//         exibirCandidatos(candidatos);
//     } catch (error) {
//         console.error('Erro:', error.message);
//     }
// }

