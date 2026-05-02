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

    // Mapeamento de botões de navegação e ações
    configurarNavegacao();

    // Ações de classificação e PDF (IDs atualizados conforme solicitado)
    document.getElementById('btn-preview-pdf')?.addEventListener('click', () => gerarPdfPost('preview'));
    document.getElementById('btn-imprimir-pdf')?.addEventListener('click', () => gerarPdfPost('download'));
    document.getElementById('btn-implementar-mudancas')?.addEventListener('click', implementarMudancasOficiais);
    document.getElementById('btn-ok-classificacao')?.addEventListener('click', () => mostrarTela('tela-home'));
    
    // Outras ações
    document.getElementById('btn-gerar-relatorio-selecionadas')?.addEventListener('click', gerarRelatorioDasSelecionadas);
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
        'btn-calcular-pontos': calcularPontosBateria,
        'btn-voltar-campeonato-dash': () => mostrarTela('tela-categorias'),
        'btn-voltar-dash-classificacao': () => mostrarTela('tela-baterias')
    };

    Object.entries(navegação).forEach(([id, handler]) => {
        document.getElementById(id)?.addEventListener('click', handler);
    });
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
                    <td><strong>${camp.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirCampeonato(${camp.id}, '${camp.nome}')">Gerenciar ➔</button>
                        <button class="btn" style="background-color: #ef3523; color: white;" onclick="excluirCampeonato(${camp.id})"> Excluir</button>
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
                    <td><strong>${cat.nome}</strong></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirCategoria(${cat.id}, '${cat.nome}')">Ver Pilotos ➔</button>
                        <button class="btn" style="background-color: #ef3523; color: white;" onclick="excluirCategoria(${cat.id})"> Excluir</button>
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
    document.getElementById('titulo-categoria-ativa').innerText = `Categoria: ${nome}`;
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
            tabelaCorpo.innerHTML = `<tr><td colspan="3" class="carregando">Nenhum piloto nesta categoria.</td></tr>`;
            return;
        }

        pilotosFiltrados.forEach(p => {
            const linha = `
                <tr>
                    <td><strong>${p.numeroKart}</strong></td>
                    <td>${p.nome}</td>
                    <td>
                        <button class="btn btn-alerta" onclick="prepararEdicao(${p.id}, '${p.nome}', '${p.numeroKart}')">✏️ Editar</button>
                        <button class="btn" style="background-color: #ef3523; color: white;" onclick="excluirPiloto(${p.id})"> Excluir</button>
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
        numeroKart: document.getElementById('numero-piloto').value.trim(),
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
    carregarCheckboxesCategorias();
}

async function carregarCheckboxesCategorias() {
    const container = document.getElementById('container-categorias-bateria');
    try {
        const categorias = await apiFetch(`/categorias/campeonato/${campeonatoAtivoId}`);
        container.innerHTML = '';
        
        if (categorias.length === 0) {
            container.innerHTML = '<p style="color: #666; font-style: italic;">Nenhuma categoria cadastrada no campeonato.</p>';
            return;
        }

        categorias.forEach(cat => {
            const item = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" class="chk-categoria-bateria" value="${cat.id}" id="cat-bat-${cat.id}" style="width: 18px; height: 18px;">
                    <label for="cat-bat-${cat.id}" style="margin: 0; cursor: pointer;">${cat.nome}</label>
                </div>`;
            container.insertAdjacentHTML('beforeend', item);
        });
    } catch (e) { console.error(e); }
}

