<template>
  <header class="app-header">
    <div>
      <p class="app-eyebrow">Product Launch</p>
      <h1 class="app-title">Waitlist Manager</h1>
    </div>
    <nav class="app-nav" aria-label="Primary">
      <RouterLink class="nav-link" :to="{ name: 'dashboard' }">
        Dashboard
      </RouterLink>
      <RouterLink class="nav-link" :to="publicPath">
        Public Waitlist
      </RouterLink>
      <RouterLink
        v-if="!authenticationStore.state.isAuthenticated"
        class="nav-link ghost"
        :to="{ name: 'login' }"
      >
        Log in
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthenticationStore } from '../state/authentication';
import { useWaitlistStore } from '../state/waitlist';

const authenticationStore = useAuthenticationStore();
const waitlistStore = useWaitlistStore();

const publicPath = computed<string>((): string => {
  return `/public/${waitlistStore.waitlistSlug.value}`;
});
</script>
