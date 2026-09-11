/**
 * QUINZOWORK - Autenticação Supabase Real
 * 
 * Sistema completo de autenticação com Supabase Auth
 * Email e Senha
 */

// ============================================
// ESTADO GLOBAL
// ============================================

let currentUser = null;
let isAuthenticated = false;
let isLoading = false;

// ============================================
// INICIALIZAÇÃO SUPABASE
// ============================================

/**
 * Inicializa o cliente Supabase
 * Requer que supabase-js esteja disponível globalmente
 */
async function initSupabase() {
  try {
    // Aguardar que o script do Supabase seja carregado
    if (typeof window.supabase === 'undefined') {
      console.warn('[Auth] Supabase JS não carregado. Usando modo demo.');
      return null;
    }

    const { createClient } = window.supabase;
    
    const supabaseUrl = 'https://your-project.supabase.co'; // Será substituído por variável de ambiente
    const supabaseKey = 'your-anon-key'; // Será substituído por variável de ambiente

    // Em produção, usar variáveis de ambiente
    // const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co') {
      console.warn('[Auth] Credenciais Supabase não configuradas. Configure .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
      return null;
    }

    const client = createClient(supabaseUrl, supabaseKey);
    return client;
  } catch (error) {
    console.error('[Auth Error] Falha ao inicializar Supabase:', error.message);
    return null;
  }
}

let supabaseClient = null;

/**
 * Obtém cliente Supabase
 */
async function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = await initSupabase();
  }
  return supabaseClient;
}

// ============================================
// FUNÇÕES DE AUTENTICAÇÃO
// ============================================

/**
 * Registra novo usuário com email e senha
 * @param {string} email
 * @param {string} password
 */
