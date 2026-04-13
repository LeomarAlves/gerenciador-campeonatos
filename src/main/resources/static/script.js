let campeonatoAtivoId = null;
let categoriaAtivaId = null;
let bateriaAtivaId = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarCampeonatos();

    document.getElementById('form-tabela').addEventListener('submit', salvarTabelaPontos);
    carregarOpcoesTabelas(); // Carrega as tabelas no menu suspenso logo que o site abre

    // Listeners dos Formulários
    document.getElementById('form-campeonato').addEventListener('submit', salvarCampeonato);
    document.getElementById('form-categoria').addEventListener('submit', salvarCategoria);
    document.getElementById('form-piloto').addEventListener('submit', salvarPiloto);
    document.getElementById('form-bateria').addEventListener('submit', salvarBateria);
    document.getElementById('form-resultado').addEventListener('submit', salvarResultado);

    // Listeners de Navegação
    document.getElementById('btn-voltar-home').addEventListener('click', voltarParaHome);
    document.getElementById('btn-voltar-categorias').addEventListener('click', voltarParaCategorias);
    document.getElementById('btn-cancelar-edicao').addEventListener('click', cancelarEdicao);

    // Novas rotas de navegação da Corrida
    document.getElementById('btn-ir-baterias').addEventListener('click', abrirTelaBaterias);
    document.getElementById('btn-voltar-campeonato-dash').addEventListener('click', () => {
        esconderTodasAsTelas();
        document.getElementById('tela-categorias').classList.remove('oculta');
    });
    document.getElementById('btn-voltar-baterias').addEventListener('click', abrirTelaBaterias);

    // O BOTÃO MÁGICO
    document.getElementById('btn-calcular-pontos').addEventListener('click', calcularPontosBateria);
});

function esconderTodasAsTelas() {
    document.getElementById('tela-home').classList.add('oculta');
    document.getElementById('tela-categorias').classList.add('oculta');
    document.getElementById('tela-pilotos').classList.add('oculta');
    document.getElementById('tela-baterias').classList.add('oculta');
    document.getElementById('tela-resultados').classList.add('oculta');
}

// ==========================================
// TELA 1 e 2: CAMPEONATOS E CATEGORIAS (Mantido)
// ==========================================
async function carregarCampeonatos() {
    const tabela = document.getElementById('tabela-campeonatos-corpo');
    try {
        const resposta = await fetch('http://localhost:8080/api/campeonatos');
        const campeonatos = await resposta.json();
        tabela.innerHTML = '';
        if (campeonatos.length === 0) { tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhum campeonato criado.</td></tr>`; return; }
        campeonatos.forEach(camp => {
            tabela.innerHTML += `<tr><td>#${camp.id}</td><td><strong>${camp.nome}</strong></td><td><button class="btn btn-primario" onclick="abrirCampeonato(${camp.id}, '${camp.nome}')">Gerenciar ➔</button></td></tr>`;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarCampeonato(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-campeonato').value;
    try {
        await fetch('http://localhost:8080/api/campeonatos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome })
        });
        document.getElementById('nome-campeonato').value = '';
        carregarCampeonatos();
    } catch (erro) { alert('Erro!'); }
}

function abrirCampeonato(id, nome) {
    campeonatoAtivoId = id;
    document.getElementById('titulo-campeonato-ativo').innerText = "🏁 " + nome;
    esconderTodasAsTelas();
    document.getElementById('tela-categorias').classList.remove('oculta');
    carregarCategorias();
}

function voltarParaHome() {
    campeonatoAtivoId = null;
    esconderTodasAsTelas();
    document.getElementById('tela-home').classList.remove('oculta');
}

async function carregarCategorias() {
    const tabela = document.getElementById('tabela-categorias-corpo');
    try {
        const resposta = await fetch(`http://localhost:8080/api/categorias/campeonato/${campeonatoAtivoId}`);
        const categorias = await resposta.json();
        tabela.innerHTML = '';
        if (categorias.length === 0) { tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhuma categoria neste campeonato.</td></tr>`; return; }
        categorias.forEach(cat => {
            tabela.innerHTML += `<tr><td>#${cat.id}</td><td><strong>${cat.nome}</strong></td><td><button class="btn btn-primario" onclick="abrirCategoria(${cat.id}, '${cat.nome}')">Ver Pilotos ➔</button></td></tr>`;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarCategoria(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-categoria').value;
    try {
        await fetch('http://localhost:8080/api/categorias', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome, campeonato: { id: campeonatoAtivoId } })
        });
        document.getElementById('nome-categoria').value = '';
        carregarCategorias();
    } catch (erro) { alert('Erro!'); }
}

// ==========================================
// TELA 3: PILOTOS (Mantido)
// ==========================================
function abrirCategoria(id, nome) {
    categoriaAtivaId = id;
    document.getElementById('titulo-categoria-ativa').innerText = "🏎️ Categoria: " + nome;
    esconderTodasAsTelas();
    document.getElementById('tela-pilotos').classList.remove('oculta');
    carregarPilotos();
}

