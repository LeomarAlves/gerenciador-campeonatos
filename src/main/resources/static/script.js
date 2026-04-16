/**
 * Gerenciador de Campeonatos de Kart - Módulo Frontend (Refatorado)
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Estado global da aplicação
let campeonatoAtivoId = null;
let categoriaAtivaId = null;
let bateriaAtivaId = null;
let dadosRelatorioGlobal = null;

document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
});

function inicializarApp() {
    carregarCampeonatos();
    carregarOpcoesTabelas();

    // Mapeamento de formulários
    const formularios = {
        'form-campeonato': salvarCampeonato,
        'form-categoria': salvarCategoria,
        'form-piloto': salvarPiloto,
        'form-bateria': salvarBateria,
        'form-resultado': salvarResultado,
        'form-tabela': salvarTabelaPontos
    };

    Object.entries(formularios).forEach(([id, handler]) => {
        document.getElementById(id)?.addEventListener('submit', handler);
    });

    // Mapeamento de botões de navegação
    configurarNavegacao();

    // Ações de relatório e impressão
    document.getElementById('btn-imprimir-pdf')?.addEventListener('click', baixarPdfOficial);
    document.getElementById('btn-gerar-relatorio-selecionadas')?.addEventListener('click', gerarRelatorioDasSelecionadas);
    
    // Alerta de legado
    document.getElementById('btn-gerar-pdf')?.addEventListener('click', () => {
        alert("Para gerar a classificação final Oficial, use a tela de 'Corridas' e selecione as baterias desejadas.");
    });
}

function configurarNavegacao() {
    const navegação = {
        'btn-voltar-home': voltarParaHome,
        'btn-voltar-categorias': voltarParaCategorias,
        'btn-cancelar-edicao': cancelarEdicao,
        'btn-voltar-baterias': abrirTelaBaterias,
        'btn-ir-baterias': abrirTelaBaterias,
        'btn-calcular-pontos': calcularPontosBateria
    };

    Object.entries(navegação).forEach(([id, handler]) => {
        document.getElementById(id)?.addEventListener('click', handler);
    });

    // Atalhos simples
    document.getElementById('btn-voltar-campeonato-dash')?.addEventListener('click', () => mostrarTela('tela-categorias'));
    document.getElementById('btn-voltar-dash-classificacao')?.addEventListener('click', () => mostrarTela('tela-baterias'));
}

/**
 * Utilitário para chamadas de API
 */
async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return response;
    } catch (error) {
        console.error(`Falha na API (${endpoint}):`, error);
        throw error;
    }
}

function mostrarTela(idTela) {
    const telas = ['tela-home', 'tela-categorias', 'tela-pilotos', 'tela-baterias', 'tela-resultados', 'tela-classificacao'];
    telas.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.toggle('oculta', id !== idTela);
        }
    });
}

// --- TELA 1: CAMPEONATOS ---

