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
let skillsSelectorOpen = false;

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
let profileFormSkills = [];
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

function showAdminPlatformMessage(message, isError = false) {
  const element = document.getElementById('admin-platform-message');
  element.innerText = message;
  element.className = isError ? 'admin-users-message error' : 'admin-users-message';
}

function renderAdminPlatformStatus(status) {
  const checks = [
    ['admin-platform-authentication', status.authentication_status],
    ['admin-platform-database', status.database_status],
    ['admin-platform-api', status.admin_api_status]
  ];

  checks.forEach(([id, value]) => {
    const element = document.getElementById(id);
    const operational = value === 'Operacional';
    element.innerText = operational ? 'Operacional' : 'Problema detectado';
    element.className = `admin-platform-status ${operational ? 'operational' : 'problem'}`;
  });

  document.getElementById('admin-platform-users').innerText = String(Number(status.total_users) || 0);
  document.getElementById('admin-platform-profiles').innerText = String(Number(status.total_profiles) || 0);
  document.getElementById('admin-platform-checked').innerText = formatAdminDateTime(status.checked_at);
}

async function loadAdminPlatformStatus() {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    document.getElementById('admin-platform-view').hidden = true;
    return;
  }

  const refreshButton = document.getElementById('admin-platform-refresh');
  const loading = document.getElementById('admin-platform-loading');
  refreshButton.disabled = true;
  loading.hidden = false;
  showAdminPlatformMessage('');

  const { data, error } = await supabaseClient.rpc('admin_platform_status');
  refreshButton.disabled = false;
  loading.hidden = true;

  if (error) {
    showAdminPlatformMessage(`Não foi possível verificar a plataforma: ${error.message}`, true);
    return;
  }

  const status = Array.isArray(data) ? data[0] : data;
  if (!status) {
    showAdminPlatformMessage('Nenhum estado da plataforma foi retornado.', true);
    return;
  }

  renderAdminPlatformStatus(status);
  showAdminPlatformMessage('Verificação concluída com segurança.');
}

function openAdminPlatform() {
  document.getElementById('admin-platform-view').hidden = false;
  loadAdminPlatformStatus();
}

function showAdminDashboardMessage(message, isError = false) {
  const element = document.getElementById('admin-dashboard-message');
  element.innerText = message;
  element.className = isError ? 'admin-users-message error' : 'admin-users-message';
}

function formatAdminDateTime(value) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Não informado' : date.toLocaleString('pt-BR');
}

function renderAdminDashboard(stats) {
  const values = {
    'total-users': stats.total_users,
    'total-profiles': stats.total_profiles,
    freelancers: stats.freelancers,
    'job-seekers': stats.job_seekers,
    'remote-workers': stats.remote_workers,
    creators: stats.creators,
    businesses: stats.businesses,
    'recent-users': stats.recent_users
  };
  Object.entries(values).forEach(([id, value]) => {
    document.getElementById(`admin-stat-${id}`).innerText = String(Number(value) || 0);
  });
}

async function loadAdminDashboard() {
  const allowed = await checkAdminAccess();
  if (!allowed) {
    document.getElementById('admin-dashboard-view').hidden = true;
    return;
  }

  const refreshButton = document.getElementById('admin-dashboard-refresh');
  const loading = document.getElementById('admin-dashboard-loading');
  refreshButton.disabled = true;
  loading.hidden = false;
  showAdminDashboardMessage('');

  const { data, error } = await supabaseClient.rpc('admin_dashboard_stats');
  refreshButton.disabled = false;
  loading.hidden = true;

  if (error) {
    showAdminDashboardMessage(`Não foi possível carregar o dashboard: ${error.message}`, true);
    return;
  }

  const stats = Array.isArray(data) ? data[0] : data;
  if (!stats) {
    showAdminDashboardMessage('Nenhum dado administrativo encontrado.', true);
    return;
  }

  renderAdminDashboard(stats);
  document.getElementById('admin-dashboard-updated').innerText = `Última atualização: ${formatAdminDateTime(new Date())}`;
  showAdminDashboardMessage('Dados administrativos carregados com segurança.');
}

