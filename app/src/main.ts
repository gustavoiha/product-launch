import { createApp } from 'vue';
import type { App as VueApp } from 'vue';
import App from './App.vue';
import './main.css';

export const createApplication = (mountElement: HTMLElement): VueApp<Element> => {
  const appInstance = createApp(App);
  appInstance.mount(mountElement);
  return appInstance;
};

const mountElement = document.getElementById('app');
if (mountElement) {
  createApplication(mountElement);
}
