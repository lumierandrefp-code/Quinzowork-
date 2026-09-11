import { createClient } from '@supabase/supabase-js';

/**
 * QUINZOWORK
 * Autenticação real com Supabase
 *
 * Requer:
 * VITE_SUPABASE_URL
 * VITE_SUPABASE_ANON_KEY
 */

// =====================================================
// SUPABASE
// =====================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error(
    '[QUINZOWORK] Variáveis do Supabase não configuradas.'
  );
}

// =====================================================
// ESTADO
// =====================================================

let currentUser = null;
let isAuthenticated = false;
let isLoading = false;

// =====================================================
// UTILITÁRIOS
// =====================================================

function getElement(id) {
  return document.getElementById(id);
}

function setLoading(loading) {
  isLoading = loading;

  const buttons = document.querySelectorAll(
    '#auth-box button, .auth-buttons button'
  );

  const inputs = document.querySelectorAll(
    '#auth-box input'
  );

  buttons.forEach((button) => {
    button.disabled = loading;
    button.style.opacity = loading ? '0.6' : '1';
  });

  inputs.forEach((input) => {
    input.disabled = loading;
  });
}

function hideAllMessages() {
  document.querySelectorAll('.auth-message').forEach((message) => {
    message.style.display = 'none';
  });
}

function showMessage(message, type = 'error') {
  hideAllMessages();

  let element = getElement(
    type === 'error' ? 'auth-error' : 'auth-success'
  );

  if (!element) {
    element = document.createElement('div');

    element.id =
      type === 'error' ? 'auth-error' : 'auth-success';

    element.className = `auth-message auth-message-${type}`;

    const authBox = getElement('auth-box');

    if (authBox) {
      authBox.insertBefore(element, authBox.firstChild);
    }
  }

  element.textContent =
    type === 'error'
      ? `❌ ${message}`
      : `✅ ${message}`;

  element.style.display = 'block';
}

function showErrorMessage(message) {
  showMessage(message, 'error');
}

function showSuccessMessage(message) {
  showMessage(message, 'success');
}

// =====================================================
// SUPABASE
// =====================================================

function getSupabase() {
  if (!supabase) {
    showErrorMessage(
      'O sistema de autenticação ainda não está configurado. Configure as variáveis do Supabase.'
    );

    return null;
  }

  return supabase;
}

// =====================================================
// REGISTRO
// =====================================================

async function handleRegister(email, password) {
  email = email?.trim();

  if (!email || !password) {
    showErrorMessage(
      'Preencha o email e a senha.'
    );
    return;
  }

  if (password.length < 6) {
    showErrorMessage(
      'A senha deve ter pelo menos 6 caracteres.'
    );
    return;
  }

  const client = getSupabase();

  if (!client) {
    return;
  }

  setLoading(true);
  hideAllMessages();

  try {
    const {
      data,
      error
    } = await client.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('[QUINZOWORK] Erro no cadastro:', error);

      showErrorMessage(
        `Não foi possível criar a conta: ${error.message}`
      );

      return;
    }

    if (data.user) {
      if (data.session) {
        currentUser = data.user;
        isAuthenticated = true;

        showSuccessMessage(
          'Conta criada com sucesso.'
        );

        updateAuthUI();

        setTimeout(() => {
          navigate('dashboard');
        }, 800);
      } else {
        showSuccessMessage(
          'Conta criada. Verifique o seu email para confirmar a conta antes de entrar.'
        );

        switchToLoginMode();
      }
    }
  } catch (error) {
    console.error(
      '[QUINZOWORK] Exceção no cadastro:',
      error
    );

    showErrorMessage(
      'Ocorreu um erro ao criar a conta. Tente novamente.'
    );
  } finally {
    setLoading(false);
  }
}

// =====================================================
// LOGIN
// =====================================================

async function handleLogin(email, password) {
  email = email?.trim();

  if (!email || !password) {
    showErrorMessage(
      'Preencha o email e a senha.'
    );
    return;
  }

  const client = getSupabase();

  if (!client) {
    return;
  }

  setLoading(true);
  hideAllMessages();

  try {
    const {
      data,
      error
    } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('[QUINZOWORK] Erro no login:', error);

      showErrorMessage(
        `Não foi possível entrar: ${error.message}`
      );

      return;
    }

    if (data.user) {
      currentUser = data.user;
      isAuthenticated = true;

      showSuccessMessage(
        'Login realizado com sucesso.'
      );

      updateAuthUI();

      setTimeout(() => {
        navigate('dashboard');
      }, 500);
    }
  } catch (error) {
    console.error(
      '[QUINZOWORK] Exceção no login:',
      error
    );

    showErrorMessage(
      'Ocorreu um erro ao entrar. Tente novamente.'
    );
  } finally {
    setLoading(false);
  }
}

// =====================================================
// LOGOUT
// =====================================================

async function handleLogout() {
  const client = getSupabase();

  if (!client) {
    return;
  }

  setLoading(true);
  hideAllMessages();

  try {
    const { error } = await client.auth.signOut();

    if (error) {
      console.error(
        '[QUINZOWORK] Erro no logout:',
        error
      );

      showErrorMessage(
        `Não foi possível sair: ${error.message}`
      );

      return;
    }

    currentUser = null;
    isAuthenticated = false;

    updateAuthUI();

    showSuccessMessage(
      'Sessão encerrada com sucesso.'
    );

    setTimeout(() => {
      navigate('home');
    }, 500);
  } catch (error) {
    console.error(
      '[QUINZOWORK] Exceção no logout:',
      error
    );

    showErrorMessage(
      'Ocorreu um erro ao sair. Tente novamente.'
    );
  } finally {
    setLoading(false);
  }
}