function openAdminDashboard() {
  document.getElementById('admin-dashboard-view').hidden = false;
  loadAdminDashboard();
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
  const profile = currentProfile || {};
  document.getElementById('profile-name').innerText = profile.full_name || metadataName || 'Ainda não informado';
  document.getElementById('profile-role').innerText = ROLE_LABELS[profile.role] || 'Ainda não informado';
  document.getElementById('profile-display-title').innerText = profile.professional_title || 'Ainda não informado';
  document.getElementById('profile-display-location').innerText = profile.location || 'Ainda não informado';
  document.getElementById('profile-display-bio').innerText = profile.bio || 'Ainda não informado';
  document.getElementById('profile-display-experience').innerText = profile.experience || 'Ainda não informado';
  document.getElementById('profile-display-education').innerText = profile.education || 'Ainda não informado';
  document.getElementById('profile-display-availability').innerText = profile.availability || 'Ainda não informado';
  document.getElementById('profile-display-hourly-rate').innerText = profile.hourly_rate === null || profile.hourly_rate === undefined || profile.hourly_rate === '' ? 'Ainda não informado' : `KZ ${profile.hourly_rate}/hora`;
  document.getElementById('profile-display-phone').innerText = profile.phone || 'Ainda não informado';
  document.getElementById('profile-display-website').innerText = profile.website_url || 'Ainda não informado';
  document.getElementById('profile-display-linkedin').innerText = profile.linkedin_url || 'Ainda não informado';
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  document.getElementById('profile-display-skills').innerText = skills.length ? skills.join(' · ') : 'Ainda não informado';
  const avatar = document.getElementById('profile-avatar');
  avatar.hidden = !profile.avatar_url;
  if (profile.avatar_url) avatar.src = profile.avatar_url;
}

function setProfileForm(profile) {
  const metadataName = currentSession?.user?.user_metadata?.full_name || currentSession?.user?.user_metadata?.name || '';
  document.getElementById('profile-full-name').value = profile?.full_name || metadataName;
  document.getElementById('profile-role-select').value = profile?.role || '';
  const professionalTitleSelect = document.getElementById('profile-professional-title');
  const existingTitle = profile?.professional_title || '';
  if (existingTitle && !Array.from(professionalTitleSelect.options).some(option => option.value === existingTitle)) {
    const legacyOption = new Option(`${existingTitle} (atual)`, existingTitle);
    professionalTitleSelect.insertBefore(legacyOption, professionalTitleSelect.options[1]);
  }
  professionalTitleSelect.value = existingTitle;
  document.getElementById('profile-bio').value = profile?.bio || '';
  document.getElementById('profile-location').value = profile?.location || '';
  document.getElementById('profile-phone').value = profile?.phone || '';
  document.getElementById('profile-website-url').value = profile?.website_url || '';
  document.getElementById('profile-linkedin-url').value = profile?.linkedin_url || '';
  document.getElementById('profile-experience').value = profile?.experience || '';
  document.getElementById('profile-education').value = profile?.education || '';
  document.getElementById('profile-availability').value = profile?.availability || '';
  document.getElementById('profile-hourly-rate').value = profile?.hourly_rate ?? '';
  profileFormSkills = Array.isArray(profile?.skills) ? [...profile.skills] : [];
  renderProfileSkills(profileFormSkills);
}

