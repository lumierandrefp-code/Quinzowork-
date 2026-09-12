function navigate(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

const products = [
  { id: 1, name: 'Serviço de Desenvolvimento Web', price: '2500,00', desc: 'Criação de site completo responsivo.' },
  { id: 2, name: 'Plano Mensal Suporte & Gestão', price: '350,00', desc: 'Manutenção e atualização contínua.' },
  { id: 3, name: 'Consultoria Técnica Digital', price: '150,00', desc: 'Atendimento e orientação de projetos.' }
];
let cartCount = 0;
const ROLE_LABELS = { freelancer: 'Freelancer', job_seeker: 'Job Seeker', remote_worker: 'Remote Worker', creator: 'Creator', business: 'Business' };
const SUPABASE_URL = 'https://qazdbifnosykdgjufjtc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IYc8bf1pe2wNG7o4l-Q97Q_hm5-vEBx';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
let currentProfile = null;

function loadProducts() {
  const container = document.getElementById('products-list');
  if (!container) return;
  container.innerHTML = products.map(p => `<div class="card"><h3>${p.name}</h3><p class="product-desc">${p.desc}</p><p class="product-price">KZ ${p.price}</p><button class="btn-primary" onclick="addToCart()">Adicionar ao Carrinho</button></div>`).join('');
}
function addToCart() { cartCount++; document.getElementById('cart-count').innerText = cartCount; }
function checkout() { alert(cartCount > 0 ? 'Pedido iniciado! Redirecionando...' : 'Seu carrinho está vazio.'); }
function showAuthMessage(message, isError = false) { const el = document.getElementById('auth-message'); el.innerText = message; el.className = isError ? 'auth-message error' : 'auth-message'; }
function showProfileMessage(message, isError = false) { const el = document.getElementById('profile-message'); el.innerText = message; el.className = isError ? 'auth-message error' : 'auth-message success'; }

function updateAuthInterface(session) {
  currentUser = session?.user || null;
  document.getElementById('auth-box').style.display = currentUser ? 'none' : 'block';
  document.getElementById('dashboard').style.display = currentUser ? 'block' : 'none';
  if (!currentUser) { currentProfile = null; cancelEditingProfile(); return; }
  document.getElementById('user-welcome').innerText = currentUser.email || 'Conta autenticada';
  loadProfile(currentUser);
}

async function loadProfile(user) {
  const { data, error } = await supabaseClient.from('profiles').select('id, full_name, avatar_url, role, created_at, updated_at').eq('id', user.id).maybeSingle();
  if (error) { showProfileMessage('Não foi possível carregar o perfil. Execute a migration SQL no Supabase.', true); return; }
  currentProfile = data;
  renderProfile(user, data);
}
function renderProfile(user, profile) {
  const fallbackName = user.user_metadata?.full_name || user.user_metadata?.name || '';
  document.getElementById('profile-name').innerText = profile?.full_name || fallbackName || 'Ainda não preenchido';
  document.getElementById('profile-role').innerText = ROLE_LABELS[profile?.role] || 'Ainda não definido';
  const isIncomplete = !profile?.full_name || !profile?.role;
  if (isIncomplete) startEditingProfile(); else cancelEditingProfile();
}
function startEditingProfile() {
  if (!currentUser) return;
  document.getElementById('full-name').value = currentProfile?.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '';
  document.getElementById('role').value = currentProfile?.role || '';
  document.getElementById('profile-view').style.display = 'none';
  document.getElementById('profile-form').style.display = 'flex';
}
function cancelEditingProfile() { const view = document.getElementById('profile-view'); const form = document.getElementById('profile-form'); if (view) view.style.display = 'flex'; if (form) form.style.display = 'none'; }
async function saveProfile(event) {
  event.preventDefault();
  if (!currentUser) return;
  const fullName = document.getElementById('full-name').value.trim();
  const role = document.getElementById('role').value;
  if (!fullName || !ROLE_LABELS[role]) { showProfileMessage('Preencha o nome e selecione um tipo válido.', true); return; }
  const button = document.getElementById('save-profile-button'); button.disabled = true; button.innerText = 'Salvando...';
  const { data, error } = await supabaseClient.from('profiles').upsert({ id: currentUser.id, full_name: fullName, role, updated_at: new Date().toISOString() }, { onConflict: 'id' }).select().single();
  button.disabled = false; button.innerText = 'Salvar Perfil';
  if (error) { showProfileMessage('Não foi possível salvar o perfil. Verifique as políticas RLS.', true); return; }
  currentProfile = data; renderProfile(currentUser, data); showProfileMessage('Perfil atualizado com sucesso.');
}
async function login() { const email = document.getElementById('email').value.trim(); const password = document.getElementById('password').value; if (!email || !password) return showAuthMessage('Preencha o e-mail e a senha para entrar.', true); const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) showAuthMessage(error.message, true); }
async function loginWithGoogle() { const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); if (error) showAuthMessage(error.message, true); }
async function register() { const email = document.getElementById('email').value.trim(); const password = document.getElementById('password').value; if (!email || !password) return showAuthMessage('Preencha o e-mail e a senha para se cadastrar.', true); const { data, error } = await supabaseClient.auth.signUp({ email, password }); if (error) showAuthMessage(error.message, true); else if (!data.session) showAuthMessage('Cadastro realizado. Confirme seu e-mail para ativar a conta.'); }
async function logout() { const { error } = await supabaseClient.auth.signOut(); if (error) showAuthMessage(error.message, true); else { currentUser = null; updateAuthInterface(null); showAuthMessage('Sessão encerrada.'); } }
async function initializeAuth() { const { data, error } = await supabaseClient.auth.getSession(); if (error) { showAuthMessage(error.message, true); updateAuthInterface(null); return; } updateAuthInterface(data.session); supabaseClient.auth.onAuthStateChange((_event, session) => updateAuthInterface(session)); }
document.addEventListener('DOMContentLoaded', () => { loadProducts(); initializeAuth(); });
window.navigate = navigate; window.addToCart = addToCart; window.checkout = checkout; window.login = login; window.loginWithGoogle = loginWithGoogle; window.register = register; window.logout = logout; window.startEditingProfile = startEditingProfile; window.cancelEditingProfile = cancelEditingProfile; window.saveProfile = saveProfile;
