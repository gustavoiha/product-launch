<template>
  <section class="panel">
    <div class="panel-heading">
      <h2>Product registration</h2>
      <p class="panel-subtitle">
        Register your product and configure the waitlist details.
      </p>
    </div>
    <form class="stack" @submit.prevent="saveWaitlist">
      <div class="form-row">
        <label for="product-name">Product name</label>
        <input
          id="product-name"
          v-model="waitlistStore.waitlistConfig.productName"
          type="text"
          placeholder="Aurora Analytics"
          required
        />
      </div>
      <div class="form-row">
        <label for="waitlist-title">Waitlist title</label>
        <input
          id="waitlist-title"
          v-model="waitlistStore.waitlistConfig.title"
          type="text"
          placeholder="Join the Aurora beta"
          required
        />
      </div>
      <div class="form-row">
        <label for="waitlist-description">Waitlist description</label>
        <textarea
          id="waitlist-description"
          v-model="waitlistStore.waitlistConfig.description"
          rows="3"
          placeholder="Tell people why they should sign up."
        ></textarea>
      </div>
      <div class="form-row">
        <label for="waitlist-active">Waitlist URL active</label>
        <div class="toggle-row">
          <input
            id="waitlist-active"
            v-model="waitlistStore.waitlistConfig.isActive"
            type="checkbox"
          />
          <span>
            {{ waitlistStore.waitlistConfig.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
      </div>

      <fieldset class="fieldset">
        <legend>Waitlist form fields</legend>
        <WaitlistFieldList
          v-if="waitlistStore.waitlistFields.value.length"
          :fields="waitlistStore.waitlistFields.value"
          @remove="removeField"
        />

        <div class="field-add">
          <div class="form-row">
            <label for="field-label">Field label</label>
            <input
              id="field-label"
              v-model="newFieldLabel"
              type="text"
              placeholder="Company name"
            />
          </div>
          <div class="form-row">
            <label for="field-type">Field type</label>
            <select id="field-type" v-model="newFieldType">
              <option value="email">Email</option>
              <option value="text">Text</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
          <p v-if="fieldError" class="error">{{ fieldError }}</p>
          <button type="button" class="secondary" @click="addField">
            Add field
          </button>
        </div>
      </fieldset>

      <fieldset class="fieldset">
        <legend>Confirmation page</legend>
        <div class="form-row">
          <label for="confirmation-title">Confirmation title</label>
          <input
            id="confirmation-title"
            v-model="waitlistStore.waitlistConfig.confirmationTitle"
            type="text"
            placeholder="You're on the list"
            required
          />
        </div>
        <div class="form-row">
          <label for="confirmation-description">Confirmation description</label>
          <textarea
            id="confirmation-description"
            v-model="waitlistStore.waitlistConfig.confirmationDescription"
            rows="3"
            placeholder="Let them know what happens next."
          ></textarea>
        </div>
      </fieldset>

      <button class="primary" type="submit">Save waitlist</button>
      <p v-if="waitlistStore.waitlistSaved.value" class="success">
        Waitlist saved.
      </p>
      <p v-if="saveError" class="error">{{ saveError }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import WaitlistFieldList from './WaitlistFieldList.vue';
import { useWaitlistStore, type WaitlistFieldType } from '../state/waitlist';

const waitlistStore = useWaitlistStore();
const newFieldLabel = ref('');
const newFieldType = ref<WaitlistFieldType>('text');
const fieldError = ref('');
const saveError = ref('');

const addField = (): void => {
  fieldError.value = '';
  const added = waitlistStore.addField(newFieldLabel.value, newFieldType.value);
  if (!added) {
    fieldError.value = 'Field label is required.';
    return;
  }
  newFieldLabel.value = '';
  newFieldType.value = 'text';
};

const removeField = (fieldId: string): void => {
  waitlistStore.removeField(fieldId);
};

const saveWaitlist = async (): Promise<void> => {
  saveError.value = '';
  try {
    await waitlistStore.saveWaitlist();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unable to save.';
    console.error('Failed to save waitlist:', errorMessage);
    saveError.value = 'Unable to save waitlist right now.';
  }
};
</script>
