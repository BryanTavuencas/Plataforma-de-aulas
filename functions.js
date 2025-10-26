// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

// Pequena configuração - números/constantes podem ser ajustados
const CONFIG = {
    STORAGE_PREFIX: 'codeclass_',
    SAMPLE_USER: 'visitante'
};

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================

let estadoApp = {
    usuario: null,
    cursoAtual: null,
    aulaAtual: null
};

// ========================================
// DADOS DE EXEMPLO (substituir por backend se houver)
// ========================================

const SAMPLE_COURSES = [
    {
        id: 'c-c-001',
        title: 'Curso básico de linguagem C',
        description: 'Introdução à linguagem C, comandos básicos e lógica.',
        level: 'basico',
        author: 'João Vitor',
        duration: 3600,
        lessons: [
            { id: 'aula0', title: 'Baixando a IDE', duration: 212 },
            { id: 'aula1', title: 'Estrutura e comandos básicos', duration: 1057 },
            { id: 'aula2', title: 'If e Else', duration: 652 },
            { id: 'aula3', title: 'Estruturas de repetição', duration: 868 },
            { id: 'aula4', title: 'Vetores', duration: 868 },
            { id: 'aula5', title: 'Exercício', duration: 868 }
        ]
    }
];

// ========================================
// ARMAZENAMENTO LOCAL (helpers)
// ========================================

function salvarNoLocalStorage(chave, valor) {
    try {
        localStorage.setItem(CONFIG.STORAGE_PREFIX + chave, JSON.stringify(valor));
    } catch (e) {
        console.error('Erro ao salvar no localStorage', e);
    }
}

function obterDoLocalStorage(chave, valorPadrao = null) {
    try {
        const raw = localStorage.getItem(CONFIG.STORAGE_PREFIX + chave);
        return raw ? JSON.parse(raw) : valorPadrao;
    } catch (e) {
        console.error('Erro ao ler localStorage', e);
        return valorPadrao;
    }
}

