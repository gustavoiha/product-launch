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

const handleLogout = (): void => {
  authenticationStore.logout();
};
</script>
