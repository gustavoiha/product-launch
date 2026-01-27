<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>Shareable URL</h2>
      <p class="panel-subtitle">
        Give this link to your audience so they can join the waitlist.
      </p>
    </div>
    <div class="share-row">
      <input type="text" :value="shareableUrl" readonly />
      <button class="secondary" type="button" @click="copyUrl">
        Copy URL
      </button>
    </div>
    <p v-if="waitlistStore.urlCopied.value" class="success">
      URL copied to clipboard.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWaitlistStore } from '../state/waitlist';

const waitlistStore = useWaitlistStore();

const getOrigin = (): string => {
  if (typeof window === 'undefined') {
    return 'https://example.com';
  }
  return window.location.origin;
};

const shareableUrl = computed<string>((): string => {
  return waitlistStore.getShareableUrl(getOrigin());
});

const copyUrl = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(shareableUrl.value);
    waitlistStore.setUrlCopied(true);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to copy URL:', errorMessage);
    waitlistStore.setUrlCopied(false);
  }
};
</script>