function limparLocalStorage() {
    // remove somente as chaves do app
    Object.keys(localStorage)
        .filter(k => k.startsWith(CONFIG.STORAGE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
}

// ========================================
// AUTENTICAÇÃO SIMPLES (mock)
// ========================================

function fazerLogin(usuario, senha) {
    // Autenticação mock: aceita qualquer usuário não vazio
    if (!usuario || usuario.trim() === '') {
        exibirMensagem('Informe um nome de usuário válido', 'erro');
        return false;
    }

    const userObj = { username: usuario.trim(), loggedAt: new Date().toISOString() };
    salvarNoLocalStorage('usuario', userObj);
    estadoApp.usuario = userObj;
    atualizarInterfaceUsuario();
    exibirMensagem('Login realizado', 'sucesso');
    return true;
}

function fazerLogout() {
    salvarNoLocalStorage('usuario', null);
    estadoApp.usuario = null;
    atualizarInterfaceUsuario();
    exibirMensagem('Logout realizado', 'sucesso');
}

function verificarAutenticacao() {
    const u = obterDoLocalStorage('usuario', null);
    if (u) {
        estadoApp.usuario = u;
    } else {
        estadoApp.usuario = null;
    }
    atualizarInterfaceUsuario();
}

function atualizarInterfaceUsuario() {
    // Atualiza botão de login/logout e nome do usuário nas páginas
    document.querySelectorAll('.BotaoLogin').forEach(btn => {
        if (estadoApp.usuario) {
            btn.textContent = 'Logout';
        } else {
            btn.textContent = 'Login';
        }
    });

    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.textContent = estadoApp.usuario ? estadoApp.usuario.username : 'Visitante';
}

// ========================================
// CURSOS: render, busca e filtro
// ========================================

function carregarCursos() {
    const grid = document.querySelector('.cursos-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const cursos = SAMPLE_COURSES;

    cursos.forEach(c => {
        const card = document.createElement('article');
        card.className = 'curso-card';
        card.innerHTML = `
            <h3>${c.title}</h3>
            <p>${c.description}</p>
            <p><strong>Nível:</strong> ${c.level}</p>
            <p><strong>Autor:</strong> ${c.author}</p>
            <div class="curso-actions">
                <button data-curso-id="${c.id}" class="ver-curso">Ver Curso</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // adicionar listeners
    document.querySelectorAll('.ver-curso').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.currentTarget.dataset.cursoId;
            exibirCurso(id);
        });
    });
}

function buscarCursos(termo) {
    if (!termo) return SAMPLE_COURSES;
    termo = termo.toLowerCase();
    return SAMPLE_COURSES.filter(c => c.title.toLowerCase().includes(termo) || c.description.toLowerCase().includes(termo));
}

function filtrarCursos(nivel) {
    if (!nivel) return SAMPLE_COURSES;
    return SAMPLE_COURSES.filter(c => c.level === nivel);
}

function exibirCurso(cursoId) {
    const curso = SAMPLE_COURSES.find(c => c.id === cursoId);
    if (!curso) return exibirMensagem('Curso não encontrado', 'erro');

    // salvar curso atual e navegar para aula.html
    salvarNoLocalStorage('cursoAtual', curso);
    // abrir a página de aulas
    window.location.href = 'aula.html';
}

// ========================================
// AULAS: carregamento, progresso, comentários
// ========================================

function carregarAula() {
    // Se houver curso salvo, mostrar infos no sidebar e preencher conteúdo
    const curso = obterDoLocalStorage('cursoAtual', null);
    if (!curso) return; // nada a fazer
    estadoApp.cursoAtual = curso;

    // preencher lista de módulos (sidebar)
    const listaMod = document.querySelector('.lista-modulos ul');
    if (listaMod) {
        listaMod.innerHTML = '';
        curso.lessons.forEach((l, idx) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${l.id}`;
            a.dataset.aulaId = l.id;
            a.textContent = `${idx} - ${l.title}`;
            a.addEventListener('click', ev => {
                ev.preventDefault();
                irParaAula(l.id);
            });
            li.appendChild(a);
            listaMod.appendChild(li);
        });
    }

    // atualizar barra de progresso
    atualizarBarraProgresso();

    // carregar comentários existentes (da primeira aula por padrão)
    renderizarComentarios();
}

function irParaAula(aulaId) {
    estadoApp.aulaAtual = aulaId;
    // desloca a viewport para o elemento (se existir)
    const el = document.getElementById(aulaId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    // marca progresso mínimo (visitou a aula)
    marcarProgressoAula(aulaId, 10);
    // destacar no sidebar
    destacarAulaSidebar(aulaId);
}

function marcarProgressoAula(aulaId, percentual) {
    if (!estadoApp.usuario) return; // só salva para usuário logado
    const key = `progresso_${estadoApp.usuario.username}_${estadoApp.cursoAtual.id}`;
    const progresso = obterDoLocalStorage(key, {});
    progresso[aulaId] = Math.max(progresso[aulaId] || 0, percentual);
    salvarNoLocalStorage(key, progresso);
    atualizarBarraProgresso();
}

function atualizarBarraProgresso() {
    const barra = document.querySelector('.progresso-interno');
    if (!barra || !estadoApp.cursoAtual) return;

    let percentual = 0;
    if (estadoApp.usuario) {
        const key = `progresso_${estadoApp.usuario.username}_${estadoApp.cursoAtual.id}`;
        const progresso = obterDoLocalStorage(key, {});
        const aulasConcluidas = Object.keys(progresso).length;
        percentual = Math.round((aulasConcluidas / estadoApp.cursoAtual.lessons.length) * 100);
    }
    barra.style.width = percentual + '%';
}

// Comentários por aula
function obterComentarios(aulaId) {
    const chave = `comentarios_${aulaId}`;
    return obterDoLocalStorage(chave, []);
}

function adicionarComentario(aulaId, texto) {
    if (!texto || texto.trim() === '') return;
    const chave = `comentarios_${aulaId}`;
    const lista = obterDoLocalStorage(chave, []);
    const comentario = {
        autor: estadoApp.usuario ? estadoApp.usuario.username : 'Visitante',
        texto: texto.trim(),
        data: new Date().toISOString()
    };
    lista.unshift(comentario);
    salvarNoLocalStorage(chave, lista);
    renderizarComentarios(aulaId);
}

function renderizarComentarios(aulaId = null) {
    // tenta pegar id do estado ou usar a primeira aula
    if (!aulaId) aulaId = estadoApp.aulaAtual || (estadoApp.cursoAtual && estadoApp.cursoAtual.lessons[0].id);
    const lista = obterComentarios(aulaId || '');
    const comentariosContainer = document.querySelector('.comentarios-lista ul');
    if (!comentariosContainer) return;
    comentariosContainer.innerHTML = '';
    lista.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${c.autor}:</strong> ${c.texto} <span class="small">(${formatarData(c.data)})</span>`;
        comentariosContainer.appendChild(li);
    });
}

// marca visual na sidebar para a aula atual
function destacarAulaSidebar(aulaId) {
    document.querySelectorAll('.lista-modulos a').forEach(a => {
        if (a.dataset.aulaId === aulaId) a.classList.add('ativo');
        else a.classList.remove('ativo');
    });
}

// Modo escuro simples
function aplicarModoEscuro(ativo) {
    if (ativo) document.body.classList.add('modo-escuro');
    else document.body.classList.remove('modo-escuro');
    salvarNoLocalStorage('modoEscuro', ativo);
}

// ========================================
// PERFIL
// ========================================

function carregarPerfil() {
    const usuario = estadoApp.usuario;
    const usernameEl = document.getElementById('username');
    const bioEl = document.getElementById('bio');
    if (usernameEl) usernameEl.textContent = usuario ? usuario.username : 'Visitante';
    if (bioEl) bioEl.textContent = usuario ? 'Bem-vindo de volta!' : 'Sou um usuário';
}

function alterarTab(tabNome) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelectorAll('.tab-content > div').forEach(d => d.classList.remove('ativo'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabNome}"]`);
    if (btn) btn.classList.add('ativo');
    const content = document.querySelector(`.tab-${tabNome}`) || document.querySelector(`.tab-${tabNome}`);
    // fallback: a estrutura de HTML usa nomes diferentes, ativamos via index
    if (tabNome === 'meus') document.querySelector('.tab-meus-cursos')?.classList.add('ativo');
    if (tabNome === 'certificados') document.querySelector('.tab-certificados')?.classList.add('ativo');
    if (tabNome === 'configuracoes') document.querySelector('.tab-configuracoes')?.classList.add('ativo');
}

// ========================================
// UTILITÁRIOS
// ========================================

function formatarData(dataISO) {
    try {
        const d = new Date(dataISO);
        return d.toLocaleString();
    } catch (e) {
        return dataISO;
    }
}

function formatarDuracao(segundos) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}m ${s}s`;
}

function exibirMensagem(mensagem, tipo = 'info') {
    // comportamento simples: console + alert (se desejar trocar por UI, adapte aqui)
    console.log(`[${tipo}] ${mensagem}`);
    // evitar alerts intrusivos em páginas que não sejam localhost
    // alert(mensagem);
}

function validarFormulario(form) {
    // validação mínima
    const inputs = form.querySelectorAll('input[required]');
    for (const inp of inputs) {
        if (!inp.value || inp.value.trim() === '') return false;
    }
    return true;
}

// ========================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ========================================

function inicializarEventListeners() {
    // login/logout button(s)
    document.querySelectorAll('.BotaoLogin').forEach(btn => {
        btn.addEventListener('click', () => {
            if (estadoApp.usuario) {
                fazerLogout();
            } else {
                // tenta ler campos de login presentes (se houver)
                const usuario = document.getElementById('usuario')?.value || prompt('Usuário:');
                const senha = document.getElementById('senha')?.value || prompt('Senha:');
                if (usuario) fazerLogin(usuario, senha);
            }
        });
    });

    // página de cursos: busca e filtro
    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const termo = document.getElementById('busca-cursos')?.value || '';
            const nivel = document.querySelector('input[name="nivel"]:checked')?.value || null;
            let resultados = buscarCursos(termo);
            if (nivel) resultados = resultados.filter(r => r.level === nivel);
            // renderizar resultados simples
            const grid = document.querySelector('.cursos-grid');
            if (grid) {
                grid.innerHTML = '';
                resultados.forEach(c => {
                    const card = document.createElement('article');
                    card.className = 'curso-card';
                    card.innerHTML = `<h3>${c.title}</h3><p>${c.description}</p><button data-curso-id="${c.id}" class="ver-curso">Ver Curso</button>`;
                    grid.appendChild(card);
                });
                document.querySelectorAll('.ver-curso').forEach(b => b.addEventListener('click', e => exibirCurso(e.currentTarget.dataset.cursoId)));
            }
        });
    }

    // página de aulas: comentar
    const btnComentar = document.getElementById('comentar');
    if (btnComentar) {
        btnComentar.addEventListener('click', () => {
            const input = document.getElementById('comentario');
            if (!input) return;
            const aulaId = estadoApp.aulaAtual || 'aula0';
            adicionarComentario(aulaId, input.value || '');
            input.value = '';
        });
    }

    // quizzes: botões "Enviar resposta"
    document.querySelectorAll('.btnRespomder').forEach(btn => {
        btn.addEventListener('click', ev => {
            // encontra container da questão
            const container = ev.currentTarget.closest('.aula-questionario');
            if (!container) return;
            // tenta achar aulaId no mesmo bloco (iframe id) ou deduzir pelo name do radio
            let aulaId = null;
            const aulaContainer = container.closest('.aula-container');
            if (aulaContainer) {
                const iframe = aulaContainer.querySelector('iframe[id]');
                if (iframe) aulaId = iframe.id;
            }

            // fallback: tenta extrair do nome do radio (resposta-0 -> aula0)
            const selected = container.querySelector('input[type="radio"]:checked');
            if (!selected) {
                exibirMensagem('Selecione uma opção antes de enviar', 'erro');
                return;
            }
            if (!aulaId) {
                const name = selected.name || '';
                const m = name.match(/resposta-(\d+)/);
                if (m) aulaId = 'aula' + m[1];
            }

            const resposta = selected.value;
            const user = estadoApp.usuario ? estadoApp.usuario.username : 'Visitante';
            const chave = `resposta_${user}_${aulaId || 'semId'}`;
            salvarNoLocalStorage(chave, { resposta, enviadoEm: new Date().toISOString() });
            exibirMensagem('Resposta enviada', 'sucesso');
        });
    });

    // forms de login (prevenir submit padrão e tentar login)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', ev => {
            ev.preventDefault();
            const usuario = form.querySelector('input[name="nome_usuario"]')?.value || form.querySelector('#usuario')?.value;
            const senha = form.querySelector('input[name="senha_usuario"]')?.value || form.querySelector('#senha')?.value;
            if (usuario) fazerLogin(usuario, senha);
        });
    });

    // Perfil: ações de botões
    const btnModoEscuro = document.getElementById('btnModoEscuro');
    if (btnModoEscuro) {
        btnModoEscuro.addEventListener('click', () => {
            const ativado = !document.body.classList.contains('modo-escuro');
            aplicarModoEscuro(ativado);
        });
    }

    const btnEditarPerfil = document.getElementById('btnEditarPerfil');
    if (btnEditarPerfil) {
        btnEditarPerfil.addEventListener('click', () => {
            const novo = prompt('Novo nome de usuário:', estadoApp.usuario ? estadoApp.usuario.username : '');
            if (!novo) return;
            if (!estadoApp.usuario) estadoApp.usuario = { username: novo };
            else estadoApp.usuario.username = novo.trim();
            salvarNoLocalStorage('usuario', estadoApp.usuario);
            atualizarInterfaceUsuario();
            carregarPerfil();
            exibirMensagem('Nome do usuário atualizado', 'sucesso');
        });
    }

    const btnDeletarPerfil = document.getElementById('btnDeletarPerfil');
    if (btnDeletarPerfil) {
        btnDeletarPerfil.addEventListener('click', () => {
            if (!estadoApp.usuario) return exibirMensagem('Nenhum usuário logado', 'erro');
            const confirmar = confirm('Deseja realmente deletar sua conta e todos os dados locais?');
            if (!confirmar) return;
            const username = estadoApp.usuario.username;
            // remover chaves relacionadas ao usuário
            Object.keys(localStorage)
                .filter(k => k.startsWith(CONFIG.STORAGE_PREFIX))
                .forEach(k => {
                    if (k.includes(username) || k.endsWith('usuario')) {
                        localStorage.removeItem(k);
                    }
                });
            estadoApp.usuario = null;
            atualizarInterfaceUsuario();
            exibirMensagem('Conta e dados locais removidos', 'sucesso');
            // reload para refletir mudanças
            window.location.reload();
        });
    }

    // tabs de perfil
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            alterarTab(tab);
        });
    });

    // event listeners adicionais podem ser adicionados aqui
}

document.addEventListener('DOMContentLoaded', function() {
    // inicialização
    verificarAutenticacao();
    // aplicar modo escuro salvo
    const modoSalvo = obterDoLocalStorage('modoEscuro', false);
    aplicarModoEscuro(modoSalvo);
    inicializarEventListeners();

    const path = window.location.pathname.split('/').pop();
    if (path === '' || path === 'index.html') {
        // home; nada adicional por enquanto
    }
    if (path === 'cursos.html') carregarCursos();
    if (path === 'aula.html') carregarAula();
    if (path === 'perfil.html') carregarPerfil();
});

// Alternador do menu (nav) para mobile: cria botão e comportamentos se necessário
(function setupMobileNav() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const nav = document.querySelector('nav');
            if (!nav) return;

            // cria botão apenas se ainda não existir
            if (!document.querySelector('.nav-toggle')) {
                const btn = document.createElement('button');
                btn.className = 'nav-toggle';
                btn.setAttribute('aria-label', 'Abrir menu');
                btn.innerHTML = '☰ Menu';
                // insere antes do .user-actions
                const userActions = nav.querySelector('.user-actions');
                nav.insertBefore(btn, userActions);

                const menu = nav.querySelector('.nav-menu');
                btn.addEventListener('click', () => {
                    if (!menu) return;
                    const expanded = menu.classList.toggle('show');
                    // acessibilidade
                    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                    if (expanded) {
                        // focar no primeiro link para usuários que navegam por teclado
                        const firstLink = menu.querySelector('a');
                        if (firstLink) firstLink.focus();
                    } else {
                        btn.focus();
                    }
                });

                // fechar o menu quando clicar em um link
                menu?.querySelectorAll('a').forEach(a => {
                    a.addEventListener('click', () => {
                        menu.classList.remove('show');
                        btn.setAttribute('aria-expanded', 'false');
                    });
                });

                // fechar ao clicar fora
                document.addEventListener('click', (ev) => {
                    if (!menu) return;
                    if (ev.target === btn) return;
                    if (!nav.contains(ev.target)) menu.classList.remove('show');
                });
            }
        } catch (e) {
            console.warn('Erro ao configurar mobile nav', e);
        }
    });
})();

// Controle da gaveta da sidebar (Conteúdo do Curso) em aula.html
(function setupSidebarDrawer() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const sidebar = document.querySelector('.sidebar');
            const modulos = document.querySelector('.modulos-aulas');
            if (!sidebar || !modulos) return; // só aplica em páginas com sidebar

            // criar overlay
            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }

            // OBS: removido o toggle inline da sidebar para evitar botões duplicados/sem estilo.
            // Use apenas o botão flutuante `.sidebar-open-btn` para abrir a gaveta em telas pequenas.
            let toggle = null;

            // criar botão flutuante visível fora da sidebar para abrir o drawer em mobile
            let trigger = document.querySelector('.sidebar-open-btn');
            if (!trigger) {
                trigger = document.createElement('button');
                trigger.className = 'sidebar-open-btn';
                trigger.setAttribute('aria-controls', 'sidebar');
                trigger.setAttribute('aria-expanded', 'false');
                trigger.title = 'Abrir Conteúdo do Curso';
                trigger.innerHTML = '☰ Conteúdo';
                document.body.appendChild(trigger);
                trigger.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    openSidebar();
                });
            }

            // garante que a sidebar tenha um id para ARIA
            if (!sidebar.id) sidebar.id = 'sidebar';

            function openSidebar() {
                sidebar.classList.add('show');
                overlay.classList.add('show');
                // atualizar trigger
                const triggerBtn = document.querySelector('.sidebar-open-btn');
                if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
                // focar no primeiro link para usuários que navegam por teclado
                const firstLink = sidebar.querySelector('a');
                if (firstLink) firstLink.focus();
            }

            function closeSidebar() {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                // atualizar trigger
                const triggerBtn = document.querySelector('.sidebar-open-btn');
                if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
                // focar o botão gatilho para que usuários de teclado não percam o foco
                const triggerBtn2 = document.querySelector('.sidebar-open-btn');
                if (triggerBtn2) triggerBtn2.focus();
            }

            overlay.addEventListener('click', closeSidebar);

            // fechar sidebar ao clicar em qualquer link dentro
            sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
                // pequeno atraso para permitir a navegação por âncora
                setTimeout(closeSidebar, 100);
            }));

            // fechar com ESC
            document.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') closeSidebar();
            });

            // opcional: fecha sidebar ao redimensionar para desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth > 900) {
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });

        } catch (e) {
            console.warn('Erro ao configurar sidebar drawer', e);
        }
    });
})();

// para depuração rápida via console
window._codeclass = {
    SAMPLE_COURSES,
    salvarNoLocalStorage,
    obterDoLocalStorage,
    limparLocalStorage,
    fazerLogin,
    fazerLogout
};
