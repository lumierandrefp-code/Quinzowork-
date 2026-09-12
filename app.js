// Navegação entre abas
async function navigate(pageId) {
  const targetPage = document.getElementById(pageId);
  if (!targetPage || !targetPage.classList.contains('page')) return;

  if (pageId === 'admin') {
    const allowed = await checkAdminAccess();
    document.getElementById('admin-panel').hidden = !allowed;
    document.getElementById('admin-denied').hidden = allowed;
    if (!allowed) {
      showAuthMessage('Você não tem permissão para acessar esta área.', true);
      pageId = 'sistema';
    }
  }

  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  targetPage.classList.add('active');

  document.querySelectorAll('.nav-links button').forEach(button => {
    button.setAttribute('aria-current', button.dataset.page === pageId ? 'page' : 'false');
  });
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

// Autenticação real com Supabase Auth.
const SUPABASE_URL = 'https://qazdbifnosykdgjufjtc.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IYc8bf1pe2wNG7o4l-Q97Q_hm5-vEBx';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

function showAuthMessage(message, isError = false) {
  const element = document.getElementById('auth-message');
  element.innerText = message;
  element.className = isError ? 'auth-message error' : 'auth-message';
}

const ROLE_LABELS = {
  freelancer: 'Freelancer',
  job_seeker: 'Job Seeker',
  remote_worker: 'Remote Worker',
  creator: 'Creator',
  business: 'Business'
};

let currentSession = null;
let currentProfile = null;
let isCurrentUserAdmin = false;

async function checkAdminAccess() {
  if (!currentSession?.user) {
    isCurrentUserAdmin = false;
    document.getElementById('admin-nav').hidden = true;
    return false;
  }

  const { data, error } = await supabaseClient.rpc('is_admin');
  isCurrentUserAdmin = !error && data === true;
  document.getElementById('admin-nav').hidden = !isCurrentUserAdmin;
  return isCurrentUserAdmin;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'\"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '\"': '&quot;'
  }[character]));
}

function formatAdminDate(value) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Não informado' : date.toLocaleDateString('pt-BR');
}

function showAdminUsersMessage(message, isError = false) {
  const element = document.getElementById('admin-users-message');
  element.innerText = message;
  element.className = isError ? 'admin-users-message error' : 'admin-users-message';
}

function renderAdminUsers(users) {
  const tbody = document.getElementById('admin-users-body');
  const emptyState = document.getElementById('admin-users-empty');
  const table = document.getElementById('admin-users-table');
  document.getElementById('admin-users-count').innerText = String(users.length);
  tbody.innerHTML = users.map(user => `
    <tr>
      <td data-label="Nome">${escapeHtml(user.full_name || 'Não informado')}</td>
      <td data-label="Email">${escapeHtml(user.email || 'Não informado')}</td>
      <td data-label="Tipo de utilizador">${escapeHtml(ROLE_LABELS[user.user_type] || 'Não informado')}</td>
      <td data-label="Data de criação">${escapeHtml(formatAdminDate(user.created_at))}</td>
      <td data-label="Estado"><span class="status-active">Ativo</span></td>
    </tr>
  `).join('');
  table.hidden = users.length === 0;
  emptyState.hidden = users.length !== 0;
}

async function loadAdminUsers() {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    document.getElementById('admin-users-view').hidden = true;
    return;
  }

  const refreshButton = document.getElementById('admin-users-refresh');
  const loading = document.getElementById('admin-users-loading');
  refreshButton.disabled = true;
  loading.hidden = false;
  showAdminUsersMessage('');

  const { data, error } = await supabaseClient.rpc('admin_list_users');
  refreshButton.disabled = false;
  loading.hidden = true;

  if (error) {
    renderAdminUsers([]);
    showAdminUsersMessage(`Não foi possível carregar os utilizadores: ${error.message}`, true);
    return;
  }

  renderAdminUsers(Array.isArray(data) ? data : []);
  showAdminUsersMessage('Utilizadores carregados com segurança.');
}

function openAdminUsers() {
  document.getElementById('admin-users-view').hidden = false;
  loadAdminUsers();
}

function showAdminProfilesMessage(message, isError = false) {
  const element = document.getElementById('admin-profiles-message');
  element.innerText = message;
  element.className = isError ? 'admin-users-message error' : 'admin-users-message';
}

function renderAdminProfiles(profiles) {
  const tbody = document.getElementById('admin-profiles-body');
  const emptyState = document.getElementById('admin-profiles-empty');
  const table = document.getElementById('admin-profiles-table');
  document.getElementById('admin-profiles-count').innerText = String(profiles.length);
  tbody.innerHTML = profiles.map(profile => `
    <tr>
      <td data-label="ID do utilizador"><code>${escapeHtml(profile.user_id || 'Não informado')}</code></td>
      <td data-label="Nome completo">${escapeHtml(profile.full_name || 'Não informado')}</td>
      <td data-label="Tipo de utilizador">${escapeHtml(ROLE_LABELS[profile.user_type] || 'Não informado')}</td>
      <td data-label="Avatar">${profile.avatar_url ? '<span class="status-active">Disponível</span>' : 'Não informado'}</td>
      <td data-label="Data de criação">${escapeHtml(formatAdminDate(profile.created_at))}</td>
      <td data-label="Última atualização">${escapeHtml(formatAdminDate(profile.updated_at))}</td>
    </tr>
  `).join('');
  table.hidden = profiles.length === 0;
  emptyState.hidden = profiles.length !== 0;
}