// =====================================================
// SESSÃO
// =====================================================

async function checkSession() {
  const client = getSupabase();

  if (!client) {
    currentUser = null;
    isAuthenticated = false;
    updateAuthUI();
    return;
  }

  try {
    const {
      data,
      error
    } = await client.auth.getSession();

    if (error) {
      console.error(
        '[QUINZOWORK] Erro ao verificar sessão:',
        error
      );

      currentUser = null;
      isAuthenticated = false;

      updateAuthUI();

      return;
    }

    const session = data?.session;

    if (session?.user) {
      currentUser = session.user;
      isAuthenticated = true;

      console.log(
        '[QUINZOWORK] Sessão restaurada:',
        session.user.email
      );
    } else {
      currentUser = null;
      isAuthenticated = false;
    }

    updateAuthUI();
  } catch (error) {
    console.error(
      '[QUINZOWORK] Erro ao restaurar sessão:',
      error
    );

    currentUser = null;
    isAuthenticated = false;

    updateAuthUI();
  }
}

// =====================================================
// LISTENER DE AUTENTICAÇÃO
// =====================================================

function setupAuthListener() {
  if (!supabase) {
    return;
  }

  supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (session?.user) {
        currentUser = session.user;
        isAuthenticated = true;
      } else {
        currentUser = null;
        isAuthenticated = false;
      }

      updateAuthUI();
    }
  );
}

// =====================================================
// INTERFACE DE AUTENTICAÇÃO
// =====================================================

function updateAuthUI() {
  const authBox = getElement('auth-box');
  const dashboard = getElement('dashboard');
  const userEmail = getElement('user-email');
  const userWelcome = getElement('user-welcome');

  if (isAuthenticated && currentUser) {
    if (authBox) {
      authBox.style.display = 'none';
    }

    if (dashboard) {
      dashboard.style.display = 'block';
    }

    if (userEmail) {
      userEmail.textContent =
        currentUser.email || '';
    }

    if (userWelcome) {
      userWelcome.textContent =
        `Bem-vindo, ${currentUser.email}!`;
    }
  } else {
    if (authBox) {
      authBox.style.display = 'block';
    }

    if (dashboard) {
      dashboard.style.display = 'none';
    }
  }
}

// =====================================================
// MODO LOGIN / REGISTRO
// =====================================================

function switchToLoginMode() {
  const registerMode = getElement('register-mode');
  const loginMode = getElement('login-mode');

  if (registerMode) {
    registerMode.style.display = 'none';
  }

  if (loginMode) {
    loginMode.style.display = 'block';
  }

  hideAllMessages();
}

function switchToRegisterMode() {
  const registerMode = getElement('register-mode');
  const loginMode = getElement('login-mode');

  if (registerMode) {
    registerMode.style.display = 'block';
  }

  if (loginMode) {
    loginMode.style.display = 'none';
  }

  hideAllMessages();
}

// =====================================================
// NAVEGAÇÃO
// =====================================================

function navigate(pageId) {
  const protectedPages = [
    'dashboard'
  ];

  if (
    protectedPages.includes(pageId) &&
    !isAuthenticated
  ) {
    showErrorMessage(
      'É necessário iniciar sessão para acessar esta área.'
    );

    pageId = 'auth';
  }

  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove('active');
  });

  const targetPage = getElement(pageId);

  if (targetPage) {
    targetPage.classList.add('active');
  }
}

// =====================================================
// FORMULÁRIOS
// =====================================================

function setupAuthHandlers() {
  const loginForm = getElement('login-form');
  const registerForm = getElement('register-form');

  if (loginForm) {
    loginForm.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();

        const formData =
          new FormData(loginForm);

        const email =
          formData.get('email');

        const password =
          formData.get('password');

        await handleLogin(
          email,
          password
        );
      }
    );
  }

  if (registerForm) {
    registerForm.addEventListener(
      'submit',
      async (event) => {
        event.preventDefault();

        const formData =
          new FormData(registerForm);

        const email =
          formData.get('email');

        const password =
          formData.get('password');

        await handleRegister(
          email,
          password
        );
      }
    );
  }

  const logoutButtons =
    document.querySelectorAll(
      '[data-action="logout"]'
    );

  logoutButtons.forEach((button) => {
    button.addEventListener(
      'click',
      handleLogout
    );
  });
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function initializeApp() {
  console.log(
    '[QUINZOWORK] Aplicação iniciada.'
  );

  setupAuthHandlers();

  setupAuthListener();

  await checkSession();

  updateAuthUI();
}

// =====================================================
// DOM READY
// =====================================================

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initializeApp
  );
} else {
  initializeApp();
}

// =====================================================
// FUNÇÕES GLOBAIS
// Compatibilidade com o HTML atual
// =====================================================

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.switchToLoginMode = switchToLoginMode;
window.switchToRegisterMode = switchToRegisterMode;
window.navigate = navigate;
window.checkSession = checkSession;