async function handleRegister(email, password) {
  if (!email || !password) {
    showErrorMessage('Por favor, preencha email e senha.');
    return;
  }

  if (password.length < 6) {
    showErrorMessage('Senha deve ter no mínimo 6 caracteres.');
    return;
  }

  setLoading(true);
  hideAllMessages();

  try {
    const supabase = await getSupabase();
    
    if (!supabase) {
      showErrorMessage('Supabase não configurado. Configure variáveis de ambiente.');
      setLoading(false);
      return;
    }

    // Criar usuário
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error('[Register Error]', error);
      showErrorMessage(`Erro ao cadastrar: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.user) {
      showSuccessMessage(
        'Cadastro realizado! Verifique seu email para confirmar a conta.'
      );
      
      // Limpar formulário
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      
      // Voltar para login após 3 segundos
      setTimeout(() => {
        switchToLoginMode();
      }, 3000);
    }
  } catch (error) {
    console.error('[Register Exception]', error);
    showErrorMessage('Erro ao processar cadastro. Tente novamente.');
  } finally {
    setLoading(false);
  }
}

/**
 * Faz login com email e senha
 * @param {string} email
 * @param {string} password
 */
async function handleLogin(email, password) {
  if (!email || !password) {
    showErrorMessage('Por favor, preencha email e senha.');
    return;
  }

  setLoading(true);
  hideAllMessages();

  try {
    const supabase = await getSupabase();
    
    if (!supabase) {
      showErrorMessage('Supabase não configurado. Configure variáveis de ambiente.');
      setLoading(false);
      return;
    }

    // Fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error('[Login Error]', error);
      showErrorMessage(`Erro ao entrar: ${error.message}`);
      setLoading(false);
      return;
    }

    if (data.user) {
      currentUser = data.user;
      isAuthenticated = true;
      
      showSuccessMessage(`Bem-vindo, ${data.user.email}!`);
      
      // Limpar formulário
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
      
      // Atualizar interface
      updateAuthUI();
      
      // Ir para dashboard após 1.5 segundos
      setTimeout(() => {
        navigate('dashboard');
      }, 1500);
    }
  } catch (error) {
    console.error('[Login Exception]', error);
    showErrorMessage('Erro ao processar login. Tente novamente.');
  } finally {
    setLoading(false);
  }
}

/**
 * Faz logout
 */
async function handleLogout() {
  setLoading(true);
  hideAllMessages();

  try {
    const supabase = await getSupabase();
    
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Logout Error]', error);
        showErrorMessage(`Erro ao sair: ${error.message}`);
        setLoading(false);
        return;
      }
    }

    // Limpar estado
    currentUser = null;
    isAuthenticated = false;
    
    showSuccessMessage('Você saiu com sucesso.');
    
    // Atualizar interface
    updateAuthUI();
    
    // Voltar para home após 1.5 segundos
    setTimeout(() => {
      navigate('home');
    }, 1500);
  } catch (error) {
    console.error('[Logout Exception]', error);
    showErrorMessage('Erro ao processar logout. Tente novamente.');
  } finally {
    setLoading(false);
  }
}

/**
 * Verifica sessão atual e restaura estado
 */
async function checkSession() {
  try {
    const supabase = await getSupabase();
    
    if (!supabase) {
      console.log('[Auth] Modo demo: Supabase não configurado');
      return;
    }

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('[Session Error]', error);
      return;
    }

    if (data.session && data.session.user) {
      currentUser = data.session.user;
      isAuthenticated = true;
      updateAuthUI();
      console.log('[Auth] Sessão restaurada para:', data.session.user.email);
    } else {
      currentUser = null;
      isAuthenticated = false;
      updateAuthUI();
    }
  } catch (error) {
    console.error('[Session Exception]', error);
  }
}

/**
 * Escuta mudanças de autenticação em tempo real
 */
function setupAuthListener() {
  try {
    const supabase = window.supabase;
    
    if (!supabase || typeof supabase.createClient === 'undefined') {
      console.log('[Auth Listener] Supabase não disponível');
      return;
    }

    // Listener será configurado após Supabase estar pronto
    // supabase.auth.onAuthStateChanged((session) => {
    //   if (session && session.user) {
    //     currentUser = session.user;
    //     isAuthenticated = true;
    //   } else {
    //     currentUser = null;
    //     isAuthenticated = false;
    //   }
    //   updateAuthUI();
    // });
  } catch (error) {
    console.error('[Auth Listener Error]', error);
  }
}

// ============================================
// INTERFACE E ESTADOS
// ============================================

/**
 * Atualiza interface baseado no estado de autenticação
 */
function updateAuthUI() {
  const authBox = document.getElementById('auth-box');
  const dashboard = document.getElementById('dashboard');
  const userEmail = document.getElementById('user-email');
  const userWelcome = document.getElementById('user-welcome');

  if (isAuthenticated && currentUser) {
    // Usuário autenticado
    if (authBox) authBox.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    if (userEmail) userEmail.textContent = currentUser.email;
    if (userWelcome) userWelcome.textContent = `Bem-vindo, ${currentUser.email}!`;
  } else {
    // Usuário não autenticado
    if (authBox) authBox.style.display = 'block';
    if (dashboard) dashboard.style.display = 'none';
  }
}

/**
 * Define estado de carregamento
 */
function setLoading(loading) {
  isLoading = loading;
  const buttons = document.querySelectorAll('#auth-box button, .auth-buttons button');
  const inputs = document.querySelectorAll('#auth-box input');
  
  buttons.forEach(btn => {
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
  });
  
  inputs.forEach(input => {
    input.disabled = loading;
  });
}

/**
 * Mostra mensagem de erro
 */
function showErrorMessage(message) {
  hideAllMessages();
  const errorDiv = document.getElementById('auth-error') || createMessageDiv('auth-error', 'error');
  errorDiv.textContent = '❌ ' + message;
  errorDiv.style.display = 'block';
}

/**
 * Mostra mensagem de sucesso
 */
function showSuccessMessage(message) {
  hideAllMessages();
  const successDiv = document.getElementById('auth-success') || createMessageDiv('auth-success', 'success');
  successDiv.textContent = '✅ ' + message;
  successDiv.style.display = 'block';
}

/**
 * Cria elemento de mensagem
 */
function createMessageDiv(id, type) {
  const div = document.createElement('div');
  div.id = id;
  div.className = `auth-message auth-message-${type}`;
  div.style.display = 'none';
  
  const authBox = document.getElementById('auth-box');
  if (authBox) {
    authBox.insertBefore(div, authBox.firstChild.nextSibling);
  }
  
  return div;
}

/**
 * Esconde todas as mensagens
 */
function hideAllMessages() {
  const messages = document.querySelectorAll('.auth-message');
  messages.forEach(msg => msg.style.display = 'none');
}

/**
 * Alterna para modo de login
 */
function switchToLoginMode() {
  const registerMode = document.getElementById('register-mode');
  const loginMode = document.getElementById('login-mode');
  
  if (registerMode) registerMode.style.display = 'none';
  if (loginMode) loginMode.style.display = 'block';
  
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  hideAllMessages();
}

/**
 * Alterna para modo de registro
 */
function switchToRegisterMode() {
  const registerMode = document.getElementById('register-mode');
  const loginMode = document.getElementById('login-mode');
  
  if (registerMode) registerMode.style.display = 'block';
  if (loginMode) loginMode.style.display = 'none';
  
  document.getElementById('email').value = '';
  document.getElementById('password').value = '';
  hideAllMessages();
}

// ============================================
// NAVEGAÇÃO
// ============================================

/**
 * Navega entre páginas
 */
function navigate(pageId) {
  // Proteger áreas autenticadas
  if (['dashboard'].includes(pageId) && !isAuthenticated) {
    showErrorMessage('Você precisa estar autenticado para acessar esta área.');
    navigate('auth');
    return;
  }

  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
  console.log('[App] QUINZOWORK inicializado');
  
  // Inicializar Supabase
  await initSupabase();
  
  // Verificar sessão existente
  await checkSession();
  
  // Configurar listener de autenticação
  setupAuthListener();
  
  // Atualizar interface
  updateAuthUI();
  
  // Adicionar listeners aos botões
  setupAuthHandlers();
});

/**
 * Configura handlers de autenticação
 */
function setupAuthHandlers() {
  // Botão Login
  const loginBtn = document.querySelector('.auth-buttons button:nth-child(1)');
  if (loginBtn) {
    loginBtn.addEventListener('click', function() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      handleLogin(email, password);
    });
  }

  // Botão Register
  const registerBtn = document.querySelector('.auth-buttons button:nth-child(2)');
  if (registerBtn) {
    registerBtn.addEventListener('click', function() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      handleRegister(email, password);
    });
  }

  // Botão Logout
  const logoutBtn = document.querySelector('.dashboard button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  // Enter key para login
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput && passwordInput) {
    passwordInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleLogin(emailInput.value, passwordInput.value);
      }
    });
  }
}

// ============================================
// EXPORTS
// ============================================

// Expor funções para uso global
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.navigate = navigate;
window.checkSession = checkSession;
window.switchToLoginMode = switchToLoginMode;
window.switchToRegisterMode = switchToRegisterMode;
