// Configuração do Supabase (Insira suas chaves quando tiver)
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_KEY = 'SUA_CHAVE_ANON';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Navegação entre abas
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Lista Inicial de Produtos do QUINZOWORK
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
      <p style="margin: 5px 0; color: #666; font-size: 0.9rem;">${p.desc}</p>
      <p style="font-weight: bold; color: #0f3460;">KZ ${p.price}</p>
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

// Autenticação Supabase
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await _supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert('Cadastro realizado! Verifique seu e-mail.');
}

async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await _supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else {
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
  }
}

function logout() {
  _supabase.auth.signOut();
  document.getElementById('auth-box').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadProducts);
