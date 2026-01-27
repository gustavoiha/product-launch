<template>
  <section class="panel">
    <div class="panel-heading">
      <p class="app-eyebrow">{{ waitlistStore.waitlistConfig.productName }}</p>
      <h2>{{ waitlistStore.waitlistConfig.title }}</h2>
      <p class="panel-subtitle">{{ waitlistStore.waitlistConfig.description }}</p>
    </div>
    <p v-if="loadError" class="error">{{ loadError }}</p>
    <div v-if="!waitlistStore.waitlistConfig.isActive" class="notice">
      <strong>This waitlist is currently inactive.</strong>
      <p>Please check back later.</p>
    </div>
    <div v-else>
      <div v-if="waitlistStore.publicJoinCompleted.value" class="confirmation">
        <h3>{{ waitlistStore.waitlistConfig.confirmationTitle }}</h3>
        <p>{{ waitlistStore.waitlistConfig.confirmationDescription }}</p>
        <button class="primary" type="button" @click="resetPublicJoin">
          Add another response
        </button>
      </div>
      <form v-else class="stack" @submit.prevent="submitPublicJoin">
        <WaitlistFieldInput
          v-for="field in waitlistStore.waitlistFields.value"
          :key="field.id"
          v-model="waitlistStore.publicFormValues[field.id]"
          :field="field"
        />
        <button class="primary" type="submit">Join waitlist</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import WaitlistFieldInput from '../components/WaitlistFieldInput.vue';
import { useWaitlistStore } from '../state/waitlist';

const waitlistStore = useWaitlistStore();
const route = useRoute();
const loadError = ref('');

onMounted(async (): Promise<void> => {
  const slugParam = route.params.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  if (!slug) {
    loadError.value = 'This waitlist link is invalid.';
    return;
  }

  try {
    await waitlistStore.loadWaitlistBySlug(slug);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to load waitlist.';
    console.error('Failed to load waitlist:', errorMessage);
    loadError.value = 'Unable to load this waitlist right now.';
  }
});

const submitPublicJoin = async (): Promise<void> => {
  try {
    await waitlistStore.submitPublicJoin();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to submit entry.';
    console.error('Failed to submit entry:', errorMessage);
    loadError.value = 'Unable to submit your entry right now.';
  }
};

const resetPublicJoin = (): void => {
  waitlistStore.resetPublicJoin();
};
</script>
