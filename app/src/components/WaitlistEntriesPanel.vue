<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>Waitlist entries</h2>
      <p class="panel-subtitle">See who has joined your waitlist.</p>
    </div>
    <div v-if="waitlistStore.waitlistEntries.value.length === 0" class="empty-state">
      <p>No one has joined yet.</p>
    </div>
    <ul v-else class="entry-list">
      <li
        v-for="entry in waitlistStore.waitlistEntries.value"
        :key="entry.id"
        class="entry-item"
      >
        <div class="entry-header">
          <strong>{{ entry.values.primary }}</strong>
          <span class="entry-date">{{ entry.joinedAt }}</span>
        </div>
        <dl class="entry-values">
          <div v-for="detail in entry.details" :key="detail.label" class="entry-detail">
            <dt>{{ detail.label }}</dt>
            <dd>{{ detail.value }}</dd>
          </div>
        </dl>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useWaitlistStore } from '../state/waitlist';

const waitlistStore = useWaitlistStore();
</script>
