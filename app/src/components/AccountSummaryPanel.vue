<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>Account</h2>
      <p class="panel-subtitle">You are signed in and ready to manage waitlists.</p>
    </div>
    <div class="account-summary">
      <p>
        Signed in as <strong>{{ authenticationStore.state.email }}</strong>
      </p>
      <button type="button" class="ghost" @click="handleLogout">
        Log out
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAuthenticationStore } from '../state/authentication';

const authenticationStore = useAuthenticationStore();

const handleLogout = async (): Promise<void> => {
  try {
    await authenticationStore.logout();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to log out.';
    console.error('Logout failed:', errorMessage);
  }
};
</script>
