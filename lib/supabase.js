/**
 * QUINZOWORK - Supabase Client Configuration
 * 
 * Inicializa o cliente Supabase com credenciais do ambiente.
 * Nunca exponha service_role key no frontend.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validação de chaves
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    'ℹ️ Variáveis de ambiente Supabase não configuradas. ' +
    'Crie um arquivo .env na raiz do projeto com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY'
  );
}

/**
 * Instância do cliente Supabase
 * @type {SupabaseClient|null}
 */
let supabaseClient = null;

/**
 * Inicializa o cliente Supabase
 * @returns {SupabaseClient|null}
 */
function initializeSupabase() {
  // Verificar se já foi inicializado
  if (supabaseClient) {
    return supabaseClient;
  }

  // Sem credenciais, retorna null
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  try {
    // Esta será a implementação quando Supabase JS estiver disponível
    // supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[Supabase] Cliente será inicializado quando supabase-js for adicionado');
  } catch (error) {
    console.error('[Supabase Error]', error.message);
  }

  return supabaseClient;
}

/**
 * Obtém a instância do cliente Supabase
 * @returns {SupabaseClient|null}
 */
function getSupabaseClient() {
  return supabaseClient || initializeSupabase();
}

// Exportar para uso em módulos ES6
if (typeof window !== 'undefined') {
  window.initializeSupabase = initializeSupabase;
  window.getSupabaseClient = getSupabaseClient;
}
