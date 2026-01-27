import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import App from './App.vue';
import { createAppRouter } from './router';
import {
  authenticationStoreKey,
  createAuthenticationStore
} from './state/authentication';
import { createWaitlistStore, waitlistStoreKey } from './state/waitlist';
import './main.css';

export const createApplication = (mountElement: HTMLElement): VueApp<Element> => {
  const authenticationStore = createAuthenticationStore();
  const waitlistStore = createWaitlistStore();
  const router = createAppRouter(authenticationStore);
  const appInstance = createApp(App);

  appInstance.provide(authenticationStoreKey, authenticationStore);
  appInstance.provide(waitlistStoreKey, waitlistStore);
  appInstance.use(router);
  appInstance.mount(mountElement);

  return appInstance;
};

const mountElement = document.getElementById('app');
if (mountElement) {
  createApplication(mountElement);
}