const PROFILE_TITLE_SKILLS = {
  'Desenvolvedor Web': ['Desenvolvimento Web', 'HTML/CSS', 'JavaScript', 'React', 'Next.js', 'Node.js', 'TypeScript', 'APIs', 'SQL', 'WordPress'],
  'Desenvolvedor Front-end': ['HTML/CSS', 'JavaScript', 'React', 'Next.js', 'TypeScript', 'UI/UX Design'],
  'Desenvolvedor Back-end': ['Node.js', 'Python', 'PHP', 'Java', 'APIs', 'SQL', 'Banco de Dados'],
  'Desenvolvedor Full Stack': ['Desenvolvimento Full Stack', 'JavaScript', 'React', 'Node.js', 'SQL', 'APIs', 'Next.js'],
  'Desenvolvedor Mobile': ['Desenvolvimento Mobile', 'Flutter', 'React Native', 'Android', 'iOS', 'Java', 'Kotlin'],
  'Designer Gráfico': ['Design Gráfico', 'Canva', 'Photoshop', 'Illustrator', 'Figma', 'Branding'],
  'UI/UX Designer': ['UI/UX Design', 'Figma', 'Web Design', 'Prototipagem', 'Design de Interfaces', 'Pesquisa de Usuário'],
  'Web Designer': ['Web Design', 'HTML/CSS', 'UI/UX Design', 'WordPress', 'Figma', 'Canva'],
  'Editor de Vídeo': ['Edição de Vídeo', 'CapCut', 'Premiere Pro', 'After Effects', 'Motion Design'],
  'Criador de Conteúdo': ['Criação de Conteúdo', 'Redes Sociais', 'TikTok', 'YouTube', 'Storytelling', 'Edição de Vídeo'],
  'Social Media Manager': ['Social Media', 'Redes Sociais', 'Marketing Digital', 'Criação de Conteúdo', 'Copywriting', 'SEO'],
  'Especialista em Marketing Digital': ['Marketing Digital', 'SEO', 'Google Ads', 'Facebook Ads', 'Redes Sociais', 'Copywriting'],
  'Especialista em SEO': ['SEO', 'Marketing de Conteúdo', 'Google Analytics', 'Pesquisa de Palavras-chave', 'Copywriting'],
  Copywriter: ['Copywriting', 'Redação', 'Marketing de Conteúdo', 'Storytelling', 'Email Marketing'],
  Tradutor: ['Tradução', 'Português', 'Inglês', 'Francês', 'Espanhol', 'Interpretação'],
  'Assistente Virtual': ['Assistência Virtual', 'Assistência Administrativa', 'Atendimento ao Cliente', 'Digitação', 'Organização de Documentos', 'Entrada de Dados'],
  'Assistente Administrativo': ['Assistência Administrativa', 'Administração', 'Digitação', 'Excel', 'Organização de Documentos', 'Atendimento ao Cliente'],
  'Atendente ao Cliente': ['Atendimento ao Cliente', 'Comunicação', 'Vendas', 'Negociação', 'Assistência Virtual'],
  Recepcionista: ['Recepção', 'Atendimento ao Cliente', 'Comunicação', 'Administração', 'Organização de Documentos'],
  Vendedor: ['Vendas', 'Atendimento ao Cliente', 'Negociação', 'Marketing Digital', 'Comunicação'],
  'Consultor de Negócios': ['Consultoria', 'Gestão de Negócios', 'Estratégia', 'Vendas', 'Negociação'],
  'Gestor de Projetos': ['Gestão de Projetos', 'Gestão de Negócios', 'Liderança', 'Organização', 'Comunicação'],
  Contabilista: ['Contabilidade', 'Finanças', 'Excel', 'Administração', 'Gestão de Negócios'],
  'Técnico de Informática': ['Suporte Técnico', 'Redes de Computadores', 'Hardware', 'Software', 'Cibersegurança'],
  'Analista de Dados': ['Análise de Dados', 'SQL', 'Excel', 'Python', 'Banco de Dados'],
  'Profissional de Recursos Humanos': ['Recursos Humanos', 'Recrutamento', 'Gestão de Pessoas', 'Administração', 'Comunicação'],
  Recrutador: ['Recrutamento', 'Recursos Humanos', 'Entrevistas', 'Comunicação', 'Gestão de Pessoas'],
  Professor: ['Ensino', 'Tutoria', 'Formação Profissional', 'Matemática', 'Língua Portuguesa', 'Língua Inglesa'],
  Tutor: ['Ensino', 'Tutoria', 'Formação Profissional', 'Matemática', 'Língua Portuguesa', 'Língua Inglesa']
};

