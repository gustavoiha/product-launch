<template>
  <div class="app">
    <header class="app-header">
      <div>
        <p class="app-eyebrow">Product Launch</p>
        <h1 class="app-title">Waitlist Manager</h1>
      </div>
      <nav class="app-nav">
        <button
          class="nav-button"
          type="button"
          :class="{ active: currentView === NAVIGATION_VIEW_DASHBOARD }"
          @click="currentView = NAVIGATION_VIEW_DASHBOARD"
        >
          Dashboard
        </button>
        <button
          class="nav-button"
          type="button"
          :class="{ active: currentView === NAVIGATION_VIEW_PUBLIC }"
          @click="currentView = NAVIGATION_VIEW_PUBLIC"
        >
          Public Waitlist
        </button>
      </nav>
    </header>

    <main class="app-main">
      <section v-if="currentView === NAVIGATION_VIEW_PUBLIC" class="panel">
        <div class="panel-heading">
          <h2>Join the waitlist</h2>
          <p class="panel-subtitle">
            Share this page with your audience so they can sign up.
          </p>
        </div>
        <div v-if="!waitlistConfig.isActive" class="notice">
          <strong>This waitlist is currently inactive.</strong>
          <p>Please check back later.</p>
        </div>
        <div v-else>
          <div v-if="publicJoinCompleted" class="confirmation">
            <h3>{{ waitlistConfig.confirmationTitle }}</h3>
            <p>{{ waitlistConfig.confirmationDescription }}</p>
            <button class="primary" type="button" @click="resetPublicJoin">
              Add another response
            </button>
          </div>
          <form v-else class="stack" @submit.prevent="submitPublicJoin">
            <div
              v-for="field in waitlistFields"
              :key="field.id"
              class="form-row"
            >
              <label :for="field.id">{{ field.label }}</label>
              <input
                v-if="field.type !== 'boolean'"
                :id="field.id"
                v-model="publicFormValues[field.id]"
                :type="field.type"
                :required="field.type === 'email'"
                :placeholder="getFieldPlaceholder(field.type)"
              />
              <div v-else class="checkbox-row">
                <input
                  :id="field.id"
                  v-model="publicFormValues[field.id]"
                  type="checkbox"
                />
                <span>{{ field.label }}</span>
              </div>
            </div>
            <button class="primary" type="submit">Join waitlist</button>
          </form>
        </div>
      </section>

      <section v-if="currentView === NAVIGATION_VIEW_DASHBOARD" class="panel">
        <div class="panel-heading">
          <h2>Account</h2>
          <p class="panel-subtitle">Log in to manage your product waitlist.</p>
        </div>
        <form v-if="!isAuthenticated" class="stack" @submit.prevent="handleLogin">
          <div class="form-row">
            <label for="login-email">Email</label>
            <input
              id="login-email"
              v-model="loginForm.email"
              type="email"
              autocomplete="email"
              required
            />
          </div>
          <div class="form-row">
            <label for="login-password">Password</label>
            <input
              id="login-password"
              v-model="loginForm.password"
              type="password"
              autocomplete="current-password"
              required
            />
          </div>
          <button class="primary" type="submit">Log in</button>
        </form>
        <div v-else class="logged-in">
          <p>
            Signed in as <strong>{{ userEmail }}</strong>
          </p>
          <button type="button" class="ghost" @click="handleLogout">
            Log out
          </button>
        </div>
      </section>

      <section
        v-if="isAuthenticated && currentView === NAVIGATION_VIEW_DASHBOARD"
        class="panel"
      >
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
              v-model="waitlistConfig.productName"
              type="text"
              placeholder="Aurora Analytics"
              required
            />
          </div>
          <div class="form-row">
            <label for="waitlist-title">Waitlist title</label>
            <input
              id="waitlist-title"
              v-model="waitlistConfig.title"
              type="text"
              placeholder="Join the Aurora beta"
              required
            />
          </div>
          <div class="form-row">
            <label for="waitlist-description">Waitlist description</label>
            <textarea
              id="waitlist-description"
              v-model="waitlistConfig.description"
              rows="3"
              placeholder="Tell people why they should sign up."
            ></textarea>
          </div>
          <div class="form-row">
            <label for="waitlist-active">Waitlist URL active</label>
            <div class="toggle-row">
              <input
                id="waitlist-active"
                v-model="waitlistConfig.isActive"
                type="checkbox"
              />
              <span>
                {{ waitlistConfig.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <fieldset class="fieldset">
            <legend>Waitlist form fields</legend>
            <div class="field-list">
              <div
                v-for="field in waitlistFields"
                :key="field.id"
                class="field-item"
              >
                <div>
                  <p class="field-label">{{ field.label }}</p>
                  <p class="field-type">Type: {{ field.type }}</p>
                </div>
                <button
                  class="ghost"
                  type="button"
                  @click="removeField(field.id)"
                >
                  Remove
                </button>
              </div>
            </div>

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
                v-model="waitlistConfig.confirmationTitle"
                type="text"
                placeholder="You're on the list"
                required
              />
            </div>
            <div class="form-row">
              <label for="confirmation-description">Confirmation description</label>
              <textarea
                id="confirmation-description"
                v-model="waitlistConfig.confirmationDescription"
                rows="3"
                placeholder="Let them know what happens next."
              ></textarea>
            </div>
          </fieldset>

          <button class="primary" type="submit">Save waitlist</button>
          <p v-if="waitlistSaved" class="success">Waitlist saved.</p>
        </form>
      </section>

      <section
        v-if="isAuthenticated && currentView === NAVIGATION_VIEW_DASHBOARD"
        class="panel"
      >
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
        <p v-if="urlCopied" class="success">URL copied to clipboard.</p>
      </section>

      <section
        v-if="isAuthenticated && currentView === NAVIGATION_VIEW_DASHBOARD"
        class="panel"
      >
        <div class="panel-heading">
          <h2>Waitlist entries</h2>
          <p class="panel-subtitle">See who has joined your waitlist.</p>
        </div>
        <div v-if="waitlistEntries.length === 0" class="empty-state">
          <p>No one has joined yet.</p>
        </div>
        <ul v-else class="entry-list">
          <li v-for="entry in waitlistEntries" :key="entry.id" class="entry-item">
            <div class="entry-header">
              <strong>{{ entry.values.primary }}</strong>
              <span class="entry-date">{{ entry.joinedAt }}</span>
            </div>
            <dl class="entry-values">
              <div
                v-for="detail in entry.details"
                :key="detail.label"
                class="entry-detail"
              >
                <dt>{{ detail.label }}</dt>
                <dd>{{ detail.value }}</dd>
              </div>
            </dl>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

const NAVIGATION_VIEW_DASHBOARD = 'dashboard';
const NAVIGATION_VIEW_PUBLIC = 'public';

type WaitlistFieldType = 'email' | 'text' | 'boolean';

interface LoginForm {
  email: string;
  password: string;
}

interface WaitlistField {
  id: string;
  label: string;
  type: WaitlistFieldType;
}

interface WaitlistConfig {
  title: string;
  description: string;
  productName: string;
  confirmationTitle: string;
  confirmationDescription: string;
  isActive: boolean;
}

interface WaitlistEntryDetail {
  label: string;
  value: string;
}

interface WaitlistEntry {
  id: string;
  joinedAt: string;
  values: {
    primary: string;
  };
  details: WaitlistEntryDetail[];
}

const loginForm = reactive<LoginForm>({
  email: '',
  password: ''
});
const isAuthenticated = ref(false);
const userEmail = ref('');
const currentView = ref(NAVIGATION_VIEW_DASHBOARD);
const waitlistSaved = ref(false);
const urlCopied = ref(false);
const publicJoinCompleted = ref(false);

const waitlistConfig = reactive<WaitlistConfig>({
  title: 'Join the launch waitlist',
  description: 'Get updates on our upcoming product release.',
  productName: 'Product Launch',
  confirmationTitle: 'Thanks for joining!',
  confirmationDescription: 'We will be in touch with updates soon.',
  isActive: true
});

const waitlistFields = ref<WaitlistField[]>([
  {
    id: 'email-field',
    label: 'Email address',
    type: 'email'
  }
]);

const newFieldLabel = ref('');
const newFieldType = ref<WaitlistFieldType>('text');

const publicFormValues = reactive<Record<string, string | boolean>>({
  'email-field': ''
});

const waitlistEntries = ref<WaitlistEntry[]>([]);

const createIdentifier = (): string => {
  return `field-${Math.random().toString(36).slice(2, 9)}`;
};

const createSlug = (value: string): string => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return 'waitlist';
  }
  return trimmed
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const getOrigin = (): string => {
  if (typeof window === 'undefined') {
    return 'https://example.com';
  }
  return window.location.origin;
};

const waitlistSlug = computed<string>((): string => {
  return createSlug(waitlistConfig.title || waitlistConfig.productName);
});

const shareableUrl = computed<string>((): string => {
  return `${getOrigin()}/#/${waitlistSlug.value}`;
});

const getFieldPlaceholder = (type: WaitlistFieldType): string => {
  if (type === 'email') {
    return 'you@example.com';
  }
  if (type === 'boolean') {
    return '';
  }
  return 'Enter text';
};

const handleLogin = (): void => {
  isAuthenticated.value = true;
  userEmail.value = loginForm.email;
  waitlistSaved.value = false;
  urlCopied.value = false;
};

const handleLogout = (): void => {
  isAuthenticated.value = false;
  userEmail.value = '';
  loginForm.email = '';
  loginForm.password = '';
};

const saveWaitlist = (): void => {
  waitlistSaved.value = true;
  urlCopied.value = false;
};

const addField = (): void => {
  if (!newFieldLabel.value.trim()) {
    return;
  }
  const identifier = createIdentifier();
  waitlistFields.value.push({
    id: identifier,
    label: newFieldLabel.value.trim(),
    type: newFieldType.value
  });
  publicFormValues[identifier] = newFieldType.value === 'boolean' ? false : '';
  newFieldLabel.value = '';
  newFieldType.value = 'text';
};

const removeField = (fieldId: string): void => {
  waitlistFields.value = waitlistFields.value.filter(
    (field): boolean => field.id !== fieldId
  );
  delete publicFormValues[fieldId];
};

const formatEntryDetails = (
  entryValues: Record<string, string | boolean>
): WaitlistEntryDetail[] => {
  return waitlistFields.value.map((field): WaitlistEntryDetail => {
    const rawValue = entryValues[field.id];
    const displayValue =
      typeof rawValue === 'boolean' ? (rawValue ? 'Yes' : 'No') : `${rawValue}`;
    return {
      label: field.label,
      value: displayValue
    };
  });
};

const getPrimaryValue = (entryValues: Record<string, string | boolean>): string => {
  const emailField = waitlistFields.value.find(
    (field): boolean => field.type === 'email'
  );
  if (!emailField) {
    const firstValue = Object.values(entryValues)[0];
    return typeof firstValue === 'string' ? firstValue : 'New response';
  }
  const value = entryValues[emailField.id];
  return typeof value === 'string' && value ? value : 'New response';
};

const submitPublicJoin = (): void => {
  const entryValues: Record<string, string | boolean> = {};
  waitlistFields.value.forEach((field): void => {
    entryValues[field.id] = publicFormValues[field.id];
  });
  const entry: WaitlistEntry = {
    id: createIdentifier(),
    joinedAt: new Date().toLocaleString(),
    values: {
      primary: getPrimaryValue(entryValues)
    },
    details: formatEntryDetails(entryValues)
  };
  waitlistEntries.value = [entry, ...waitlistEntries.value];
  publicJoinCompleted.value = true;
};

const resetPublicJoin = (): void => {
  waitlistFields.value.forEach((field): void => {
    publicFormValues[field.id] = field.type === 'boolean' ? false : '';
  });
  publicJoinCompleted.value = false;
};

const copyUrl = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(shareableUrl.value);
    urlCopied.value = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to copy URL:', errorMessage);
    urlCopied.value = false;
  }
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid #e2e6ee;
}