async function carregarCampeonatos() {
    const tabelaCorpo = document.getElementById('tabela-campeonatos-corpo');
    try {
        const campeonatos = await apiFetch('/campeonatos');
        tabelaCorpo.innerHTML = '';

        if (campeonatos.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="3" class="carregando">Nenhum campeonato cadastrado.</td></tr>`;
            return;
        }

        campeonatos.forEach(camp => {
            const linha = `
                <tr>
                    <td>#${camp.id}</td>
                    <td><strong>${camp.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirCampeonato(${camp.id}, '${camp.nome}')">Gerenciar ➔</button>
                        <button class="btn" style="background-color: #c0392b; color: white;" onclick="excluirCampeonato(${camp.id})">🗑️ Excluir</button>
                    </td>
                </tr>`;
            tabelaCorpo.insertAdjacentHTML('beforeend', linha);
        });
    } catch (e) {
        tabelaCorpo.innerHTML = `<tr><td colspan="3">Erro ao carregar dados.</td></tr>`;
    }
}

async function excluirCampeonato(id) {
    if (confirm("Tem certeza que deseja excluir este campeonato? Esta ação não pode ser desfeita e removerá todas as categorias, pilotos e baterias vinculadas!")) {
        try {
            await apiFetch(`/campeonatos/${id}`, { method: 'DELETE' });
            carregarCampeonatos();
        } catch (e) { alert('Erro ao excluir campeonato.'); }
    }
}

async function salvarCampeonato(e) {
    e.preventDefault();
    const inputNome = document.getElementById('nome-campeonato');
    try {
        await apiFetch('/campeonatos', {
            method: 'POST',
            body: JSON.stringify({ nome: inputNome.value })
        });
        inputNome.value = '';
        carregarCampeonatos();
    } catch (e) { alert('Erro ao salvar campeonato.'); }
}

function abrirCampeonato(id, nome) {
    campeonatoAtivoId = id;
    document.getElementById('titulo-campeonato-ativo').innerText = `🏁 ${nome}`;
    mostrarTela('tela-categorias');
    carregarCategorias();
}

function voltarParaHome() {
    campeonatoAtivoId = null;
    mostrarTela('tela-home');
}

// --- TELA 2: CATEGORIAS ---

async function carregarCategorias() {
    const tabelaCorpo = document.getElementById('tabela-categorias-corpo');
    try {
        const categorias = await apiFetch(`/categorias/campeonato/${campeonatoAtivoId}`);
        tabelaCorpo.innerHTML = '';

        if (categorias.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="3" class="carregando">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        categorias.forEach(cat => {
            const linha = `
                <tr>
                    <td>#${cat.id}</td>
                    <td><strong>${cat.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirCategoria(${cat.id}, '${cat.nome}')">Ver Pilotos ➔</button>
                        <button class="btn" style="background-color: #c0392b; color: white;" onclick="excluirCategoria(${cat.id})">🗑️ Excluir</button>
                    </td>
                </tr>`;
            tabelaCorpo.insertAdjacentHTML('beforeend', linha);
        });
    } catch (e) { console.error(e); }
}

async function excluirCategoria(id) {
    if (confirm("Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita e removerá todos os pilotos e resultados vinculados!")) {
        try {
            await apiFetch(`/categorias/${id}`, { method: 'DELETE' });
            carregarCategorias();
        } catch (e) { alert('Erro ao excluir categoria.'); }
    }
}

async function salvarCategoria(e) {
    e.preventDefault();
    const inputNome = document.getElementById('nome-categoria');
    try {
        await apiFetch('/categorias', {
            method: 'POST',
            body: JSON.stringify({
                nome: inputNome.value,
                campeonato: { id: campeonatoAtivoId }
            })
        });
        inputNome.value = '';
        carregarCategorias();
    } catch (e) { alert('Erro ao salvar categoria.'); }
}

// --- TELA 3: PILOTOS ---

function abrirCategoria(id, nome) {
    categoriaAtivaId = id;
    document.getElementById('titulo-categoria-ativa').innerText = `🏎️ Categoria: ${nome}`;
    mostrarTela('tela-pilotos');
    carregarPilotos();
}

function voltarParaCategorias() {
    categoriaAtivaId = null;
    cancelarEdicao();
    mostrarTela('tela-categorias');
}

async function carregarPilotos() {
    const tabelaCorpo = document.getElementById('tabela-corpo');
    try {
        const pilotos = await apiFetch('/pilotos');
        const pilotosFiltrados = pilotos.filter(p => p.categoria?.id === categoriaAtivaId);
        
        tabelaCorpo.innerHTML = '';
        if (pilotosFiltrados.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="4" class="carregando">Nenhum piloto nesta categoria.</td></tr>`;
            return;
        }

        pilotosFiltrados.forEach(p => {
            const linha = `
                <tr>
                    <td>#${p.id}</td>
                    <td>🏎️ <strong>${p.numeroKart}</strong></td>
                    <td>${p.nome}</td>
                    <td>
                        <button class="btn btn-alerta" onclick="prepararEdicao(${p.id}, '${p.nome}', ${p.numeroKart})">✏️ Editar</button>
                        <button class="btn" style="background-color: #c0392b; color: white;" onclick="excluirPiloto(${p.id})">🗑️ Excluir</button>
                    </td>
                </tr>`;
            tabelaCorpo.insertAdjacentHTML('beforeend', linha);
        });
    } catch (e) { console.error(e); }
}

async function excluirPiloto(id) {
    if (confirm("Tem certeza que deseja excluir este piloto? Esta ação não pode ser desfeita.")) {
        try {
            await apiFetch(`/pilotos/${id}`, { method: 'DELETE' });
            carregarPilotos();
        } catch (e) { alert('Erro ao excluir piloto.'); }
    }
}

async function salvarPiloto(e) {
    e.preventDefault();
    const id = document.getElementById('edit-piloto-id').value;
    const dados = {
        nome: document.getElementById('nome-piloto').value,
        numeroKart: parseInt(document.getElementById('numero-piloto').value),
        categoria: { id: categoriaAtivaId }
    };

    try {
        const metodo = id ? 'PUT' : 'POST';
        const url = id ? `/pilotos/${id}` : '/pilotos';
        await apiFetch(url, { method: metodo, body: JSON.stringify(dados) });
        
        cancelarEdicao();
        carregarPilotos();
    } catch (e) { alert('Erro ao salvar piloto.'); }
}

function prepararEdicao(id, nome, num) {
    document.getElementById('edit-piloto-id').value = id;
    document.getElementById('nome-piloto').value = nome;
    document.getElementById('numero-piloto').value = num;
    document.getElementById('titulo-form-piloto').innerText = "✏️ Editando Piloto";
    document.getElementById('btn-salvar-piloto').innerText = "Atualizar";
    document.getElementById('btn-cancelar-edicao').classList.remove('oculta');
}

function cancelarEdicao() {
    ['edit-piloto-id', 'nome-piloto', 'numero-piloto'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('titulo-form-piloto').innerText = "Cadastrar Novo Piloto";
    document.getElementById('btn-salvar-piloto').innerText = "Salvar Piloto";
    document.getElementById('btn-cancelar-edicao').classList.add('oculta');
}

// --- TELA 4: BATERIAS (CORRIDAS) ---

function abrirTelaBaterias() {
    mostrarTela('tela-baterias');
    carregarBaterias();
}

async function carregarBaterias() {
    const tabelaCorpo = document.getElementById('tabela-baterias-corpo');
    try {
        const baterias = await apiFetch(`/baterias/campeonato/${campeonatoAtivoId}`);
        tabelaCorpo.innerHTML = '';

        if (baterias.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="4" class="carregando">Nenhuma corrida registrada.</td></tr>`;
            return;
        }

        baterias.forEach(b => {
            const linha = `
                <tr>
                    <td style="text-align: center;"><input type="checkbox" class="chk-bateria" value="${b.id}" style="transform: scale(1.5);"></td>
                    <td>#${b.id}</td>
                    <td><strong>${b.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirResultadosBateria(${b.id}, '${b.nome}')">Lançar Resultados ➔</button>
                        <button class="btn" style="background-color: #c0392b; color: white;" onclick="excluirBateria(${b.id})">🗑️ Excluir</button>
                    </td>
                </tr>`;
            tabelaCorpo.insertAdjacentHTML('beforeend', linha);
        });
    } catch (e) { console.error(e); }
}

async function excluirBateria(id) {
    if (confirm("Tem certeza que deseja excluir esta bateria? Esta ação não pode ser desfeita e removerá todos os resultados vinculados!")) {
        try {
            await apiFetch(`/baterias/${id}`, { method: 'DELETE' });
            carregarBaterias();
        } catch (e) { alert('Erro ao excluir bateria.'); }
    }
}

async function salvarBateria(e) {
    e.preventDefault();
    const inputNome = document.getElementById('nome-bateria');
    try {
        await apiFetch('/baterias', {
            method: 'POST',
            body: JSON.stringify({
                nome: inputNome.value,
                campeonato: { id: campeonatoAtivoId }
            })
        });
        inputNome.value = '';
        carregarBaterias();
    } catch (e) { alert('Erro ao salvar bateria.'); }
}

// --- TELA 5: RESULTADOS DA BATERIA ---

function abrirResultadosBateria(id, nome) {
    bateriaAtivaId = id;
    document.getElementById('titulo-bateria-ativa').innerText = `🏁 ${nome}`;
    mostrarTela('tela-resultados');
    carregarOpcoesPilotos();
    carregarResultados();
}

async function carregarOpcoesPilotos() {
    const select = document.getElementById('select-piloto-resultado');
    try {
        const categorias = await apiFetch(`/categorias/campeonato/${campeonatoAtivoId}`);
        const idsCategorias = categorias.map(c => c.id);
        
        const todosPilotos = await apiFetch('/pilotos');
        const pilotosValidos = todosPilotos.filter(p => p.categoria && idsCategorias.includes(p.categoria.id));

        select.innerHTML = '<option value="">Selecione o piloto...</option>';
        pilotosValidos.forEach(p => {
            select.insertAdjacentHTML('beforeend', `<option value="${p.id}">Kart #${p.numeroKart} - ${p.nome} (${p.categoria.nome})</option>`);
        });
    } catch (e) { console.error(e); }
}

async function salvarResultado(e) {
    e.preventDefault();
    const pilotoId = document.getElementById('select-piloto-resultado').value;
    const posicao = document.getElementById('posicao-chegada').value;
    const marcouNc = document.getElementById('checkbox-nc').checked;

    const dados = {
        bateria: { id: bateriaAtivaId },
        piloto: { id: parseInt(pilotoId) },
        posicaoChegada: parseInt(posicao),
        nc: marcouNc
    };

    try {
        await apiFetch('/resultados', { method: 'POST', body: JSON.stringify(dados) });
        document.getElementById('posicao-chegada').value = '';
        document.getElementById('checkbox-nc').checked = false;
        carregarResultados();
    } catch (e) { alert('Erro ao salvar resultado.'); }
}

async function carregarResultados() {
    const tabelaCorpo = document.getElementById('tabela-resultados-corpo');
    try {
        const resultados = await apiFetch('/resultados');
        const filtrados = resultados
            .filter(r => r.bateria?.id === bateriaAtivaId)
            .sort((a, b) => a.posicaoChegada - b.posicaoChegada);

        tabelaCorpo.innerHTML = '';
        if (filtrados.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="5" class="carregando">Sem resultados lançados.</td></tr>`;
            return;
        }

        filtrados.forEach(r => {
            const linha = `
                <tr>
                    <td><strong>${r.posicaoChegada}º</strong></td>
                    <td>🏎️ ${r.piloto?.numeroKart || '-'}</td>
                    <td>${r.piloto?.nome || '-'}</td>
                    <td><span class="badge-categoria">${r.piloto?.categoria?.nome || '-'}</span></td>
                    <td><strong>${r.pontos != null ? r.pontos : '-'} pts</strong></td>
                </tr>`;
            tabelaCorpo.insertAdjacentHTML('beforeend', linha);
        });
    } catch (e) { console.error(e); }
}

async function calcularPontosBateria() {
    const tabelaId = document.getElementById('select-tabela-pontos').value;
    if (!tabelaId) return alert("Selecione uma regra de pontuação!");

    try {
        await apiFetch(`/resultados/calcular/${bateriaAtivaId}?tabelaId=${tabelaId}`, { method: 'POST' });
        alert('🏁 Pontos calculados com sucesso!');
        carregarResultados();
    } catch (e) { alert('Erro ao calcular pontos.'); }
}

// --- TABELAS DE PONTOS ---

async function carregarOpcoesTabelas() {
    const select = document.getElementById('select-tabela-pontos');
    if (!select) return;

    try {
        const tabelas = await apiFetch('/tabelas');
        select.innerHTML = '<option value="">Qual regra usar?</option>';
        tabelas.forEach(t => {
            select.insertAdjacentHTML('beforeend', `<option value="${t.id}">${t.nome}</option>`);
        });
    } catch (e) { console.error(e); }
}

async function salvarTabelaPontos(e) {
    e.preventDefault();
    const nome = document.getElementById('nome-tabela').value;
    const valoresString = document.getElementById('valores-tabela').value;
    
    const mapaPontos = {};
    valoresString.split(',').forEach((val, index) => {
        mapaPontos[index + 1] = parseInt(val.trim());
    });

    try {
        await apiFetch('/tabelas', {
            method: 'POST',
            body: JSON.stringify({ nome: nome, pontosPorPosicao: mapaPontos })
        });
        document.getElementById('nome-tabela').value = '';
        document.getElementById('valores-tabela').value = '';
        carregarOpcoesTabelas();
        alert('Regra salva com sucesso!');
    } catch (e) { alert('Erro ao salvar regra.'); }
}

// --- TELA 6: CLASSIFICAÇÃO FINAL E RELATÓRIOS ---

async function gerarRelatorioDasSelecionadas() {
    const selecionadas = Array.from(document.querySelectorAll('.chk-bateria:checked')).map(chk => chk.value);
    
    if (selecionadas.length === 0) {
        return alert("Selecione pelo menos uma bateria para o relatório!");
    }

    const container = document.getElementById('container-tabelas-classificacao');
    container.innerHTML = `<p class="carregando">Cruzando dados e processando categorias...</p>`;
    mostrarTela('tela-classificacao');

    const nomeCamp = document.getElementById('titulo-campeonato-ativo').innerText.replace('🏁 ', '');
    document.getElementById('titulo-impressao-campeonato').innerText = nomeCamp;

    try {
        const ids = selecionadas.join(',');
        dadosRelatorioGlobal = await apiFetch(`/relatorios/etapa?bateriasIds=${ids}`);
        renderizarTabelasMistas();
    } catch (e) {
        container.innerHTML = `<p class="erro">Falha ao gerar relatório.</p>`;
    }
}

function renderizarTabelasMistas() {
    const container = document.getElementById('container-tabelas-classificacao');
    container.innerHTML = '';

    const categorias = Object.keys(dadosRelatorioGlobal);
    if (categorias.length === 0) {
        container.innerHTML = `<p class="carregando">Sem resultados para exibir.</p>`;
        return;
    }

    // Identifica os nomes das baterias para as colunas
    const nomesBaterias = Object.keys(dadosRelatorioGlobal[categorias[0]][0]?.resultadosPorBateria || {});

    categorias.forEach(nomeCat => {
        container.insertAdjacentHTML('beforeend', gerarHtmlTabelaCategoria(nomeCat, dadosRelatorioGlobal[nomeCat], nomesBaterias));
    });
}

function gerarHtmlTabelaCategoria(nomeCat, pilotos, nomesBaterias) {
    const colunasBatHeader = nomesBaterias.map(n => `<th style="text-align: center;">${n}</th>`).join('');
    
    let html = `
        <div class="secao-classificacao">
            <h3 class="titulo-secao-cat">🏎️ Categoria: ${nomeCat}</h3>
            <table class="tabela-pilotos">
                <thead>
                    <tr>
                        <th>Pos</th><th>Kart</th><th>Piloto</th>
                        ${colunasBatHeader}
                        <th>Total</th><th class="no-print">Ajuste</th>
                    </tr>
                </thead>
                <tbody>`;

    pilotos.forEach((p, idx) => {
        const pos = idx + 1;
        const medalha = pos === 1 ? '🥇' : (pos === 2 ? '🥈' : (pos === 3 ? '🥉' : `${pos}º`));
        
        const colunasBatData = nomesBaterias.map(nome => {
            const val = p.resultadosPorBateria[nome] || "-";
            const corNc = val === "NC" ? "color: #e74c3c; font-weight: bold;" : "";
            return `<td style="text-align: center; ${corNc}">${val}</td>`;
        }).join('');

        html += `
            <tr>
                <td><strong style="font-size: 1.1em;">${medalha}</strong></td>
                <td>🏎️ ${p.piloto.numeroKart}</td>
                <td><strong>${p.piloto.nome}</strong></td>
                ${colunasBatData}
                <td class="col-total">${p.totalPontos} pts</td>
                <td class="no-print">
                    <button class="btn-ajuste" onclick="moverPosicaoMista('${nomeCat}', ${idx}, -1)">🔼</button>
                    <button class="btn-ajuste" onclick="moverPosicaoMista('${nomeCat}', ${idx}, 1)">🔽</button>
                </td>
            </tr>`;
    });

    return html + `</tbody></table></div>`;
}

function moverPosicaoMista(nomeCategoria, index, direcao) {
    const lista = dadosRelatorioGlobal[nomeCategoria];
    const novaPos = index + direcao;

    if (novaPos >= 0 && novaPos < lista.length) {
        [lista[index], lista[novaPos]] = [lista[novaPos], lista[index]];
        renderizarTabelasMistas();
    }
}

function baixarPdfOficial() {
    const ids = Array.from(document.querySelectorAll('.chk-bateria:checked')).map(chk => chk.value).join(',');
    const nomeCamp = document.getElementById('titulo-campeonato-ativo').innerText.replace('🏁 ', '');
    
    const url = `${API_BASE_URL}/relatorios/etapa/pdf?bateriasIds=${ids}&nomeCampeonato=${encodeURIComponent(nomeCamp)}`;
    window.open(url, '_blank');
}
