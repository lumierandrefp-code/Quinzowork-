// Navegação entre abas
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Lista de Produtos do QUINZOWORK
const products = [
  { id: 1, name: 'Serviço de Desenvolvimento Web', price: '2500,00', desc: 'Criação de site completo responsivo.' },
  { id: 2, name: 'Plano Mensal Suporte & Gestão', price: '350,00', desc: 'Manutenção e atualização contínua.' },
  { id: 3, name: 'Consultoria Técnica Digital', price: '150,00', desc: 'Atendimento e orientação de projetos.' }
];

let cartCount = 0;

function loadProducts() {
  const container = document.getElementById('products-list');
  if (!container) return;
  container.innerHTML = products.map(p => `
    <div class="card">
      <h3>${p.name}</h3>
      <p style="margin: 6px 0 12px 0; color: #94a3b8; font-size: 0.88rem;">${p.desc}</p>
      <p style="font-weight: 800; color: #00f2fe; font-size: 1.1rem; margin-bottom: 12px;">KZ ${p.price}</p>
      <button class="btn-primary" onclick="addToCart()">Adicionar ao Carrinho</button>
    </div>
  `).join('');
}

function addToCart() {
  cartCount++;
  document.getElementById('cart-count').innerText = cartCount;
}

function checkout() {
  alert(cartCount > 0 ? 'Pedido iniciado! Redirecionando...' : 'Seu carrinho está vazio.');
}

// Autenticação (E-mail e Senha)
function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email && password) {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('user-welcome').innerText = `Bem-vindo, ${email}!`;
  } else {
    alert('Preencha o e-mail e a senha para entrar.');
  }
}

// Autenticação (Google)
function loginWithGoogle() {
  document.getElementById('auth-box').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('user-welcome').innerText = 'Conectado com sucesso via Conta Google!';
}

function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (email && password) {
    alert('Cadastro realizado com sucesso! Faça login para entrar.');
  } else {
    alert('Preencha os campos para se cadastrar.');
  }
}

function logout() {
  document.getElementById('auth-box').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadProducts);