.app-eyebrow {
  margin: 0;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5a6272;
}

.app-title {
  margin: 6px 0 0;
  font-size: 24px;
}

.app-nav {
  display: flex;
  gap: 12px;
  align-items: center;
}

.nav-button {
  border: 1px solid #d6dbe5;
  background: #f5f7fb;
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 600;
}

.nav-button.active {
  background: #1b1b1b;
  color: #ffffff;
  border-color: #1b1b1b;
}

.app-main {
  flex: 1;
  padding: 24px;
  display: grid;
  gap: 20px;
}

.panel {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e2e6ee;
  box-shadow: 0 10px 30px rgba(27, 27, 27, 0.08);
}

.panel-heading {
  margin-bottom: 16px;
}

.panel-heading h2 {
  margin: 0 0 6px;
  font-size: 20px;
}

.panel-subtitle {
  margin: 0;
  color: #5a6272;
}

.stack {
  display: grid;
  gap: 16px;
}

.form-row {
  display: grid;
  gap: 8px;
}

.form-row input,
.form-row select,
.form-row textarea {
  border: 1px solid #ccd2df;
  border-radius: 10px;
  padding: 10px 12px;
  background: #ffffff;
}

.fieldset {
  border: 1px solid #e2e6ee;
  border-radius: 12px;
  padding: 16px;
  display: grid;
  gap: 16px;
}