function voltarParaCategorias() {
    categoriaAtivaId = null;
    cancelarEdicao();
    esconderTodasAsTelas();
    document.getElementById('tela-categorias').classList.remove('oculta');
}

async function carregarPilotos() {
    const tabela = document.getElementById('tabela-corpo');
    try {
        const resposta = await fetch('http://localhost:8080/api/pilotos');
        const todosPilotos = await resposta.json();
        const pilotosDestaCategoria = todosPilotos.filter(p => p.categoria && p.categoria.id === categoriaAtivaId);
        tabela.innerHTML = '';
        if (pilotosDestaCategoria.length === 0) { tabela.innerHTML = `<tr><td colspan="4" class="carregando">Nenhum piloto nesta categoria.</td></tr>`; return; }
        pilotosDestaCategoria.forEach(piloto => {
            tabela.innerHTML += `<tr><td>#${piloto.id}</td><td>🏎️ <strong>${piloto.numeroKart}</strong></td><td>${piloto.nome}</td>
                <td><button class="btn" style="background-color: #f39c12; color: white;" onclick="prepararEdicao(${piloto.id}, '${piloto.nome}', ${piloto.numeroKart})">✏️ Editar</button></td></tr>`;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarPiloto(event) {
    event.preventDefault();
    const idPilotoEdicao = document.getElementById('edit-piloto-id').value;
    const nome = document.getElementById('nome-piloto').value;
    const numero = document.getElementById('numero-piloto').value;
    const dadosPiloto = { nome: nome, numeroKart: parseInt(numero), categoria: { id: categoriaAtivaId } };

    try {
        if (idPilotoEdicao) {
            await fetch(`http://localhost:8080/api/pilotos/${idPilotoEdicao}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosPiloto) });
        } else {
            await fetch('http://localhost:8080/api/pilotos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosPiloto) });
        }
        cancelarEdicao(); carregarPilotos();
    } catch (erro) { alert('Erro!'); }
}

function prepararEdicao(id, nome, numeroKart) {
    document.getElementById('edit-piloto-id').value = id; document.getElementById('nome-piloto').value = nome; document.getElementById('numero-piloto').value = numeroKart;
    document.getElementById('titulo-form-piloto').innerText = "✏️ Editando Piloto"; document.getElementById('btn-salvar-piloto').innerText = "Atualizar"; document.getElementById('btn-cancelar-edicao').classList.remove('oculta');
}

function cancelarEdicao() {
    document.getElementById('edit-piloto-id').value = ''; document.getElementById('nome-piloto').value = ''; document.getElementById('numero-piloto').value = '';
    document.getElementById('titulo-form-piloto').innerText = "Cadastrar Novo Piloto"; document.getElementById('btn-salvar-piloto').innerText = "Salvar Piloto"; document.getElementById('btn-cancelar-edicao').classList.add('oculta');
}

// ==========================================
// TELA 4: BATERIAS (NOVO!)
// ==========================================
function abrirTelaBaterias() {
    esconderTodasAsTelas();
    document.getElementById('tela-baterias').classList.remove('oculta');
    carregarBaterias();
}

async function carregarBaterias() {
    const tabela = document.getElementById('tabela-baterias-corpo');
    try {
        const resposta = await fetch(`http://localhost:8080/api/baterias/campeonato/${campeonatoAtivoId}`);
        const baterias = await resposta.json();
        tabela.innerHTML = '';
        if (baterias.length === 0) { tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhuma corrida registrada.</td></tr>`; return; }
        baterias.forEach(bat => {
            tabela.innerHTML += `<tr><td>#${bat.id}</td><td><strong>${bat.nome}</strong></td>
                <td><button class="btn btn-primario" onclick="abrirResultadosBateria(${bat.id}, '${bat.nome}')">Lançar Resultados ➔</button></td></tr>`;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarBateria(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-bateria').value;
    try {
        await fetch('http://localhost:8080/api/baterias', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome, campeonato: { id: campeonatoAtivoId } })
        });
        document.getElementById('nome-bateria').value = '';
        carregarBaterias();
    } catch (erro) { alert('Erro!'); }
}

// ==========================================
// TELA 5: RESULTADOS E GRID MISTO (NOVO!)
// ==========================================
function abrirResultadosBateria(id, nome) {
    bateriaAtivaId = id;
    document.getElementById('titulo-bateria-ativa').innerText = "🏁 " + nome;
    esconderTodasAsTelas();
    document.getElementById('tela-resultados').classList.remove('oculta');
    carregarOpcoesPilotos();
    carregarResultados();
}

// Carrega os pilotos no dropdown misturando todas as categorias do campeonato!
async function carregarOpcoesPilotos() {
    const select = document.getElementById('select-piloto-resultado');
    try {
        // 1. Busca categorias do campeonato
        const respCat = await fetch(`http://localhost:8080/api/categorias/campeonato/${campeonatoAtivoId}`);
        const categorias = await respCat.json();
        const idsCategorias = categorias.map(c => c.id);

        // 2. Busca todos os pilotos e filtra os que pertencem a essas categorias
        const respPil = await fetch('http://localhost:8080/api/pilotos');
        const todosPilotos = await respPil.json();
        const pilotosDoCamp = todosPilotos.filter(p => p.categoria && idsCategorias.includes(p.categoria.id));

        select.innerHTML = '<option value="">Selecione o piloto...</option>';
        pilotosDoCamp.forEach(p => {
            select.innerHTML += `<option value="${p.id}">Kart #${p.numeroKart} - ${p.nome} (${p.categoria.nome})</option>`;
        });
    } catch (erro) { console.error(erro); }
}

async function salvarResultado(event) {
    event.preventDefault();
    const pilotoId = document.getElementById('select-piloto-resultado').value;
    const posicao = document.getElementById('posicao-chegada').value;

    const pacote = {
        bateria: { id: bateriaAtivaId },
        piloto: { id: parseInt(pilotoId) },
        posicaoChegada: parseInt(posicao)
    };

    try {
        await fetch('http://localhost:8080/api/resultados', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pacote)
        });
        document.getElementById('posicao-chegada').value = ''; // Limpa só a posição para agilizar a digitação
        carregarResultados();
    } catch (erro) { alert('Erro ao salvar resultado!'); }
}

async function carregarResultados() {
    const tabela = document.getElementById('tabela-resultados-corpo');
    try {
        const resposta = await fetch('http://localhost:8080/api/resultados');
        const todosResultados = await resposta.json();
        // Filtra para mostrar só os resultados desta bateria
        const resultadosDestaBateria = todosResultados.filter(r => r.bateria && r.bateria.id === bateriaAtivaId);

        // Ordena pela posição de chegada
        resultadosDestaBateria.sort((a, b) => a.posicaoChegada - b.posicaoChegada);

        tabela.innerHTML = '';
        if (resultadosDestaBateria.length === 0) { tabela.innerHTML = `<tr><td colspan="5" class="carregando">Nenhum piloto cruzou a linha de chegada.</td></tr>`; return; }

        resultadosDestaBateria.forEach(res => {
            const pontos = res.pontos != null ? res.pontos : '-';
            const pilotoNome = res.piloto ? res.piloto.nome : 'Desconhecido';
            const kart = res.piloto ? res.piloto.numeroKart : 'N/A';
            const cat = res.piloto && res.piloto.categoria ? res.piloto.categoria.nome : 'N/A';

            tabela.innerHTML += `<tr>
                <td><strong>${res.posicaoChegada}º</strong></td>
                <td>🏎️ ${kart}</td>
                <td>${pilotoNome}</td>
                <td><span style="font-size: 0.85em; background: #eee; padding: 2px 6px; border-radius: 4px;">${cat}</span></td>
                <td><strong>${pontos} pts</strong></td>
            </tr>`;
        });
    } catch (erro) { console.error(erro); }
}

async function calcularPontosBateria() {
    const tabelaId = document.getElementById('select-tabela-pontos').value;

    if (!tabelaId) {
        alert("Por favor, selecione uma Regra de Pontuação antes de calcular!");
        return;
    }

    try {
        // Agora passamos o tabelaId na URL como um parâmetro (?)
        const resposta = await fetch(`http://localhost:8080/api/resultados/calcular/${bateriaAtivaId}?tabelaId=${tabelaId}`, {
            method: 'POST'
        });

        if (resposta.ok) {
            alert('🏁 Sucesso! O Grid Misto foi separado e os pontos foram calculados pelo Java!');
            carregarResultados();
        } else {
            alert('Erro ao calcular pontos.');
        }
    } catch (erro) { console.error(erro); }
}

async function salvarTabelaPontos(event) {
    event.preventDefault();
    const nome = document.getElementById('nome-tabela').value;
    const valoresTexto = document.getElementById('valores-tabela').value;

    // A mágica da conversão: Transforma "25, 20, 15" num Map (Dicionário) do Java
    const arrayValores = valoresTexto.split(',');
    const mapaPontos = {};
    arrayValores.forEach((valorString, index) => {
        const posicao = index + 1; // Array começa em 0, Posição começa em 1
        mapaPontos[posicao] = parseInt(valorString.trim());
    });

    const pacote = {
        nome: nome,
        pontosPorPosicao: mapaPontos
    };

    try {
        await fetch('http://localhost:8080/api/tabelas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pacote)
        });
        document.getElementById('nome-tabela').value = '';
        document.getElementById('valores-tabela').value = '';
        carregarOpcoesTabelas(); // Atualiza as caixinhas
        alert('Regra de pontuação criada com sucesso!');
    } catch (erro) { alert('Erro ao salvar tabela!'); }
}

async function carregarOpcoesTabelas() {
    const select = document.getElementById('select-tabela-pontos');
    try {
        const resposta = await fetch('http://localhost:8080/api/tabelas');
        const tabelas = await resposta.json();
        select.innerHTML = '<option value="">Qual regra usar?</option>';
        tabelas.forEach(t => {
            select.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
        });
    } catch (erro) { console.error(erro); }
}