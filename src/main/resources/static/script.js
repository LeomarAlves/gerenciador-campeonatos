// ==========================================
// VARIÁVEIS DE ESTADO (A memória do sistema)
// ==========================================
let campeonatoAtivoId = null;
let categoriaAtivaId = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicia o sistema carregando os campeonatos
    carregarCampeonatos();

    // 2. Configura os "Ouvintes" dos formulários
    document.getElementById('form-campeonato').addEventListener('submit', salvarCampeonato);
    document.getElementById('form-categoria').addEventListener('submit', salvarCategoria);
    document.getElementById('form-piloto').addEventListener('submit', salvarPiloto);

    // 3. Configura os botões de navegação e cancelamento
    document.getElementById('btn-voltar-home').addEventListener('click', voltarParaHome);
    document.getElementById('btn-voltar-categorias').addEventListener('click', voltarParaCategorias);
    document.getElementById('btn-cancelar-edicao').addEventListener('click', cancelarEdicao);
});

// ==========================================
// TELA 1: CAMPEONATOS
// ==========================================

async function carregarCampeonatos() {
    const tabela = document.getElementById('tabela-campeonatos-corpo');
    try {
        const resposta = await fetch('http://localhost:8080/api/campeonatos');
        const campeonatos = await resposta.json();

        tabela.innerHTML = '';
        if (campeonatos.length === 0) {
            tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhum campeonato criado. 🏆</td></tr>`;
            return;
        }

        campeonatos.forEach(camp => {
            tabela.innerHTML += `
                <tr>
                    <td>#${camp.id}</td>
                    <td><strong>${camp.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirCampeonato(${camp.id}, '${camp.nome}')">Abrir ➔</button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarCampeonato(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-campeonato').value;
    try {
        await fetch('http://localhost:8080/api/campeonatos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome })
        });
        document.getElementById('nome-campeonato').value = '';
        carregarCampeonatos();
    } catch (erro) { alert('Erro ao criar campeonato!'); }
}

// ==========================================
// TELA 2: CATEGORIAS
// ==========================================

function abrirCampeonato(id, nome) {
    campeonatoAtivoId = id;
    document.getElementById('titulo-campeonato-ativo').innerText = "🏁 " + nome;

    // Esconde a Home, Mostra as Categorias
    document.getElementById('tela-home').classList.add('oculta');
    document.getElementById('tela-categorias').classList.remove('oculta');

    carregarCategorias();
}

function voltarParaHome() {
    campeonatoAtivoId = null;
    document.getElementById('tela-categorias').classList.add('oculta');
    document.getElementById('tela-home').classList.remove('oculta');
}

async function carregarCategorias() {
    const tabela = document.getElementById('tabela-categorias-corpo');
    try {
        const resposta = await fetch(`http://localhost:8080/api/categorias/campeonato/${campeonatoAtivoId}`);
        const categorias = await resposta.json();

        tabela.innerHTML = '';
        if (categorias.length === 0) {
            tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhuma categoria neste campeonato.</td></tr>`;
            return;
        }

        categorias.forEach(cat => {
            tabela.innerHTML += `
                <tr>
                    <td>#${cat.id}</td>
                    <td><strong>${cat.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirCategoria(${cat.id}, '${cat.nome}')">Ver Pilotos ➔</button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarCategoria(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-categoria').value;
    try {
        await fetch('http://localhost:8080/api/categorias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome: nome,
                campeonato: { id: campeonatoAtivoId }
            })
        });
        document.getElementById('nome-categoria').value = '';
        carregarCategorias();
    } catch (erro) { alert('Erro ao salvar categoria!'); }
}

// ==========================================
// TELA 3: PILOTOS (Onde a Edição acontece)
// ==========================================

function abrirCategoria(id, nome) {
    categoriaAtivaId = id;
    document.getElementById('titulo-categoria-ativa').innerText = "🏎️ Categoria: " + nome;

    // Esconde as Categorias, Mostra os Pilotos
    document.getElementById('tela-categorias').classList.add('oculta');
    document.getElementById('tela-pilotos').classList.remove('oculta');

    carregarPilotos();
}

function voltarParaCategorias() {
    categoriaAtivaId = null;
    cancelarEdicao(); // Limpa o formulário caso estivesse editando
    document.getElementById('tela-pilotos').classList.add('oculta');
    document.getElementById('tela-categorias').classList.remove('oculta');
}

async function carregarPilotos() {
    const tabela = document.getElementById('tabela-corpo');
    try {
        const resposta = await fetch('http://localhost:8080/api/pilotos');
        const todosPilotos = await resposta.json();

        // MÁGICA FRONTEND: Como o Java devolve todos os pilotos,
        // nós filtramos aqui para mostrar só os da categoria que o usuário clicou!
        const pilotosDestaCategoria = todosPilotos.filter(p => p.categoria && p.categoria.id === categoriaAtivaId);

        tabela.innerHTML = '';
        if (pilotosDestaCategoria.length === 0) {
            tabela.innerHTML = `<tr><td colspan="4" class="carregando">Nenhum piloto nesta categoria.</td></tr>`;
            return;
        }

        pilotosDestaCategoria.forEach(piloto => {
            // Nota: Passamos os dados do piloto para a função de editar
            tabela.innerHTML += `
                <tr>
                    <td>#${piloto.id}</td>
                    <td>🏎️ <strong>${piloto.numeroKart}</strong></td>
                    <td>${piloto.nome}</td>
                    <td>
                        <button class="btn" style="background-color: #f39c12; color: white;" 
                                onclick="prepararEdicao(${piloto.id}, '${piloto.nome}', ${piloto.numeroKart})">
                            ✏️ Editar
                        </button>
                    </td>
                </tr>
            `;
        });
    } catch (erro) { console.error(erro); }
}

// ==========================================
// LÓGICA DE SALVAR E EDITAR PILOTOS
// ==========================================

async function salvarPiloto(event) {
    event.preventDefault();

    const idPilotoEdicao = document.getElementById('edit-piloto-id').value;
    const nome = document.getElementById('nome-piloto').value;
    const numero = document.getElementById('numero-piloto').value;

    // Monta o pacote pro Java (Note que enviamos a Categoria Ativa automaticamente!)
    const dadosPiloto = {
        nome: nome,
        numeroKart: parseInt(numero),
        categoria: { id: categoriaAtivaId }
    };

    try {
        // Se tem ID no campo invisível, é uma EDIÇÃO (PUT)
        if (idPilotoEdicao) {
            await fetch(`http://localhost:8080/api/pilotos/${idPilotoEdicao}`, {
                method: 'PUT', // Atualizar!
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPiloto)
            });
            alert('Piloto atualizado com sucesso!');
        }
        // Se NÃO tem ID, é um piloto NOVO (POST)
        else {
            await fetch('http://localhost:8080/api/pilotos', {
                method: 'POST', // Criar!
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPiloto)
            });
        }

        cancelarEdicao(); // Limpa e reseta o formulário
        carregarPilotos(); // Atualiza a tabela

    } catch (erro) { alert('Erro ao processar piloto!'); }
}

// Chamada quando clica no botão "Editar" da tabela
function prepararEdicao(id, nome, numeroKart) {
    document.getElementById('edit-piloto-id').value = id;
    document.getElementById('nome-piloto').value = nome;
    document.getElementById('numero-piloto').value = numeroKart;

    document.getElementById('titulo-form-piloto').innerText = "✏️ Editando Piloto";
    document.getElementById('btn-salvar-piloto').innerText = "Atualizar Piloto";
    document.getElementById('btn-cancelar-edicao').classList.remove('oculta');
}

// Restaura o formulário para o modo "Cadastrar"
function cancelarEdicao() {
    document.getElementById('edit-piloto-id').value = '';
    document.getElementById('nome-piloto').value = '';
    document.getElementById('numero-piloto').value = '';

    document.getElementById('titulo-form-piloto').innerText = "Cadastrar Novo Piloto";
    document.getElementById('btn-salvar-piloto').innerText = "Salvar Piloto";
    document.getElementById('btn-cancelar-edicao').classList.add('oculta');
}