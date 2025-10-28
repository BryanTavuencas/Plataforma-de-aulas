# Plataforma de Aulas

## 📋 Descrição do Projeto

Esqueleto de uma plataforma de aulas online desenvolvida com HTML, CSS e JavaScript puro (sem uso de APIs externas).

## 🗂️ Estrutura do Projeto

```
Plataforma de aulas-web/
│
├── styles.css          # Arquivo de estilos CSS
├── functions.js        # Arquivo de funções JavaScript
│
├── index.html          # Página inicial (Home)
├── cursos.html         # Página de listagem de cursos
├── aula.html           # Página de visualização de aula
├── perfil.html         # Página de perfil do usuário
│
├── Assets/             # Pasta de recursos (imagens, vídeos, etc)
│   ├── images/         # Imagens
│   ├── videos/         # Vídeos
│   └── icons/          # Ícones
│
└── README.md           # Este arquivo
```

## 📄 Páginas

### 1. **index.html** - Página Inicial
- Banner principal (hero)
- Cursos em destaque
- Categorias de cursos
- Header com navegação
- Footer

### 2. **cursos.html** - Lista de Cursos
- Sistema de filtros e busca
- Grid de cards de cursos
- Paginação
- Categorias e níveis

### 3. **aula.html** - Visualização de Aula
- Player de vídeo/conteúdo
- Informações da aula
- Sidebar com módulos e progresso
- Seção de comentários
- Recursos e materiais

### 4. **perfil.html** - Perfil do Usuário
- Informações do usuário
- Tabs (Meus Cursos, Certificados, Configurações)
- Estatísticas de aprendizado
- Cursos em andamento

## 🎨 Arquivos do Projeto

### CSS (`styles.css`)
- Contém variáveis, reset global, estilos por componente e media queries para responsividade.

### JavaScript (`functions.js`)
- Contém a lógica de renderização dinâmica de cards, filtros de busca, listeners e utilitários.

### HTML (páginas)
- `index.html`, `cursos.html`, `aula.html`, `perfil.html` — estruturas e placeholders para conteúdo e navegação.

### Assets
- Pasta `Assets/` com `images/`, `videos/` e `icons/` para armazenar recursos usados pelo projeto.

## 🚀 Como Usar

1. **Abrir o projeto:**
   - Abra o arquivo `index.html` em um navegador web

2. **Navegação:**
   - Use os links do menu para navegar entre as páginas

3. **Desenvolvimento:**
   - Implemente os estilos no `styles.css`
   - Adicione funcionalidades no `functions.js`
   - Adicione conteúdo nas seções marcadas com comentários HTML

## ✅ Status do Projeto (resumo das tarefas principais)

### Tarefas de projeto
- [x] Planejar estrutura do projeto — Estrutura de páginas e pastas criada. (Responsável: Gustavo / revisão: Bryan)
- [x] Atualizar `index.html` — Página inicial preenchida com esqueleto e navegação. (Responsável: Gustavo)
- [x] Criar `cursos.html`, `aula.html`, `perfil.html` — Páginas criadas com estrutura básica e marcadores. (Responsável: Gustavo)
- [x] Padronizar `styles.css` e `functions.js` — Arquivos principais com organização inicial, variáveis e utilitários básicos. (Responsável: João para CSS, Bryan para JS)
- [x] Adicionar `README.md` e `Assets/` — README atualizado (este) e pasta de assets criada. (Responsável: Gustavo)
- [x] Verificação rápida e correção de sintaxe — Erros de CSS corrigidos (chaves/propriedades) e validação local. (Responsável: João)
- [x] Resolver erro de `git pull` (develop) — Orientações e commit feito; branch sincronizado localmente. (Responsável: Bryan)
- [x] Ajustar responsividade para zoom reduzido — Regras CSS adicionadas visando zoom/out extremo e viewports amplos. (Responsável: Bryan)
- [x] Aumentar legibilidade em zoom 25% — Media queries e ajustes de font-size aplicados para manter legibilidade. (Responsável: Bryan)
- [~~] ~~Melhorar espaçamento do card de curso~~ ~~CANCELADO~~ — Em vez de uma reforma visual completa dos cards, aplicamos ajustes menores: adicionamos imagens nos cards, fizemos pequenos ajustes de padding e tornamos o layout responsivo. (Decisão: não aplicar refatoração completa nesta etapa) (Responsável proposto: João)
- [x] Inserir imagem e meta no card de curso — Imagens de cursos adicionadas em `Assets/images/` e integradas nos cards; meta (nível/autor) presente no HTML. (Responsável: Gustavo)

### Estado dos Assets
- [x] Imagens de cursos adicionadas: `Linguagem Java.png`, `Linguagem Javascript.png`, `Linguagem Python.png`, `Linguagem-C.png`, `MachineLearning.png`. (Responsável: Gustavo)
- [ ] Logo da plataforma ainda pendente (pode ser fornecida para inclusão). (Sugestão: João pode aplicar styling quando logo disponível.)

### JavaScript (funcionalidades já implementadas)
- [x] Lógica de renderização dinâmica de cards e filtros básicos (buscar + filtro por nível) — Implementado em `functions.js`. (Responsável: Bryan)
- [x] Botão de limpeza de filtros trocado por um ícone (lixeira) e comportamento ajustado — Implementado. (Responsável: Bryan)

### Observações sobre o que ficou pendente / cancelado
- ~~CANCELADO: Implementação completa de refatoração do espaçamento dos cards~~ — Em lugar disso foi feita a correção de sintaxe no CSS e melhoria pontual na responsividade e inclusão de imagens. Se desejar, podemos reabrir essa tarefa e refatorar os cards (criar componentes e padronizar espaçamento). (Proposta: tarefa futura para João)

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura das páginas
- **CSS3** - Estilização e layout
- **JavaScript** - Interatividade e funcionalidades

## 📌 Observações

- Este é um **esqueleto** do projeto
- Todas as seções estão marcadas com comentários para facilitar a implementação
- Não há uso de frameworks ou bibliotecas externas
- Não há integração com APIs
- Dados devem ser armazenados localmente (localStorage)

## 👥 Equipe

Este esqueleto foi criado para facilitar o desenvolvimento colaborativo. Cada membro da equipe pode escolher uma área para implementar.

---

**Última atualização:** Outubro 2025
