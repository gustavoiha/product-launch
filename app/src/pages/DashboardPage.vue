<template>
  <div class="dashboard-grid">
    <AccountSummaryPanel />
    <div v-if="loadError" class="panel">
      <p class="error">{{ loadError }}</p>
    </div>
    <ProductRegistrationPanel />
    <ShareableUrlPanel />
    <WaitlistEntriesPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import AccountSummaryPanel from '../components/AccountSummaryPanel.vue';
import ProductRegistrationPanel from '../components/ProductRegistrationPanel.vue';
import ShareableUrlPanel from '../components/ShareableUrlPanel.vue';
import WaitlistEntriesPanel from '../components/WaitlistEntriesPanel.vue';
import { useWaitlistStore } from '../state/waitlist';

const waitlistStore = useWaitlistStore();
const loadError = ref('');

onMounted(async (): Promise<void> => {
  try {
    await waitlistStore.loadOwnerWaitlist();
    await waitlistStore.loadWaitlistEntries();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to load data.';
    console.error('Failed to load dashboard data:', errorMessage);
    loadError.value = 'Unable to load waitlist data right now.';
  }
});
</script>
