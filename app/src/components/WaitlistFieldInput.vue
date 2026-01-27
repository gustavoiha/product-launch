<template>
  <div class="form-row">
    <label :for="field.id">{{ field.label }}</label>
    <input
      v-if="field.type !== 'boolean'"
      :id="field.id"
      :type="field.type"
      :value="modelValue"
      :required="field.type === 'email'"
      :placeholder="placeholder"
      @input="handleTextInput"
    />
    <div v-else class="checkbox-row">
      <input
        :id="field.id"
        type="checkbox"
        :checked="Boolean(modelValue)"
        @change="handleToggle"
      />
      <span>{{ field.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WaitlistField, WaitlistFieldType } from '../state/waitlist';

interface WaitlistFieldInputProps {
  field: WaitlistField;
  modelValue: string | boolean;
}

interface WaitlistFieldInputEmits {
  (event: 'update:modelValue', value: string | boolean): void;
}

const props = defineProps<WaitlistFieldInputProps>();
const emit = defineEmits<WaitlistFieldInputEmits>();

const getFieldPlaceholder = (type: WaitlistFieldType): string => {
  if (type === 'email') {
    return 'you@example.com';
  }
  if (type === 'boolean') {
    return '';
  }
  return 'Enter text';
};

const placeholder = computed<string>((): string => {
  return getFieldPlaceholder(props.field.type);
});

const handleTextInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};

const handleToggle = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>
