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

  const googleLoginButton =
    document.querySelector(
      '[data-action="google-login"]'
    );

  if (googleLoginButton) {
    googleLoginButton.addEventListener(
      'click',
      async () => {
        const supabase = getSupabase();

        if (!supabase) {
          console.error(
            '[QUINZOWORK] Supabase não está configurado.'
          );
          return;
        }

        googleLoginButton.disabled = true;

        try {
          const { error } =
            await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo:
                  window.location.origin
              }
            });

          if (error) {
            console.error(
              '[QUINZOWORK] Google Login:',
              error
            );

            googleLoginButton.disabled = false;
          }
        } catch (error) {
          console.error(
            '[QUINZOWORK] Erro no Google Login:',
            error
          );

          googleLoginButton.disabled = false;
        }
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
