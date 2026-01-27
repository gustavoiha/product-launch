<template>
  <div class="dashboard-grid">
    <AccountSummaryPanel />
    <ProductRegistrationPanel />
    <ShareableUrlPanel />
    <WaitlistEntriesPanel />
  </div>
</template>

<script setup lang="ts">
import AccountSummaryPanel from '../components/AccountSummaryPanel.vue';
import ProductRegistrationPanel from '../components/ProductRegistrationPanel.vue';
import ShareableUrlPanel from '../components/ShareableUrlPanel.vue';
import WaitlistEntriesPanel from '../components/WaitlistEntriesPanel.vue';
</script>
