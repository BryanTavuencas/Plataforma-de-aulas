// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

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
// DADOS DE EXEMPLO
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
            { id: 'aula0', title: 'Baixando a IDE', duration: 212, correctAnswer: 'respostaum' },
            { id: 'aula1', title: 'Estrutura e comandos básicos', duration: 1057, correctAnswer: 'respostaDois' },
            { id: 'aula2', title: 'If e Else', duration: 652, correctAnswer: 'respostaTres' },
            { id: 'aula3', title: 'Estruturas de repetição', duration: 868, correctAnswer: 'respostaum' },
            { id: 'aula4', title: 'Vetores', duration: 868, correctAnswer: 'respostaDois' },
            { id: 'aula5', title: 'Exercício', duration: 868, correctAnswer: 'respostaTres' }
        ]
    }
];

// ========================================
// ARMAZENAMENTO LOCAL (helpers)
// ========================================

// salvarNoLocalStorage: Salva um item no localStorage com prefixo.
function salvarNoLocalStorage(chave, valor) {
    try {
        localStorage.setItem(CONFIG.STORAGE_PREFIX + chave, JSON.stringify(valor));
    } catch (e) {
        console.error('Erro ao salvar no localStorage', e);
    }
}

// obterDoLocalStorage: Obtém um item do localStorage com prefixo, retornando um padrão se não encontrado.
function obterDoLocalStorage(chave, valorPadrao = null) {
    try {
        const raw = localStorage.getItem(CONFIG.STORAGE_PREFIX + chave);
        return raw ? JSON.parse(raw) : valorPadrao;
    } catch (e) {
        console.error('Erro ao ler localStorage', e);
        return valorPadrao;
    }
}

