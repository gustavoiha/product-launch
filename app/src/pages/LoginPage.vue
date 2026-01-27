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
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthenticationStore } from '../state/authentication';

interface LoginForm {
  email: string;
  password: string;
}

const authenticationStore = useAuthenticationStore();
const router = useRouter();

const loginForm = reactive<LoginForm>({
  email: '',
  password: ''
});

const handleLogin = async (): Promise<void> => {
  authenticationStore.login(loginForm.email, loginForm.password);
  await router.push({ name: 'dashboard' });
};
</script>
