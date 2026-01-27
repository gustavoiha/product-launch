<template>
  <section class="panel">
    <div class="panel-heading">
      <p class="app-eyebrow">{{ waitlistStore.waitlistConfig.productName }}</p>
      <h2>{{ waitlistStore.waitlistConfig.title }}</h2>
      <p class="panel-subtitle">{{ waitlistStore.waitlistConfig.description }}</p>
    </div>
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
import WaitlistFieldInput from '../components/WaitlistFieldInput.vue';
import { useWaitlistStore } from '../state/waitlist';

const waitlistStore = useWaitlistStore();

const submitPublicJoin = (): void => {
  waitlistStore.submitPublicJoin();
};

const resetPublicJoin = (): void => {
  waitlistStore.resetPublicJoin();
};
</script>