const PROFILE_SKILL_CATEGORIES = {
  'Tecnologia': ['Desenvolvimento Web', 'Desenvolvimento Front-end', 'Desenvolvimento Back-end', 'Desenvolvimento Full Stack', 'Desenvolvimento Mobile', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Python', 'PHP', 'Java', 'C#', 'SQL', 'Banco de Dados', 'APIs', 'WordPress', 'Suporte Técnico', 'Redes de Computadores', 'Cibersegurança'],
  'Design': ['Design Gráfico', 'UI/UX Design', 'Web Design', 'Canva', 'Photoshop', 'Illustrator', 'Figma', 'Edição de Vídeo', 'Animação', 'Fotografia'],
  'Marketing': ['Marketing Digital', 'Marketing de Conteúdo', 'Redes Sociais', 'Social Media', 'SEO', 'Google Ads', 'Facebook Ads', 'Copywriting', 'Email Marketing', 'Branding'],
  'Negócios': ['Vendas', 'Atendimento ao Cliente', 'Negociação', 'Gestão de Projetos', 'Gestão de Negócios', 'Consultoria', 'Empreendedorismo', 'Recursos Humanos', 'Recrutamento', 'Administração'],
  'Serviços': ['Assistência Virtual', 'Assistência Administrativa', 'Recepção', 'Digitação', 'Pesquisa Online', 'Entrada de Dados', 'Transcrição', 'Organização de Documentos'],
  'Idiomas': ['Português', 'Inglês', 'Francês', 'Espanhol', 'Tradução', 'Interpretação'],
  'Educação': ['Ensino', 'Tutoria', 'Formação Profissional', 'Matemática', 'Ciências', 'Língua Portuguesa', 'Língua Inglesa'],
  'Criatividade e Conteúdo': ['Criação de Conteúdo', 'Redação', 'Blog', 'Roteiros', 'YouTube', 'TikTok', 'Podcast', 'Storytelling']
};

function allProfileSkills() {
  const title = document.getElementById('profile-professional-title')?.value || '';
  const relevant = PROFILE_TITLE_SKILLS[title] || [];
  const general = Object.entries(PROFILE_SKILL_CATEGORIES).flatMap(([category, skills]) => skills.map(skill => ({ category, skill })));
  const ordered = [...relevant.map(skill => ({ category: 'Sugestões para o seu título', skill })), ...general];
  const seen = new Set();
  return ordered.filter(item => {
    const key = item.skill.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderProfileSkills(skills) {
  const container = document.getElementById('profile-skills-editor');
  const empty = document.getElementById('profile-skills-empty');
  container.innerHTML = skills.map((skill, index) => `<span class="skill-chip">${escapeHtml(skill)}<button type="button" aria-label="Remover ${escapeHtml(skill)}" onclick="removeProfileSkill(${index})">×</button></span>`).join('');
  empty.hidden = skills.length > 0;
  renderSkillOptions();
}

function renderSkillOptions(query = '') {
  const container = document.getElementById('profile-skill-options');
  if (!container) return;
  const normalizedQuery = query.trim().toLowerCase();
  const selected = new Set(profileFormSkills.map(skill => skill.toLowerCase()));
  const matches = allProfileSkills().filter(({ skill }) => !normalizedQuery || skill.toLowerCase().includes(normalizedQuery));
  const categories = [...new Set(matches.map(item => item.category))];
  const groups = categories.map(category => {
    const options = matches.filter(item => item.category === category);
    if (!options.length) return '';
    return `<div class="skill-category"><h5>${category}</h5>${options.map(({ skill }) => `<button type="button" class="skill-option ${selected.has(skill.toLowerCase()) ? 'selected' : ''}" onclick="toggleProfileSkill('${skill.replace(/'/g, "\\'")}')"><span>${escapeHtml(skill)}</span><span aria-hidden="true">${selected.has(skill.toLowerCase()) ? '✓' : '+'}</span></button>`).join('')}</div>`;
  }).join('');
  container.innerHTML = groups || '<p class="form-hint">Nenhuma competência encontrada.</p>';
}

function filterSkillOptions() {
  renderSkillOptions(document.getElementById('profile-skill-search').value);
}

function updateSkillsSelectorUI() {
  const picker = document.getElementById('profile-skills-picker');
  if (!picker) return;
  picker.hidden = !skillsSelectorOpen;
  picker.setAttribute('aria-hidden', String(!skillsSelectorOpen));
  picker.style.display = skillsSelectorOpen ? 'grid' : 'none';
}

function closeSkillsSelector() {
  skillsSelectorOpen = false;
  updateSkillsSelectorUI();
}

function toggleSkillsPicker(force) {
  skillsSelectorOpen = typeof force === 'boolean' ? force : !skillsSelectorOpen;
  updateSkillsSelectorUI();
  if (!skillsSelectorOpen) return;
  document.getElementById('profile-skill-search').value = '';
  renderSkillOptions();
  document.getElementById('profile-skill-search').focus();
}

function toggleProfileSkill(skill) {
  const index = profileFormSkills.findIndex(item => item.toLowerCase() === skill.toLowerCase());
  if (index >= 0) {
    profileFormSkills.splice(index, 1);
  } else if (profileFormSkills.length >= 5) {
    showProfileMessage('Limite de 5 competências atingido.', true);
    return;
  } else {
    profileFormSkills.push(skill);
  }
  renderProfileSkills(profileFormSkills);
  const query = document.getElementById('profile-skill-search')?.value || '';
  renderSkillOptions(query);
}

function addProfileSkill(event) {
  event.preventDefault();
  const input = document.getElementById('profile-skill-input');
  const skill = input.value.trim();
  if (!skill) return;
  const skills = [...profileFormSkills];
  const existing = skills.map(item => item.toLowerCase());
  if (!existing.includes(skill.toLowerCase())) skills.push(skill);
  profileFormSkills = skills;
  renderProfileSkills(profileFormSkills);
  input.value = '';
}

function removeProfileSkill(index) {
  profileFormSkills.splice(index, 1);
  renderProfileSkills(profileFormSkills);
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
    .select('id, full_name, avatar_url, role, bio, location, skills, experience, education, website_url, linkedin_url, phone, availability, hourly_rate, professional_title, created_at, updated_at')
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

async function toggleProfileEditor() {
  const form = document.getElementById('profile-form');
  const editing = form.hidden;
  if (!editing) {
    form.hidden = true;
    setProfileForm(currentProfile);
    showProfileMessage('');
    return;
  }

  form.hidden = false;
  showProfileMessage('Carregando perfil...');
  await loadProfile(currentSession);
  setProfileForm(currentProfile);
  showProfileMessage('');
}

function closeProfileEditor() {
  const form = document.getElementById('profile-form');
  form.hidden = true;
  closeSkillsSelector();
}

function cancelProfileEdit() {
  closeProfileEditor();
  setProfileForm(currentProfile);
  showProfileMessage('');
}

async function saveProfile(event) {
  event.preventDefault();
  if (!currentSession?.user) return;

  const fullName = document.getElementById('profile-full-name').value.trim();
  const role = document.getElementById('profile-role-select').value;
  const hourlyRateValue = document.getElementById('profile-hourly-rate').value.trim();
  const allowedRoles = ['freelancer', 'job_seeker', 'remote_worker', 'creator', 'business'];
  if (!fullName || !allowedRoles.includes(role)) {
    showProfileMessage('Informe o nome completo e o tipo de utilizador.', true);
    return;
  }
  if (hourlyRateValue && (!Number.isFinite(Number(hourlyRateValue)) || Number(hourlyRateValue) < 0)) {
    showProfileMessage('Informe um valor por hora válido e não negativo.', true);
    return;
  }

  const saveButton = document.getElementById('profile-save-button');
  saveButton.disabled = true;
  showProfileMessage('Salvando perfil...');
  const payload = {
    id: currentSession.user.id,
    full_name: fullName,
    role,
    professional_title: document.getElementById('profile-professional-title').value.trim() || null,
    bio: document.getElementById('profile-bio').value.trim() || null,
    location: document.getElementById('profile-location').value.trim() || null,
    phone: document.getElementById('profile-phone').value.trim() || null,
    website_url: document.getElementById('profile-website-url').value.trim() || null,
    linkedin_url: document.getElementById('profile-linkedin-url').value.trim() || null,
    experience: document.getElementById('profile-experience').value.trim() || null,
    education: document.getElementById('profile-education').value.trim() || null,
    availability: document.getElementById('profile-availability').value.trim() || null,
    hourly_rate: hourlyRateValue ? Number(hourlyRateValue) : null,
    skills: profileFormSkills
  };

  const { data, error } = await supabaseClient
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, full_name, avatar_url, role, bio, location, skills, experience, education, website_url, linkedin_url, phone, availability, hourly_rate, professional_title, created_at, updated_at')
    .single();

  saveButton.disabled = false;
  if (error) {
    showProfileMessage(error.message, true);
    return;
  }

  currentProfile = data;
  updateAuthInterface(currentSession);
  closeProfileEditor();
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
  document.getElementById('skills-done-button')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeSkillsSelector();
  });
  loadProducts();
  initializeAuth();
});