.field-list {
  display: grid;
  gap: 12px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f6f7fb;
  border-radius: 12px;
  padding: 12px 14px;
}

.field-label {
  margin: 0;
  font-weight: 600;
}

.field-type {
  margin: 4px 0 0;
  font-size: 13px;
  color: #5a6272;
}

.field-add {
  display: grid;
  gap: 12px;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.primary,
.secondary,
.ghost {
  border-radius: 10px;
  padding: 10px 16px;
  border: 1px solid transparent;
  font-weight: 600;
}

.primary {
  background: #1b1b1b;
  color: #ffffff;
}

.secondary {
  background: #e8edf6;
  color: #1b1b1b;
}

.ghost {
  background: transparent;
  border-color: #ccd2df;
  color: #1b1b1b;
}

.notice {
  background: #fff6e5;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #f1d7a5;
}

.success {
  color: #1f7a3a;
  font-weight: 600;
}

.logged-in {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.share-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.share-row input {
  flex: 1;
  min-width: 220px;
}

.entry-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 16px;
}

.entry-item {
  border: 1px solid #e2e6ee;
  border-radius: 12px;
  padding: 16px;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.entry-date {
  color: #5a6272;
  font-size: 13px;
}

.entry-values {
  margin: 12px 0 0;
  display: grid;
  gap: 8px;
}

.entry-detail {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
}

.entry-detail dt {
  font-weight: 600;
}

.entry-detail dd {
  margin: 0;
  color: #495264;
}

.confirmation {
  display: grid;
  gap: 12px;
}

.empty-state {
  color: #5a6272;
}

@media (min-width: 960px) {
  .app-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel:first-of-type {
    grid-column: span 2;
  }
}

@media (max-width: 720px) {
  .app-header {
    padding: 20px;
  }

  .app-main {
    padding: 16px;
  }

  .entry-detail {
    grid-template-columns: 1fr;
  }
}
</style>
