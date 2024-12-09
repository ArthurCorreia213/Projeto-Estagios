    async function carregarVagas() {
        try {
            // const response = await fetch('/api/vagas');
            // const vagas = await response.json();
			
			const vagas = [1, 2, 3, 4, 5]

            const container = document.getElementById('vagas-container');
            container.innerHTML = ''; // Limpa o container antes de renderizar

            vagas.forEach(vaga => {
                const card = document.createElement('div');
                card.className = 'card';

                card.innerHTML = `
                <div id="container" style="background-color: #DCDCDC; width: 200px; height: 300px; border: 2px solid #827D7E; padding: 20px;">
                <p id="card-titulo" style="font-size: 22px;">Desenvolvimento de Sistemas</p>
        
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">Padaria Seu Zé</p>
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">Salario: R$980,00</p>
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">São Paulo, SP</p>
                <p id="card-info" style="font-size: 16px; padding-top: 6px;">Vagas: 20</p>
        
                <button onclick="carregarInfo()" style="background-color: #827D7E; color: #FFF; margin-left: 25%; margin-top: 10%;">Ver detalhes</button>
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
				<button id="selecionarID('${id_vaga}')"></button>
            </p>
            `;

            container.appendChild(card);
            ;
        } catch (error) {
            console.error('Erro ao carregar vagas:', error);
        }
    }
	
	function selecionarID(id) {
		return id
		alert(id)
	}