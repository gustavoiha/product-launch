<template>
  <div class="field-list">
    <div v-for="field in fields" :key="field.id" class="field-item">
      <div>
        <p class="field-label">{{ field.label }}</p>
        <p class="field-type">Type: {{ field.type }}</p>
      </div>
      <button class="ghost" type="button" @click="emitRemove(field.id)">
        Remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WaitlistField } from '../state/waitlist';

interface WaitlistFieldListProps {
  fields: WaitlistField[];
}

interface WaitlistFieldListEmits {
  (event: 'remove', fieldId: string): void;
}

defineProps<WaitlistFieldListProps>();
const emit = defineEmits<WaitlistFieldListEmits>();

const emitRemove = (fieldId: string): void => {
  emit('remove', fieldId);
};
</script>
