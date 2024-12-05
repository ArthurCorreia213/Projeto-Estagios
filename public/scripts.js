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
	
	    async function carregarInfo() {
        try {
            // const response = await fetch('/api/vagas');
            // const vagas = await response.json();
	

            const container = document.getElementById('vagas-info');
            container.innerHTML = ''; // Limpa o container antes de renderizar

            
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
            <p id="cargo">
                Cargo: Desenvolvimento de Sistemas
            </p>

            <p id="empresa">
                Seu Zé INC.
            </p>

            <p id="localizacao">
                Localização: Rua do Oratório, 215, Mooca, SP
            </p>

            <p id="vagas">
                Vagas: 20
            </p>

            <p id="tempo-contrato">Tempo de contrato: 1 ano</p>

            <p id="horario">
                Horário: 9:00 às 16:00
            </p>

            <p id="beneficios">
                Benefícios:
				<ul>
					<li>Vale refeição;</li>
					<li>Vale Transporte;</li>
					<li>Possibilidade de efetivação ao fim do contrato;</li>
                </ul>
            </p>

            <p id="requisitos">
				Requisitos:
				<ul>
					<li>Cursar Técnico/Superior em Desenvolvimento de Sistemas;</li>
                    <li>Conclusão: 2º semestre 2025 / 2º semestre 2026;</li>
                    <li>Morar em SP</li>
                </ul>
            </p>

            <p id="detalhes">
				Detalhes da vaga:
                <ul>
					Lorem ipsum dolor sit amet consectetur, adipisicing elit. Excepturi quibusdam praesentium suscipit officiis maiores quos error, facilis obcaecati asperiores. Ullam tempora sequi ducimus doloremque dicta nobis ad, at nisi. Dicta!
                </ul>
            </p>
            `;

            container.appendChild(card);
            ;
        } catch (error) {
            console.error('Erro ao carregar vagas:', error);
        }
    }