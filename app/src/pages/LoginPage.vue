<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>Account</h2>
      <p class="panel-subtitle">Log in to manage your product waitlist.</p>
    </div>
    <form class="stack" @submit.prevent="handleLogin">
      <div class="form-row">
        <label for="login-email">Email</label>
        <input
          id="login-email"
          v-model="loginForm.email"
          type="email"
          autocomplete="email"
          required
        />
      </div>
      <div class="form-row">
        <label for="login-password">Password</label>
        <input
          id="login-password"
          v-model="loginForm.password"
          type="password"
          autocomplete="current-password"
          required
        />
      </div>
      <button class="primary" type="submit">Log in</button>
    </form>
    <p v-if="loginError" class="error">{{ loginError }}</p>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '../state/authentication';

interface LoginForm {
  email: string;
  password: string;
}

const authenticationStore = useAuthenticationStore();
const router = useRouter();
const loginError = ref('');

const loginForm = reactive<LoginForm>({
  email: '',
  password: ''
});

const handleLogin = async (): Promise<void> => {
  loginError.value = '';
  try {
    await authenticationStore.login(loginForm.email, loginForm.password);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed.';
    console.error('Login failed:', errorMessage);
    loginError.value = 'Login failed. Check your credentials and try again.';
  }
};
</script>