async function loadAdminProfiles() {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    document.getElementById('admin-profiles-view').hidden = true;
    return;
  }

  const refreshButton = document.getElementById('admin-profiles-refresh');
  const loading = document.getElementById('admin-profiles-loading');
  refreshButton.disabled = true;
  loading.hidden = false;
  showAdminProfilesMessage('');

  const { data, error } = await supabaseClient.rpc('admin_list_profiles');
  refreshButton.disabled = false;
  loading.hidden = true;

  if (error) {
    renderAdminProfiles([]);
    showAdminProfilesMessage(`Não foi possível carregar os perfis: ${error.message}`, true);
    return;
  }

  renderAdminProfiles(Array.isArray(data) ? data : []);
  showAdminProfilesMessage('Perfis carregados com segurança.');
}

function openAdminProfiles() {
  document.getElementById('admin-profiles-view').hidden = false;
  loadAdminProfiles();
}

function updateAuthInterface(session) {
  const isAuthenticated = Boolean(session?.user);
  currentSession = session;
  document.getElementById('auth-box').style.display = isAuthenticated ? 'none' : 'block';
  document.getElementById('dashboard').style.display = isAuthenticated ? 'block' : 'none';

  if (!isAuthenticated) {
    currentProfile = null;
    isCurrentUserAdmin = false;
    document.getElementById('admin-nav').hidden = true;
    document.getElementById('admin-panel').hidden = true;
    showAuthMessage('');
    return;
  }

  document.getElementById('profile-email').innerText = session.user.email || '';
  const metadataName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
  document.getElementById('profile-name').innerText = currentProfile?.full_name || metadataName || 'Ainda não informado';
  document.getElementById('profile-role').innerText = ROLE_LABELS[currentProfile?.role] || 'Ainda não informado';
}

function setProfileForm(profile) {
  document.getElementById('profile-full-name').value = profile?.full_name || currentSession?.user?.user_metadata?.full_name || currentSession?.user?.user_metadata?.name || '';
  document.getElementById('profile-role-select').value = profile?.role || '';
}

function showProfileMessage(message, isError = false) {
  const element = document.getElementById('profile-message');
  element.innerText = message;
  element.className = isError ? 'profile-message error' : 'profile-message';
}

async function loadProfile(session) {
  if (!session?.user) return;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('id, full_name, avatar_url, role, created_at, updated_at')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    currentProfile = null;
    showProfileMessage('Não foi possível carregar o perfil. Confirme se a tabela profiles foi criada no Supabase.', true);
  } else {
    currentProfile = data;
    setProfileForm(data);
  }
  updateAuthInterface(session);
}

function toggleProfileEditor() {
  const form = document.getElementById('profile-form');
  const editing = form.hidden;
  form.hidden = !editing;
  if (editing) setProfileForm(currentProfile);
  showProfileMessage('');
}

function cancelProfileEdit() {
  const form = document.getElementById('profile-form');
  form.hidden = true;
  setProfileForm(currentProfile);
  showProfileMessage('');
}

async function saveProfile(event) {
  event.preventDefault();
  if (!currentSession?.user) return;

  const fullName = document.getElementById('profile-full-name').value.trim();
  const role = document.getElementById('profile-role-select').value;
  if (!fullName || !role) {
    showProfileMessage('Informe o nome completo e o tipo de utilizador.', true);
    return;
  }

  const { data, error } = await supabaseClient
    .from('profiles')
    .upsert({ id: currentSession.user.id, full_name: fullName, role }, { onConflict: 'id' })
    .select('id, full_name, avatar_url, role, created_at, updated_at')
    .single();

  if (error) {
    showProfileMessage(error.message, true);
    return;
  }

  currentProfile = data;
  updateAuthInterface(currentSession);
  document.getElementById('profile-form').hidden = true;
  showProfileMessage('Perfil atualizado com sucesso.');
}

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAuthMessage('Preencha o e-mail e a senha para entrar.', true);
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) showAuthMessage(error.message, true);
}

async function loginWithGoogle() {
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  });

  if (error) showAuthMessage(error.message, true);
}

async function register() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showAuthMessage('Preencha o e-mail e a senha para se cadastrar.', true);
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    showAuthMessage(error.message, true);
  } else if (!data.session) {
    showAuthMessage('Cadastro realizado. Confirme seu e-mail para ativar a conta.');
  }
}

async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) showAuthMessage(error.message, true);
}

async function initializeAuth() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    showAuthMessage(error.message, true);
    updateAuthInterface(null);
    return;
  }

  updateAuthInterface(data.session);
  await loadProfile(data.session);
  await checkAdminAccess();
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    updateAuthInterface(session);
    if (session) {
      loadProfile(session).then(checkAdminAccess);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  initializeAuth();
});