async function carregarBaterias() {
    const tabelaCorpo = document.getElementById('tabela-baterias-corpo');
    try {
        const baterias = await apiFetch(`/baterias/campeonato/${campeonatoAtivoId}`);

        // Ordenação solicitada: Categoria (1ª da lista) -> Nome da Bateria
        baterias.sort((a, b) => {
            const catA = (a.categorias && a.categorias.length > 0) ? a.categorias[0].nome : "";
            const catB = (b.categorias && b.categorias.length > 0) ? b.categorias[0].nome : "";
            
            if (catA !== catB) {
                return catA.localeCompare(catB);
            }
            return a.nome.localeCompare(b.nome);
        });

        tabelaCorpo.innerHTML = '';

        if (baterias.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="3" class="carregando">Nenhuma corrida registrada.</td></tr>`;
            return;
        }

        baterias.forEach(b => {
            const nomesCats = b.categorias?.map(c => c.nome).join(', ') || 'Nenhuma';
            const linha = `
                <tr>
                    <td style="text-align: center;"><input type="checkbox" class="chk-bateria" value="${b.id}" style="transform: scale(1.5);"></td>
                    <td><strong>${b.nome}</strong><br><small style="color: #666;">Categorias: ${nomesCats}</small></td>
                    <td>
                        <button class="btn btn-primario" onclick="abrirResultadosBateria(${b.id}, '${b.nome}')">Lançar Resultados ➔</button>
                        <button class="btn" style="background-color: #ef3523; color: white;" onclick="excluirBateria(${b.id})"> Excluir</button>
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
    const checkboxes = document.querySelectorAll('.chk-categoria-bateria:checked');
    
    if (checkboxes.length === 0) {
        return alert("Selecione pelo menos uma categoria para esta bateria!");
    }

    const categoriasSelecionadas = Array.from(checkboxes).map(chk => ({ id: parseInt(chk.value) }));

    try {
        await apiFetch('/baterias', {
            method: 'POST',
            body: JSON.stringify({
                nome: inputNome.value,
                campeonato: { id: campeonatoAtivoId },
                categorias: categoriasSelecionadas
            })
        });
        inputNome.value = '';
        carregarBaterias();
        carregarCheckboxesCategorias();
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
        const [pilotosValidos, resultadosExistentes] = await Promise.all([
            apiFetch(`/pilotos/bateria/${bateriaAtivaId}`),
            apiFetch('/resultados')
        ]);

        const idsPilotosComResultado = resultadosExistentes
            .filter(r => r.bateria?.id === bateriaAtivaId)
            .map(r => r.piloto?.id);

        const pilotosFiltrados = pilotosValidos.filter(p => !idsPilotosComResultado.includes(p.id));

        select.innerHTML = '<option value="">Selecione o piloto...</option>';
        pilotosFiltrados.forEach(p => {
            select.insertAdjacentHTML('beforeend', `<option value="${p.id}">Kart #${p.numeroKart} - ${p.nome} (${p.categoria.nome})</option>`);
        });
    } catch (e) { console.error(e); }
}

async function salvarResultado(e) {
    e.preventDefault();
    const pilotoId = document.getElementById('select-piloto-resultado').value;
    const posicao = document.getElementById('posicao-chegada').value;
    const marcouNc = document.getElementById('checkbox-nc').checked;
    const marcouPole = document.getElementById('checkbox-pole').checked;
    const extras = document.getElementById('pontos-extras').value;

    const dados = {
        bateria: { id: bateriaAtivaId },
        piloto: { id: parseInt(pilotoId) },
        posicaoChegada: parseInt(posicao),
        nc: marcouNc,
        polePosition: marcouPole,
        pontosExtras: parseInt(extras) || 0 // Trata campos vazios/NaN
    };

    try {
        await apiFetch('/resultados', { method: 'POST', body: JSON.stringify(dados) });
        document.getElementById('posicao-chegada').value = '';
        document.getElementById('checkbox-nc').checked = false;
        document.getElementById('checkbox-pole').checked = false;
        document.getElementById('pontos-extras').value = '0';
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
            tabelaCorpo.innerHTML = `<tr><td colspan="6" class="carregando">Sem resultados lançados.</td></tr>`;
            carregarOpcoesPilotos(); // Atualiza dropdown mesmo se vazio
            return;
        }

        filtrados.forEach(r => {
            const linha = `
                <tr>
                    <td><strong>${r.posicaoChegada}º</strong></td>
                    <td>${r.piloto?.numeroKart || '-'}</td>
                    <td>${r.piloto?.nome || '-'} ${r.polePosition ? '⏱️' : ''}</td>
                    <td><span class="badge-categoria">${r.piloto?.categoria?.nome || '-'}</span></td>
                    <td><strong>${r.pontos != null ? r.pontos : '-'} pts</strong></td>
                    <td>
                        <button class="btn" style="background-color: #ef3523; color: white; padding: 2px 8px; font-size: 0.8em;" onclick="excluirResultado(${r.id})"> Remover</button>
                    </td>
                </tr>`;
            tabelaCorpo.insertAdjacentHTML('beforeend', linha);
        });

        carregarOpcoesPilotos(); // Atualiza o dropdown para remover pilotos já registrados
    } catch (e) { console.error(e); }
}

async function excluirResultado(resultadoId) {
    if (!confirm('Tem certeza que deseja remover este piloto desta bateria?')) return;
    try {
        await apiFetch('/resultados/' + resultadoId, { method: 'DELETE' });
        carregarResultados();
        carregarOpcoesPilotos();
    } catch (e) { alert('Erro ao excluir resultado.'); }
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
    
    // OBJETIVO 2: A MATEMÁTICA DO EMPATE
    // 1. Mapa de frequências para contar quantas vezes cada pontuação aparece
    const contagemPontos = {};
    pilotos.forEach(p => {
        const pts = p.totalPontos;
        contagemPontos[pts] = (contagemPontos[pts] || 0) + 1;
    });

    let html = `
        <div class="secao-classificacao">
            <h3 class="titulo-secao-cat"> Categoria: ${nomeCat}</h3>
            <table class="tabela-pilotos">
                <thead>
                    <tr>
                        <th>Pos</th><th>Kart</th><th>Piloto</th>
                        ${colunasBatHeader}
                        <th>Total</th><th class="no-print col-ajuste">Ajuste</th>
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

        // 2. Verifica se houve empate (contagem maior que 1)
        const houveEmpate = contagemPontos[p.totalPontos] > 1;

        html += `
            <tr>
                <td><strong style="font-size: 1.1em;">${medalha}</strong></td>
                <td>${p.piloto.numeroKart}</td>
                <td><strong>${p.piloto.nome}</strong> ${p.polePosition ? '⏱️' : ''}</td>
                ${colunasBatData}
                <td class="col-total" style="color: ${houveEmpate ? 'red' : 'inherit'}; font-weight: ${houveEmpate ? 'bold' : 'normal'};">
                    ${p.totalPontos} pts ${p.recebeuPontoExtra ? '<span style="color: red; font-weight: bold;">*</span>' : ''}
                </td>
                <td class="no-print col-ajuste">
                    ${houveEmpate ? `
                    <button class="btn-ajuste" onclick="moverPosicaoMista('${nomeCat}', ${idx}, -1)">🔼</button>
                    <button class="btn-ajuste" onclick="moverPosicaoMista('${nomeCat}', ${idx}, 1)">🔽</button>
                    ` : ''}
                </td>
            </tr>`;
    });

    return html + `</tbody></table><p style="font-size: 0.85em; color: #555; margin-top: 5px;">* pontuação extra conforme regulamento</p></div>`;
}

function implementarMudancasOficiais() {
    // Esconde as colunas e botões de ajuste (setinhas)
    const colunasAjuste = document.querySelectorAll('.col-ajuste');
    colunasAjuste.forEach(col => col.style.display = 'none');
    
    // Desativa o botão para confirmar que as mudanças foram aplicadas
    const btn = document.getElementById('btn-implementar-mudancas');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.innerText = '✅ Mudanças Aplicadas';
    }

    alert("Ordem oficial salva! As setas de ajuste foram bloqueadas.");
}

function moverPosicaoMista(nomeCategoria, index, direcao) {
    const lista = dadosRelatorioGlobal[nomeCategoria];
    const novaPos = index + direcao;

    if (novaPos >= 0 && novaPos < lista.length) {
        [lista[index], lista[novaPos]] = [lista[novaPos], lista[index]];
        renderizarTabelasMistas();
    }
}

async function gerarPdfPost(acao) {
    const nomeCamp = document.getElementById('titulo-campeonato-ativo').innerText.replace('🏁 ', '');
    
    try {
        const response = await fetch(`${API_BASE_URL}/relatorios/etapa/pdf?nomeCampeonato=${encodeURIComponent(nomeCamp)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosRelatorioGlobal)
        });

        if (!response.ok) throw new Error("Erro ao gerar PDF no backend.");

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        if (acao === 'preview') {
            window.open(url, '_blank');
        } else {
            const link = document.createElement('a');
            link.href = url;
            link.download = `Resultado_Oficial_${nomeCamp.replace(/\s+/g, '_')}.pdf`;
            link.click();
        }
    } catch (e) {
        alert("Erro ao processar PDF: " + e.message);
    }
}