// limparLocalStorage: Remove todas as chaves do app (baseadas no prefixo) do localStorage.
function limparLocalStorage() {
    Object.keys(localStorage)
        .filter(k => k.startsWith(CONFIG.STORAGE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
}

// ========================================
// AUTENTICAÇÃO SIMPLES (mock)
// ========================================

// fazerLogin: Autentica o usuário (mock), salva no localStorage e atualiza a UI.
function fazerLogin(usuario, senha) {
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

// fazerLogout: Desloga o usuário, limpa do localStorage e atualiza a UI.
function fazerLogout() {
    salvarNoLocalStorage('usuario', null);
    estadoApp.usuario = null;
    atualizarInterfaceUsuario();
    exibirMensagem('Logout realizado', 'sucesso');
}

// verificarAutenticacao: Verifica se há um usuário salvo no localStorage ao carregar a página.
function verificarAutenticacao() {
    const u = obterDoLocalStorage('usuario', null);
    if (u) {
        estadoApp.usuario = u;
    } else {
        estadoApp.usuario = null;
    }
    atualizarInterfaceUsuario();
}

// atualizarInterfaceUsuario: Atualiza a UI (botões, nome de usuário) com base no estado de login.
function atualizarInterfaceUsuario() {
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

// carregarCursos: Renderiza a grade de cursos na página de cursos.
function carregarCursos() {
    const grid = document.querySelector('.cursos-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const cursos = SAMPLE_COURSES;

    cursos.forEach(c => {
        const card = document.createElement('article');
        card.className = 'curso-card';
        card.innerHTML = `
            <h3 class="curso-titulo">${c.title}</h3>
            <p class="curso-descricao">${c.description}</p>
            <p><strong>Nível:</strong> ${c.level}</p>
            <p><strong>Autor:</strong> ${c.author}</p>
            <div class="curso-actions">
                <a href="aula.html" data-curso-id="${c.id}" class="curso-btn ver-curso">Ver Curso</a>
            </div>
        `;
        grid.appendChild(card);
    });

    const btnBuscar = document.getElementById('btnBuscar');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', () => {
            const termo = document.getElementById('busca-cursos')?.value || '';
            const nivel = document.querySelector('input[name="nivel"]:checked')?.value || null;
            let resultados = buscarCursos(termo);
            if (nivel) resultados = resultados.filter(r => r.level === nivel);
            
            const grid = document.querySelector('.cursos-grid');
            if (grid) {
                grid.innerHTML = '';
                resultados.forEach(c => {
                    const card = document.createElement('article');
                    card.className = 'curso-card';
                    card.innerHTML = `<h3 class="curso-titulo">${c.title}</h3><p class="curso-descricao">${c.description}</p><a href="aula.html" data-curso-id="${c.id}" class="curso-btn ver-curso">Ver Curso</a>`;
                    grid.appendChild(card);
                });
                document.querySelectorAll('.ver-curso').forEach(b => b.addEventListener('click', e => exibirCurso(e.currentTarget.dataset.cursoId)));
            }
        });
    }
}

// carregarAula: Carrega o conteúdo da aula, aplica bloqueios/desbloqueios e anexa handlers de quiz.
function carregarAula() {
    if (!estadoApp.cursoAtual) {
        estadoApp.cursoAtual = SAMPLE_COURSES[0] || null;
    }
    if (!estadoApp.cursoAtual) return;
    
    const firstLesson = estadoApp.cursoAtual.lessons[0];
    if (firstLesson) setLessonUnlocked(firstLesson.id);

    estadoApp.cursoAtual.lessons.forEach((l, idx) => {
            const iframe = document.querySelector(`iframe#${l.id}`);
            const section = iframe ? iframe.closest('.aula-container') : null;
            if (!section) return;
            
            const unlocked = isLessonUnlockedDerived(l.id);
            
            if (!unlocked) {
                if (!section.dataset.originalHtml) section.dataset.originalHtml = section.innerHTML;
                section.classList.add('locked-section');
                section.classList.remove('unlocked');
                section.innerHTML = `
                    <div class="locked-placeholder">
                        <div class="locked-icon">🔒</div>
                        <h2>${l.title}</h2>
                        <p>Aula bloqueada. Responda corretamente o questionário da aula anterior para liberar o conteúdo.</p>
                        <div class="locked-actions">
                            <button class="btnVerRequisito" data-prev-index="${Math.max(0, idx-1)}">Ver requisito</button>
                        </div>
                    </div>
                `;
                
                const btn = section.querySelector('.btnVerRequisito');
                if (btn) btn.addEventListener('click', () => {
                    const prevIdx = parseInt(btn.dataset.prevIndex, 10);
                    const prevLesson = estadoApp.cursoAtual.lessons[prevIdx];
                    if (prevLesson) {
                        const prevIframe = document.getElementById(prevLesson.id);
                        if (prevIframe) prevIframe.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            } else {
                if (section.dataset.originalHtml) {
                    section.innerHTML = section.dataset.originalHtml;
                    const iframeRest = section.querySelector('iframe');
                    if (iframeRest && section.dataset.savedSrc) {
                        iframeRest.setAttribute('src', toSafeSrc(section.dataset.savedSrc));
                        iframeRest.style.display = 'block';
                    }
                    delete section.dataset.originalHtml;
                    section.classList.remove('locked-section');
                    section.classList.add('unlocked');
                } else {
                    const iframeRest = section.querySelector('iframe');
                    if (iframeRest && section.dataset.savedSrc) {
                        if (!iframeRest.getAttribute('src')) {
                            iframeRest.setAttribute('src', toSafeSrc(section.dataset.savedSrc));
                            iframeRest.style.display = 'block';
                        }
                    }
                    section.classList.remove('locked-section');
                    section.classList.add('unlocked');
                }

                const qContainer = section.querySelector('.aula-questionario');
                if (qContainer) attachQuizHandlerTo(qContainer);
            }
        });

    atualizarBarraProgresso();
    renderizarComentarios();
}

// irParaAula: Navega (scroll) para uma aula específica se ela estiver desbloqueada.
function irParaAula(aulaId) {
    if (!isLessonUnlockedDerived(aulaId)) {
        exibirMensagem('Aula bloqueada: responda corretamente o questionário da aula anterior para desbloquear.', 'erro');
        return;
    }

    estadoApp.aulaAtual = aulaId;
    const el = document.getElementById(aulaId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    marcarProgressoAula(aulaId, 10);
    destacarAulaSidebar(aulaId);
}

// marcarProgressoAula: Salva o percentual de progresso de uma aula no localStorage.
function marcarProgressoAula(aulaId, percentual) {
    const username = estadoApp.usuario ? estadoApp.usuario.username : CONFIG.SAMPLE_USER;
    const key = `progresso_${username}_${estadoApp.cursoAtual.id}`;
    const progresso = obterDoLocalStorage(key, {});
    progresso[aulaId] = Math.max(progresso[aulaId] || 0, percentual);
    salvarNoLocalStorage(key, progresso);
    try { atualizarBarraProgresso(); } catch (e) { /* silencioso */ }
}

// atualizarBarraProgresso: Calcula e exibe o progresso total do curso com base nas respostas corretas.
function atualizarBarraProgresso() {
    const barra = document.querySelector('.progresso-interno');
    if (!barra || !estadoApp.cursoAtual) return;

    const username = estadoApp.usuario ? estadoApp.usuario.username : CONFIG.SAMPLE_USER;
    const lessons = estadoApp.cursoAtual.lessons || [];
    let corretas = 0;
    lessons.forEach(l => {
        const chave = `resposta_${username}_${l.id}`;
        const respObj = obterDoLocalStorage(chave, null);
        if (respObj && respObj.resposta) {
            if (isAnswerCorrect(l.id, respObj.resposta)) corretas++;
        }
    });
    const percentual = lessons.length ? Math.round((corretas / lessons.length) * 100) : 0;
    const pct = percentual >= 100 ? 100 : percentual;
    barra.style.width = pct + '%';

    const wrapper = barra.parentElement || document.querySelector('.barra-progresso');
    if (wrapper) {
        let texto = wrapper.querySelector('.progresso-text');
        if (!texto) {
            texto = document.createElement('span');
            texto.className = 'progresso-text';
            wrapper.appendChild(texto);
        }
        texto.textContent = pct + '%';
        const perfilPct = document.getElementById('cursoPercent');
        if (perfilPct) perfilPct.textContent = pct + '%';
        if (pct >= 50) wrapper.classList.add('progress-high'); else wrapper.classList.remove('progress-high');
    }
}

// obterComentarios: Obtém a lista de comentários de uma aula do localStorage.
function obterComentarios(aulaId) {
    const chave = `comentarios_${aulaId}`;
    return obterDoLocalStorage(chave, []);
}

// adicionarComentario: Adiciona um novo comentário à lista de uma aula.
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

// renderizarComentarios: Exibe os comentários de uma aula na UI.
function renderizarComentarios(aulaId = null) {
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

// destacarAulaSidebar: Marca a aula atual como 'ativa' na sidebar.
function destacarAulaSidebar(aulaId) {
    document.querySelectorAll('.lista-modulos a').forEach(a => {
        if (a.dataset.aulaId === aulaId) a.classList.add('ativo');
        else a.classList.remove('ativo');
    });
}

// aplicarModoEscuro: Aplica ou remove a classe 'modo-escuro' do body.
function aplicarModoEscuro(ativo) {
    if (ativo) document.body.classList.add('modo-escuro');
    else document.body.classList.remove('modo-escuro');
    salvarNoLocalStorage('modoEscuro', ativo);
}

// ========================================
// PERFIL
// ========================================

// carregarPerfil: Carrega as informações do usuário na página de perfil.
function carregarPerfil() {
    const usuario = estadoApp.usuario;
    const usernameEl = document.getElementById('username');
    const bioEl = document.getElementById('bio');
    if (usernameEl) usernameEl.textContent = usuario ? usuario.username : 'Visitante';
    if (bioEl) bioEl.textContent = usuario ? 'Bem-vindo de volta!' : 'Sou um usuário';
    
    if (!estadoApp.cursoAtual) estadoApp.cursoAtual = SAMPLE_COURSES[0] || null;
    try { atualizarBarraProgresso(); } catch (e) { /* silencioso */ }
}

// alterarTab: Alterna a visibilidade das abas na página de perfil.
function alterarTab(tabNome) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('ativo'));
    document.querySelectorAll('.tab-content > div').forEach(d => d.classList.remove('ativo'));
    const btn = document.querySelector(`.tab-btn[data-tab="${tabNome}"]`);
    if (btn) btn.classList.add('ativo');
    const content = document.querySelector(`.tab-${tabNome}`) || document.querySelector(`.tab-${tabNome}`);
    
    if (tabNome === 'meus') document.querySelector('.tab-meus-cursos')?.classList.add('ativo');
    if (tabNome === 'certificados') document.querySelector('.tab-certificados')?.classList.add('ativo');
    if (tabNome === 'configuracoes') document.querySelector('.tab-configuracoes')?.classList.add('ativo');
}

// ========================================
// UTILITÁRIOS
// ========================================

// formatarData: Converte uma data ISO para formato local legível.
function formatarData(dataISO) {
    try {
        const d = new Date(dataISO);
        return d.toLocaleString();
    } catch (e) {
        return dataISO;
    }
}

// formatarDuracao: Converte segundos para o formato "Xm Ys".
function formatarDuracao(segundos) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}m ${s}s`;
}

// seedMockComments: Adiciona comentários de exemplo para fins de teste.
function seedMockComments() {
    try {
        const mockAuthor = 'Mago dos Games';
        const mockText = 'ja zerei todos os cursos, TODOS muito bom';
        const mock = { autor: mockAuthor, texto: mockText, data: new Date().toISOString(), mocked: true };
        
        (SAMPLE_COURSES || []).forEach(c => {
            (c.lessons || []).forEach(l => {
                const key = `comentarios_${l.id}`;
                const lista = obterDoLocalStorage(key, []);
                const exists = lista.some(ci => ci && ci.autor === mockAuthor && ci.texto === mockText);
                if (!exists) {
                    lista.unshift(mock);
                    salvarNoLocalStorage(key, lista);
                }
            });
        });
    } catch (e) {
        console.warn('Falha ao semear comentários mockados', e);
    }
}

// toSafeSrc: Converte URLs (ex: YouTube) para versões mais seguras (ex: youtube-nocookie).
function toSafeSrc(src) {
    if (!src || typeof src !== 'string') return src;
    try {
        const u = new URL(src, window.location.href);
        const host = u.hostname.toLowerCase();
        if (host.includes('youtube')) {
            let vid = null;
            if (u.pathname === '/watch') vid = u.searchParams.get('v');
            if (!vid) {
                const m = u.pathname.match(/\/embed\/([^\/\?]+)/);
                if (m) vid = m[1];
            }
            if (!vid) {
                const m2 = u.pathname.match(/\/(?:v|watch)\/([^\/\?]+)/);
                if (m2) vid = m2[1];
            }
            if (vid) {
                const out = new URL('https://www.youtube-nocookie.com/embed/' + vid);
                ['start', 't', 'autoplay', 'controls', 'rel', 'enablejsapi', 'modestbranding', 'playsinline'].forEach(k => {
                    if (u.searchParams.get(k)) out.searchParams.set(k, u.searchParams.get(k));
                });
                return out.toString();
            }
            u.hostname = u.hostname.replace('youtube.com', 'youtube-nocookie.com');
            return u.toString();
        }
    } catch (e) {
        //silencioso
    }
    return src;
}

// exibirMensagem: Exibe uma mensagem de feedback (atualmente, no console).
function exibirMensagem(mensagem, tipo = 'info') {
    console.log(`[${tipo}] ${mensagem}`);
}

// validarFormulario: Validação simples de formulário (atualmente, não utilizada).
function validarFormulario(form) {
    const inputs = form.querySelectorAll('input[required]');
    for (const inp of inputs) {
        if (!inp.value || inp.value.trim() === '') return false;
    }
    return true;
}

// ========================================
// EVENT LISTENERS E INICIALIZAÇÃO
// ========================================

// inicializarEventListeners: Anexa os listeners de eventos globais (login, perfil, etc.).
function inicializarEventListeners() {
    document.querySelectorAll('.BotaoLogin').forEach(btn => {
        btn.addEventListener('click', () => {
            if (estadoApp.usuario) {
                fazerLogout();
            } else {
                const usuario = document.getElementById('usuario')?.value || prompt('Usuário:');
                const senha = document.getElementById('senha')?.value || prompt('Senha:');
                if (usuario) fazerLogin(usuario, senha);
            }
        });
    });

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', ev => {
            ev.preventDefault();
            const usuario = form.querySelector('input[name="nome_usuario"]')?.value || form.querySelector('#usuario')?.value;
            const senha = form.querySelector('input[name="senha_usuario"]')?.value || form.querySelector('#senha')?.value;
            if (usuario) fazerLogin(usuario, senha);
        });
    });

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
            if (!estadoApp.usuario) {
                exibirMensagem('Nenhum usuário logado', 'erro');
                return;
            }
            const confirmar = confirm('Deseja realmente deletar sua conta e todos os dados locais? Esta ação não poderá ser desfeita.');
            if (!confirmar) return;

            const username = estadoApp.usuario.username;
            const prefix = CONFIG.STORAGE_PREFIX;

            const allKeys = Object.keys(localStorage);
            const prefixes = [prefix + 'resposta_', prefix + 'progresso_', prefix + 'unlocks_', prefix + 'comentarios_'];
            const keysToRemove = allKeys.filter(k => {
                if (!k.startsWith(prefix)) return false;
                if (k === prefix + 'usuario') return true;
                for (const p of prefixes) if (k.startsWith(p)) return true;
                if (username && k.includes(username)) return true;
                return false;
            });

            keysToRemove.forEach(k => localStorage.removeItem(k));

            localStorage.removeItem(prefix + 'usuario');
            estadoApp.usuario = null;
            atualizarInterfaceUsuario();

            try {
                if (estadoApp.cursoAtual && estadoApp.cursoAtual.lessons && estadoApp.cursoAtual.lessons.length) {
                    const cursoId = estadoApp.cursoAtual.id;
                    const firstLessonId = estadoApp.cursoAtual.lessons[0].id;
                    const visitorKey = `unlocks_${CONFIG.SAMPLE_USER}_${cursoId}`;
                    const obj = {};
                    obj[firstLessonId] = true;
                    salvarNoLocalStorage(visitorKey, obj);
                }
            } catch (e) { /* silencioso */ }

            try { atualizarBarraProgresso(); } catch (e) { /* silencioso */ }
            try { carregarPerfil(); } catch (e) { /* silencioso */ }
            try { renderizarComentarios(); } catch (e) { /* silencioso */ }

            exibirMensagem('Conta e dados locais removidos. Apenas a primeira aula permanece liberada.', 'sucesso');
        });
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            alterarTab(tab);
        });
    });
}

// attachQuizHandlerTo: Anexa o listener de envio ao formulário de quiz de uma aula.
function attachQuizHandlerTo(container) {
    if (!container) return;
    const btn = container.querySelector('.btnRespomder');
    if (!btn) return;

    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', ev => {
        const container = ev.currentTarget.closest('.aula-questionario');
        if (!container) return;
        
        let aulaId = null;
        const aulaContainer = container.closest('.aula-container');
        if (aulaContainer) {
            const iframe = aulaContainer.querySelector('iframe[id]');
            if (iframe && iframe.id) aulaId = iframe.id;
        }

        const selected = container.querySelector('input[type="radio"]:checked');
        if (!selected) {
            exibirMensagem('Selecione uma opção antes de enviar', 'erro');
            return;
        }

        if (!aulaId) {
            const nameOrId = selected.name || selected.id || '';
            let m = nameOrId.match(/resposta[-_]?([0-9]+)/);
            if (m) aulaId = 'aula' + m[1];
        }

        if (!aulaId) {
            const allQs = Array.from(document.querySelectorAll('.aula-questionario'));
            const idx = allQs.indexOf(container);
            if (idx !== -1) aulaId = 'aula' + idx;
        }

    const resposta = selected.value;
    const user = estadoApp.usuario ? estadoApp.usuario.username : CONFIG.SAMPLE_USER;
    const chave = `resposta_${user}_${aulaId || 'semId'}`;
    const correta = isAnswerCorrect(aulaId, resposta);
    
    salvarNoLocalStorage(chave, { resposta, enviadoEm: new Date().toISOString(), correta: !!correta });
    try { atualizarBarraProgresso(); } catch (e) { /* silencioso */ }

        if (correta) {
            unlockNextLesson(aulaId);
            exibirMensagem('Resposta correta! Próxima aula desbloqueada.', 'sucesso');
            
            try {
                const lessons = estadoApp.cursoAtual ? estadoApp.cursoAtual.lessons : [];
                const idx = lessons.findIndex(l => l.id === aulaId);
                const next = lessons[idx + 1];
                setTimeout(() => {
                    try { carregarAula(); } catch (e) { /* silencioso */ }
                    if (next) {
                        const el = document.getElementById(next.id);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                        destacarAulaSidebar(next.id);
                        marcarProgressoAula(next.id, 5);
                    }
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                }, 220);
            } catch (e) { console.warn('Erro ao rolar para a próxima aula:', e); }
        } else {
            exibirMensagem('Resposta registrada. Resposta incorreta — para desbloquear a próxima aula, responda corretamente.', 'erro');
        }
    });

    try {
        if (container._autosubmitHandler) container.removeEventListener('change', container._autosubmitHandler);
        let timer = null;
        const debounceMs = 600;
        const handler = (ev) => {
            const target = ev.target;
            if (!target || !target.matches || !target.matches('input[type="radio"]')) return;
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                clone.click();
            }, debounceMs);
        };
        container.addEventListener('change', handler);
        container._autosubmitHandler = handler;
    } catch (e) {
        console.warn('Não foi possível anexar autosubmit ao questionário', e);
    }
}

// prepareAulaIframes: Salva o 'src' dos iframes e o remove para evitar carregamento precoce.
function prepareAulaIframes() {
    document.querySelectorAll('.aula-container').forEach(section => {
        const iframe = section.querySelector('iframe');
        if (!iframe) return;
        if (!section.dataset.savedSrc) section.dataset.savedSrc = toSafeSrc(iframe.getAttribute('src') || '');
        iframe.removeAttribute('src');
        iframe.style.display = 'none';
    });
}

// Ponto de entrada principal: Inicialização quando o DOM está pronto.
document.addEventListener('DOMContentLoaded', function() {
    prepareAulaIframes();
    verificarAutenticacao();
    try { seedMockComments(); } catch (e) { /* silencioso */ }
    
    const modoSalvo = obterDoLocalStorage('modoEscuro', false);
    aplicarModoEscuro(modoSalvo);
    inicializarEventListeners();

    const path = window.location.pathname.split('/').pop();
    if (path === 'cursos.html') carregarCursos();
    if (path === 'aula.html') carregarAula();
    if (path === 'perfil.html') carregarPerfil();
});

// IIFE setupMobileNav: Configura o menu de navegação mobile (botão, toggle).
(function setupMobileNav() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const nav = document.querySelector('nav');
            if (!nav) return;

            if (!document.querySelector('.nav-toggle')) {
                const btn = document.createElement('button');
                btn.className = 'nav-toggle';
                btn.setAttribute('aria-label', 'Abrir menu');
                btn.innerHTML = '☰ Menu';
                const userActions = nav.querySelector('.user-actions');
                nav.insertBefore(btn, userActions);

                const menu = nav.querySelector('.nav-menu');
                btn.addEventListener('click', () => {
                    if (!menu) return;
                    const expanded = menu.classList.toggle('show');
                    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                    if (expanded) {
                        const firstLink = menu.querySelector('a');
                        if (firstLink) firstLink.focus();
                    } else {
                        btn.focus();
                    }
                });

                menu?.querySelectorAll('a').forEach(a => {
                    a.addEventListener('click', () => {
                        menu.classList.remove('show');
                        btn.setAttribute('aria-expanded', 'false');
                    });
                });

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

// IIFE setupSidebarDrawer: Configura a gaveta lateral (sidebar) para mobile.
(function setupSidebarDrawer() {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const sidebar = document.querySelector('.sidebar');
            const modulos = document.querySelector('.modulos-aulas');
            if (!sidebar || !modulos) return; 

            let overlay = document.querySelector('.sidebar-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
            }

            let toggle = null;

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

            if (!sidebar.id) sidebar.id = 'sidebar';

            function openSidebar() {
                sidebar.classList.add('show');
                overlay.classList.add('show');
                const triggerBtn = document.querySelector('.sidebar-open-btn');
                if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
                const firstLink = sidebar.querySelector('a');
                if (firstLink) firstLink.focus();
            }

            function closeSidebar() {
                sidebar.classList.remove('show');
                overlay.classList.remove('show');
                const triggerBtn = document.querySelector('.sidebar-open-btn');
                if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
                const triggerBtn2 = document.querySelector('.sidebar-open-btn');
                if (triggerBtn2) triggerBtn2.focus();
            }

            overlay.addEventListener('click', closeSidebar);

            sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
                setTimeout(closeSidebar, 100);
            }));

            document.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') closeSidebar();
            });

            window.addEventListener('resize', () => {
                if (window.innerWidth > 900) {
                    sidebar.classList.remove('show');
                    overlay.classList.remove('show');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                }
            });

        } catch (e) {
            console.warn('Erro ao configurar sidebar drawer', e);
        }
    });
})();

// Objeto global para depuração rápida via console.
window._codeclass = {
    SAMPLE_COURSES,
    salvarNoLocalStorage,
    obterDoLocalStorage,
    limparLocalStorage,
    fazerLogin,
    fazerLogout
};

// =====================
// BLOQUEIO / DESBLOQUEIO DE AULAS (por quiz)
// =====================

// getUnlockKey: Retorna a chave de localStorage para os desbloqueios do usuário/curso atual.
function getUnlockKey() {
    const user = estadoApp.usuario ? estadoApp.usuario.username : 'visitante';
    const cursoId = estadoApp.cursoAtual ? estadoApp.cursoAtual.id : 'semCurso';
    return `unlocks_${user}_${cursoId}`;
}

// setLessonUnlocked: Marca uma aula específica como desbloqueada no localStorage.
function setLessonUnlocked(aulaId) {
    try {
        const key = getUnlockKey();
        const data = obterDoLocalStorage(key, {});
        data[aulaId] = true;
        salvarNoLocalStorage(key, data);
    } catch (e) { console.error(e); }
}

// isLessonUnlocked: Verifica se uma aula está explicitamente marcada como desbloqueada (a primeira aula é sempre livre).
function isLessonUnlocked(aulaId) {
    if (!estadoApp.cursoAtual) return false;
    const lessons = estadoApp.cursoAtual.lessons || [];
    if (lessons.length && lessons[0].id === aulaId) return true;
    const key = getUnlockKey();
    const data = obterDoLocalStorage(key, {});
    return !!data[aulaId];
}

// isLessonUnlockedDerived: Verifica se a aula está desbloqueada (explicitamente ou pela resposta correta da aula anterior).
function isLessonUnlockedDerived(aulaId) {
    if (isLessonUnlocked(aulaId)) return true;
    if (!estadoApp.cursoAtual) return false;
    const lessons = estadoApp.cursoAtual.lessons || [];
    const idx = lessons.findIndex(l => l.id === aulaId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    
    const prev = lessons[idx - 1];
    const username = estadoApp.usuario ? estadoApp.usuario.username : CONFIG.SAMPLE_USER;
    const chavePrev = `resposta_${username}_${prev.id}`;
    const respPrev = obterDoLocalStorage(chavePrev, null);
    if (respPrev && respPrev.correta) return true;
    return false;
}

// unlockNextLesson: Desbloqueia a próxima aula após uma resposta correta e atualiza a UI.
function unlockNextLesson(currentAulaId) {
    if (!estadoApp.cursoAtual) return;
    const lessons = estadoApp.cursoAtual.lessons || [];
    const idx = lessons.findIndex(l => l.id === currentAulaId);
    if (idx === -1) return;
    const next = lessons[idx + 1];
    if (!next) return;
    setLessonUnlocked(next.id);
    
    let link = document.querySelector(`.lista-modulos a[data-aula-id="${next.id}"]`);
    if (!link) link = document.querySelector(`.lista-modulos a[href="#${next.id}"]`);
    
    if (link) {
        link.classList.remove('locked');
        link.removeAttribute('aria-disabled');
        link.href = `#${next.id}`;
        const li = link.closest('li');
        if (li) li.classList.remove('locked');
    } else {
        const listaMod = document.querySelector('.lista-modulos ul');
        if (listaMod) {
            carregarAula();
        }
    }
    
    try { carregarAula(); } catch (e) { /* silencioso */ }

    try {
        if (next) {
            const iframeEl = document.querySelector(`iframe#${next.id}`);
            const section = iframeEl ? iframeEl.closest('.aula-container') : document.getElementById(next.id)?.closest?.('.aula-container');
            if (section) {
                const savedSrc = section.dataset.savedSrc || (iframeEl && iframeEl.getAttribute('src'));
                        if (oldIframe && savedSrc) {
                    const currentSrc = oldIframe.getAttribute('src') || '';
                    if (!currentSrc || currentSrc !== savedSrc) {
                        const clone = oldIframe.cloneNode(true);
                        clone.setAttribute('src', toSafeSrc(savedSrc));
                        oldIframe.parentNode.replaceChild(clone, oldIframe);
                        clone.style.display = 'block';
                    }
                }
            }
        }
    } catch (e) {
        console.warn('Não foi possível forçar reload do iframe da próxima aula', e);
    }
}

// isAnswerCorrect: Verifica se a resposta fornecida para uma aula está correta, comparando com o gabarito.
function isAnswerCorrect(aulaId, resposta) {
    if (!estadoApp.cursoAtual) return false;
    const lesson = estadoApp.cursoAtual.lessons.find(l => l.id === aulaId);
    if (!lesson) return false;
    if (lesson.correctAnswer) return lesson.correctAnswer === resposta;
    return false;
}