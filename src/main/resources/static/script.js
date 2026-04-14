document.addEventListener('DOMContentLoaded', () => {
    carregarCampeonatos();
    carregarOpcoesTabelas();

    // O sinal de interrogação (?.) impede que o JS trave se não achar o botão na tela!

    // Formulários
    document.getElementById('form-campeonato')?.addEventListener('submit', salvarCampeonato);
    document.getElementById('form-categoria')?.addEventListener('submit', salvarCategoria);
    document.getElementById('form-piloto')?.addEventListener('submit', salvarPiloto);
    document.getElementById('form-bateria')?.addEventListener('submit', salvarBateria);
    document.getElementById('form-resultado')?.addEventListener('submit', salvarResultado);
    document.getElementById('form-tabela')?.addEventListener('submit', salvarTabelaPontos);

    // Navegação (Voltar)
    document.getElementById('btn-voltar-home')?.addEventListener('click', voltarParaHome);
    document.getElementById('btn-voltar-categorias')?.addEventListener('click', voltarParaCategorias);
    document.getElementById('btn-cancelar-edicao')?.addEventListener('click', cancelarEdicao);
    document.getElementById('btn-voltar-baterias')?.addEventListener('click', abrirTelaBaterias);

    document.getElementById('btn-voltar-campeonato-dash')?.addEventListener('click', () => {
        esconderTodasAsTelas(); document.getElementById('tela-categorias').classList.remove('oculta');
    });
    document.getElementById('btn-voltar-dash-classificacao')?.addEventListener('click', () => {
        esconderTodasAsTelas(); document.getElementById('tela-baterias').classList.remove('oculta');
    });

    // Ações Principais
    document.getElementById('btn-ir-baterias')?.addEventListener('click', abrirTelaBaterias);
    document.getElementById('btn-calcular-pontos')?.addEventListener('click', calcularPontosBateria);
    document.getElementById('btn-imprimir-pdf')?.addEventListener('click', () => window.print());

    // O NOSSO BOTÃO DE SOMAR AS BATERIAS DA TELA 4:
    document.getElementById('btn-gerar-relatorio-selecionadas')?.addEventListener('click', gerarRelatorioDasSelecionadas);

    // BÔNUS: Um aviso no botão antigo de "Ver Classificação Final" da Tela 2
    document.getElementById('btn-gerar-pdf')?.addEventListener('click', () => {
        alert("Para gerar a classificação final Oficial, clique no botão verde 'Ir para Corridas', marque as caixinhas das baterias que deseja somar e clique em 'Somar Baterias Selecionadas'.");
    });
});

function esconderTodasAsTelas() {
    ['tela-home', 'tela-categorias', 'tela-pilotos', 'tela-baterias', 'tela-resultados', 'tela-classificacao'].forEach(id => {
        document.getElementById(id).classList.add('oculta');
    });
}

