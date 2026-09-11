# QUINZOWORK

> Plataforma integrada de serviços digitais, conectando freelancers, empresas, criadores e inovadores.

## 📋 O Que É QUINZOWORK?

QUINZOWORK é uma plataforma web all-in-one que integra múltiplos serviços para o ecossistema digital:

- **Freelancer Hub**: Gerencie seus projetos, propostas e ganhos como freelancer
- **Remote Jobs**: Encontre e aplique a vagas de trabalho remoto
- **AI Hub**: Acesso a ferramentas e automações inteligentes
- **Creator Hub**: Publique conteúdo, gerencie comunidade e monetize seu trabalho
- **Business Hub**: Publique vagas, contrate freelancers e gerencie equipes
- **Dark Video Studio**: Crie, edite e publique conteúdo de vídeo
- **Sistema de Créditos**: Moeda interna para transações na plataforma
- **Autenticação Integrada**: Login seguro e perfis de usuário

## 🛠️ Stack Utilizada

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design System**: Glassmorphism moderno com tema dark/light
- **Backend** (próximo passo): Supabase (PostGRES, Auth, Realtime)
- **Hospedagem**: Pronta para deploy (Vercel, Netlify, etc)

## 📦 Como Instalar

### Pré-requisitos

- Node.js 14+ (opcional, apenas para servir localmente)
- Git
- Um navegador moderno

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/lumierandrefp-code/Quinzowork-.git
cd Quinzowork-
```

### Passo 2: Criar Branch de Trabalho

```bash
git checkout -b refactor/mvp-base-structure
```

### Passo 3: Instalar Dependências (Opcional)

Se quiser usar um servidor HTTP local:

```bash
npm install
```

## 🚀 Como Executar Localmente

### Opção 1: Com HTTP Server

```bash
npm start
```

Abre em `http://localhost:8080`

### Opção 2: Sem Servidor (Arquivo Local)

Abra `index.html` diretamente no navegador:

```bash
open index.html
```

### Opção 3: Python Server

```bash
python -m http.server 8000
```

Acessa em `http://localhost:8000`

## 🔧 Variáveis de Ambiente

Atualmente, não há variáveis de ambiente necessárias.

**Quando integrar com Supabase (próximo passo)**, você precisará:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> ⚠️ **IMPORTANTE**: Estas não são necessárias nesta versão MVP base.

## 📊 Estado Atual do MVP

### ✅ Implementado

- [x] Estrutura HTML base com todas as seções do MVP
- [x] Sistema de navegação funcional
- [x] Design visual futurista preservado (dark theme + glassmorphism)
- [x] Preparação para integração de autenticação
- [x] Estrutura de dados documentada (JSDoc)
- [x] Componentes reutilizáveis (cards, botões, formulários)
- [x] Responsivo (mobile, tablet, desktop)

### 🔄 Em Preparação (Próximo Passo)

- [ ] Integração com Supabase Auth
- [ ] Database para usuários, freelancers, empresas
- [ ] API para vagas (Remote Jobs)
- [ ] Sistema de propostas
- [ ] Perfis de usuário
- [ ] Portfólio de freelancers
- [ ] Chat integrado
- [ ] Sistema de pagamentos (Stripe/Paystack)
- [ ] Dark Video Studio (editor básico)
- [ ] AI Hub (integração com APIs de IA)

### ❌ NÃO Implementado (Fora do Escopo MVP)

- Loja virtual de produtos
- Carrinho de compras
- Checkout com pagamento real
- Login fictício (removido)
- Autenticação Google (será real após Supabase)
- Avaliações de usuários
- Chat em tempo real
- Escrow de pagamento
- Social login

## 📁 Estrutura de Pastas

```
Quinzowork-/
├── index.html          # Estrutura HTML principal
├── app.js             # Lógica JavaScript (navegação, utilities)
├── style.css          # Estilos globais (design system)
├── package.json       # Metadados e dependências
├── README.md          # Este arquivo
├── .gitignore        # Arquivos ignorados pelo Git
├── docs/             # Documentação (futuro)
│   ├── API.md
│   ├── DATABASE.md
│   └── ARCHITECTURE.md
└── src/              # Será estrutura modular (futuro)
    ├── components/
    ├── modules/
    ├── utils/
    └── styles/
```

## 🔐 Segurança

- ✅ Sem dados fictícios de usuário
- ✅ Sem armazenamento de senhas em localStorage
- ✅ Preparado para HTTPS
- ✅ Pronto para integração com Supabase Auth
- ⚠️ Nesta versão, autenticação é apenas visual (placeholder)

## 📝 Próximos Passos

1. **Backend com Supabase**
   - Configurar projeto Supabase
   - Criar tabelas de banco de dados
   - Implementar autenticação real

2. **Integração Frontend-Backend**
   - Conectar app.js com Supabase
   - Adicionar estado global (Supabase Auth)
   - Implementar chamadas à API

3. **Funcionalidades do MVP**
   - Perfis de usuário (Freelancer, Company, Creator)
   - Dashboard personalizado por tipo de usuário
   - Remote Jobs listing e candidatura
   - Sistema de créditos

4. **Refinamentos**
   - Testes automatizados
   - Otimizações de performance
   - SEO
   - Analytics

## 💬 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit suas mudanças: `git commit -am 'Add nova feature'`
3. Push para a branch: `git push origin feature/sua-feature`
4. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou issues:
- Abra uma issue no GitHub
- Entre em contato com o time de desenvolvimento

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Última atualização**: Setembro 2024
**Versão**: 0.1.0 (MVP Base)
**Status**: Em desenvolvimento ativo