// (TELA 1 e 2 - Mantidas iguaizinhas)
async function carregarCampeonatos() {
    const tabela = document.getElementById('tabela-campeonatos-corpo');
    try {
        const res = await fetch('http://localhost:8080/api/campeonatos');
        const camps = await res.json();
        tabela.innerHTML = '';
        if (camps.length === 0) { tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhum campeonato.</td></tr>`; return; }
        camps.forEach(c => tabela.innerHTML += `<tr><td>#${c.id}</td><td><strong>${c.nome}</strong></td><td><button class="btn btn-primario" onclick="abrirCampeonato(${c.id}, '${c.nome}')">Gerenciar ➔</button></td></tr>`);
    } catch (e) { console.error(e); }
}

async function salvarCampeonato(e) {
    e.preventDefault(); const nome = document.getElementById('nome-campeonato').value;
    try { await fetch('http://localhost:8080/api/campeonatos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome }) }); document.getElementById('nome-campeonato').value = ''; carregarCampeonatos(); } catch (e) { alert('Erro!'); }
}

function abrirCampeonato(id, nome) { campeonatoAtivoId = id; document.getElementById('titulo-campeonato-ativo').innerText = "🏁 " + nome; esconderTodasAsTelas(); document.getElementById('tela-categorias').classList.remove('oculta'); carregarCategorias(); }
function voltarParaHome() { campeonatoAtivoId = null; esconderTodasAsTelas(); document.getElementById('tela-home').classList.remove('oculta'); }

async function carregarCategorias() {
    const tabela = document.getElementById('tabela-categorias-corpo');
    try {
        const res = await fetch(`http://localhost:8080/api/categorias/campeonato/${campeonatoAtivoId}`); const cats = await res.json(); tabela.innerHTML = '';
        if (cats.length === 0) { tabela.innerHTML = `<tr><td colspan="3" class="carregando">Nenhuma categoria.</td></tr>`; return; }
        cats.forEach(c => tabela.innerHTML += `<tr><td>#${c.id}</td><td><strong>${c.nome}</strong></td><td><button class="btn btn-primario" onclick="abrirCategoria(${c.id}, '${c.nome}')">Ver Pilotos ➔</button></td></tr>`);
    } catch (e) { console.error(e); }
}

async function salvarCategoria(e) { e.preventDefault(); const nome = document.getElementById('nome-categoria').value; try { await fetch('http://localhost:8080/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome, campeonato: { id: campeonatoAtivoId } }) }); document.getElementById('nome-categoria').value = ''; carregarCategorias(); } catch (e) { alert('Erro!'); } }

// (TELA 3 - Pilotos - Mantida iguaizinha)
function abrirCategoria(id, nome) { categoriaAtivaId = id; document.getElementById('titulo-categoria-ativa').innerText = "🏎️ Categoria: " + nome; esconderTodasAsTelas(); document.getElementById('tela-pilotos').classList.remove('oculta'); carregarPilotos(); }
function voltarParaCategorias() { categoriaAtivaId = null; cancelarEdicao(); esconderTodasAsTelas(); document.getElementById('tela-categorias').classList.remove('oculta'); }
async function carregarPilotos() { const tabela = document.getElementById('tabela-corpo'); try { const res = await fetch('http://localhost:8080/api/pilotos'); const ps = await res.json(); const pf = ps.filter(p => p.categoria && p.categoria.id === categoriaAtivaId); tabela.innerHTML = ''; if (pf.length === 0) { tabela.innerHTML = `<tr><td colspan="4" class="carregando">Nenhum piloto.</td></tr>`; return; } pf.forEach(p => tabela.innerHTML += `<tr><td>#${p.id}</td><td>🏎️ <strong>${p.numeroKart}</strong></td><td>${p.nome}</td><td><button class="btn" style="background-color: #f39c12; color: white;" onclick="prepararEdicao(${p.id}, '${p.nome}', ${p.numeroKart})">✏️ Editar</button></td></tr>`); } catch (e) { console.error(e); } }
async function salvarPiloto(e) { e.preventDefault(); const id = document.getElementById('edit-piloto-id').value; const dados = { nome: document.getElementById('nome-piloto').value, numeroKart: parseInt(document.getElementById('numero-piloto').value), categoria: { id: categoriaAtivaId } }; try { if (id) { await fetch(`http://localhost:8080/api/pilotos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) }); } else { await fetch('http://localhost:8080/api/pilotos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) }); } cancelarEdicao(); carregarPilotos(); } catch (e) { alert('Erro!'); } }
function prepararEdicao(id, nome, num) { document.getElementById('edit-piloto-id').value = id; document.getElementById('nome-piloto').value = nome; document.getElementById('numero-piloto').value = num; document.getElementById('titulo-form-piloto').innerText = "✏️ Editando Piloto"; document.getElementById('btn-salvar-piloto').innerText = "Atualizar"; document.getElementById('btn-cancelar-edicao').classList.remove('oculta'); }
function cancelarEdicao() { document.getElementById('edit-piloto-id').value = ''; document.getElementById('nome-piloto').value = ''; document.getElementById('numero-piloto').value = ''; document.getElementById('titulo-form-piloto').innerText = "Cadastrar Novo Piloto"; document.getElementById('btn-salvar-piloto').innerText = "Salvar Piloto"; document.getElementById('btn-cancelar-edicao').classList.add('oculta'); }

// (TABELAS DE PONTOS)
async function salvarTabelaPontos(e) { e.preventDefault(); const nome = document.getElementById('nome-tabela').value; const vals = document.getElementById('valores-tabela').value.split(','); const map = {}; vals.forEach((v, i) => map[i + 1] = parseInt(v.trim())); try { await fetch('http://localhost:8080/api/tabelas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: nome, pontosPorPosicao: map }) }); document.getElementById('nome-tabela').value = ''; document.getElementById('valores-tabela').value = ''; carregarOpcoesTabelas(); alert('Regra salva!'); } catch (e) { alert('Erro!'); } }
async function carregarOpcoesTabelas() { const s = document.getElementById('select-tabela-pontos'); try { const res = await fetch('http://localhost:8080/api/tabelas'); const t = await res.json(); if(s) { s.innerHTML = '<option value="">Qual regra usar?</option>'; t.forEach(x => s.innerHTML += `<option value="${x.id}">${x.nome}</option>`); } } catch (e) { console.error(e); } }

// ==========================================
// TELA 4 e 5: BATERIAS E RESULTADOS (ATUALIZADA COM CHECKBOXES)
// ==========================================
function abrirTelaBaterias() { esconderTodasAsTelas(); document.getElementById('tela-baterias').classList.remove('oculta'); carregarBaterias(); }

async function carregarBaterias() {
    const tabela = document.getElementById('tabela-baterias-corpo');
    try {
        const res = await fetch(`http://localhost:8080/api/baterias/campeonato/${campeonatoAtivoId}`);
        const bat = await res.json();
        tabela.innerHTML = '';
        if (bat.length === 0) { tabela.innerHTML = `<tr><td colspan="4" class="carregando">Nenhuma corrida registrada.</td></tr>`; return; }
        bat.forEach(b => {
            // NOVO: Adicionado o <input type="checkbox"> na primeira coluna
            tabela.innerHTML += `<tr>
                <td style="text-align: center;"><input type="checkbox" class="chk-bateria" value="${b.id}" style="transform: scale(1.5);"></td>
                <td>#${b.id}</td><td><strong>${b.nome}</strong></td>
                <td><button class="btn btn-primario" onclick="abrirResultadosBateria(${b.id}, '${b.nome}')">Lançar Resultados ➔</button></td>
            </tr>`;
        });
    } catch (e) { console.error(e); }
}

async function salvarBateria(e) { e.preventDefault(); const n = document.getElementById('nome-bateria').value; try { await fetch('http://localhost:8080/api/baterias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: n, campeonato: { id: campeonatoAtivoId } }) }); document.getElementById('nome-bateria').value = ''; carregarBaterias(); } catch (e) { alert('Erro!'); } }

function abrirResultadosBateria(id, nome) { bateriaAtivaId = id; document.getElementById('titulo-bateria-ativa').innerText = "🏁 " + nome; esconderTodasAsTelas(); document.getElementById('tela-resultados').classList.remove('oculta'); carregarOpcoesPilotos(); carregarResultados(); }
async function carregarOpcoesPilotos() { const s = document.getElementById('select-piloto-resultado'); try { const rc = await fetch(`http://localhost:8080/api/categorias/campeonato/${campeonatoAtivoId}`); const ids = (await rc.json()).map(c => c.id); const rp = await fetch('http://localhost:8080/api/pilotos'); const ps = (await rp.json()).filter(p => p.categoria && ids.includes(p.categoria.id)); s.innerHTML = '<option value="">Selecione o piloto...</option>'; ps.forEach(p => s.innerHTML += `<option value="${p.id}">Kart #${p.numeroKart} - ${p.nome} (${p.categoria.nome})</option>`); } catch (e) { console.error(e); } }
async function salvarResultado(e) { e.preventDefault(); const pid = document.getElementById('select-piloto-resultado').value; const pos = document.getElementById('posicao-chegada').value; try { await fetch('http://localhost:8080/api/resultados', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bateria: { id: bateriaAtivaId }, piloto: { id: parseInt(pid) }, posicaoChegada: parseInt(pos) }) }); document.getElementById('posicao-chegada').value = ''; carregarResultados(); } catch (e) { alert('Erro!'); } }
async function carregarResultados() { const tab = document.getElementById('tabela-resultados-corpo'); try { const res = await fetch('http://localhost:8080/api/resultados'); const filtrados = (await res.json()).filter(r => r.bateria && r.bateria.id === bateriaAtivaId).sort((a, b) => a.posicaoChegada - b.posicaoChegada); tab.innerHTML = ''; if (filtrados.length === 0) { tab.innerHTML = `<tr><td colspan="5" class="carregando">Sem resultados.</td></tr>`; return; } filtrados.forEach(r => tab.innerHTML += `<tr><td><strong>${r.posicaoChegada}º</strong></td><td>🏎️ ${r.piloto?r.piloto.numeroKart:'-'}</td><td>${r.piloto?r.piloto.nome:'-'}</td><td><span style="font-size: 0.85em; background: #eee; padding: 2px 6px; border-radius: 4px;">${r.piloto&&r.piloto.categoria?r.piloto.categoria.nome:'-'}</span></td><td><strong>${r.pontos!=null?r.pontos:'-'} pts</strong></td></tr>`); } catch (e) { console.error(e); } }
async function calcularPontosBateria() { const tid = document.getElementById('select-tabela-pontos').value; if (!tid) { alert("Selecione a Regra!"); return; } try { const r = await fetch(`http://localhost:8080/api/resultados/calcular/${bateriaAtivaId}?tabelaId=${tid}`, { method: 'POST' }); if (r.ok) { alert('🏁 Sucesso!'); carregarResultados(); } else { alert('Erro!'); } } catch (e) { console.error(e); } }

// ==========================================
// TELA 6: RELATÓRIO MISTO E SEPARADO
// ==========================================
async function gerarRelatorioDasSelecionadas() {
    // 1. Pega todas as caixinhas que estão marcadas
    const checkboxes = document.querySelectorAll('.chk-bateria:checked');
    if (checkboxes.length === 0) {
        alert("Por favor, selecione pelo menos uma bateria para gerar o relatório!");
        return;
    }

    // 2. Monta a lista de IDs separados por vírgula (Ex: "1,2,3")
    const ids = Array.from(checkboxes).map(chk => chk.value).join(',');

    esconderTodasAsTelas();
    document.getElementById('tela-classificacao').classList.remove('oculta');

    const nomeCamp = document.getElementById('titulo-campeonato-ativo').innerText.replace('🏁 ', '');
    document.getElementById('titulo-impressao-campeonato').innerText = nomeCamp;

    const container = document.getElementById('container-tabelas-classificacao');
    container.innerHTML = `<p class="carregando">Processando cruzamento de dados e calculando pódios...</p>`;

    try {
        // 3. Chama a nossa NOVA ROTA do Java passando os IDs
        const resposta = await fetch(`http://localhost:8080/api/relatorios/etapa?bateriasIds=${ids}`);

        if (!resposta.ok) throw new Error("Erro na API");

        // 4. Salva o resultado globalmente para podermos mover os pilotos depois
        dadosRelatorioGlobal = await resposta.json();

        // 5. Desenha as tabelas
        renderizarTabelasMistas();

    } catch (erro) {
        console.error(erro);
        container.innerHTML = `<p style="color: red; text-align: center;">Erro ao gerar relatório. Verifique o servidor Java.</p>`;
    }
}

function renderizarTabelasMistas() {
    const container = document.getElementById('container-tabelas-classificacao');
    container.innerHTML = ''; // Limpa o carregando

    // Pega as "Chaves" do JSON (que são os nomes das categorias: "F4 A", "F4 B")
    const categoriasNomes = Object.keys(dadosRelatorioGlobal);

    if (categoriasNomes.length === 0) {
        container.innerHTML = `<p class="carregando">As baterias selecionadas ainda não possuem resultados processados.</p>`;
        return;
    }

    // Para cada categoria, cria um bloco de tabela no HTML
    categoriasNomes.forEach(nomeCat => {
        const pilotosDestaCat = dadosRelatorioGlobal[nomeCat];

        // Cria o título da Categoria (Ex: 🏎️ Resultados: F4 A)
        let htmlBloco = `
            <div style="margin-top: 3rem;">
                <h3 style="background: #2c3e50; color: white; padding: 10px; border-radius: 5px 5px 0 0; margin-bottom: 0;">
                    🏎️ Categoria: ${nomeCat}
                </h3>
                <table class="tabela-pilotos" style="margin-top: 0;">
                    <thead>
                        <tr>
                            <th>Pos</th>
                            <th>Kart</th>
                            <th>Piloto</th>
                            <th>Total de Pontos</th>
                            <th class="no-print">Ajuste Manual</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Preenche as linhas dos pilotos dessa categoria
        pilotosDestaCat.forEach((linha, index) => {
            const pos = index + 1;
            const medalha = pos === 1 ? '🥇' : (pos === 2 ? '🥈' : (pos === 3 ? '🥉' : pos + 'º'));

            htmlBloco += `
                <tr>
                    <td><strong style="font-size: 1.2em;">${medalha}</strong></td>
                    <td>🏎️ ${linha.piloto.numeroKart}</td>
                    <td><strong>${linha.piloto.nome}</strong></td>
                    <td style="color: #27ae60; font-weight: bold; font-size: 1.1em;">${linha.totalPontos} pts</td>
                    <td class="no-print">
                        <button class="btn" style="padding: 2px 5px; background: #eee;" onclick="moverPosicaoMista('${nomeCat}', ${index}, -1)">🔼</button>
                        <button class="btn" style="padding: 2px 5px; background: #eee;" onclick="moverPosicaoMista('${nomeCat}', ${index}, 1)">🔽</button>
                    </td>
                </tr>
            `;
        });

        htmlBloco += `</tbody></table></div>`;
        container.innerHTML += htmlBloco; // Injeta na tela
    });
}

// NOVO: A Função do Diretor de Prova atualizada para lidar com múltiplas tabelas!
function moverPosicaoMista(nomeCategoria, index, direcao) {
    const arrayPilotos = dadosRelatorioGlobal[nomeCategoria];
    const novaPosicao = index + direcao;

    if (novaPosicao < 0 || novaPosicao >= arrayPilotos.length) return;

    // Faz a troca (Swap) de posições no array daquela categoria específica
    const temp = arrayPilotos[index];
    arrayPilotos[index] = arrayPilotos[novaPosicao];
    arrayPilotos[novaPosicao] = temp;

    // Redesenha todas as tabelas com a nova ordem
    renderizarTabelasMistas();
}