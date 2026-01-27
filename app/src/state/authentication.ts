import { inject, reactive, type InjectionKey } from 'vue';
import { fetchCurrentUser, signInUser, signOutUser } from '../api/authentication';

export interface AuthenticationState {
  email: string;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export interface AuthenticationStore {
  state: AuthenticationState;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const createAuthenticationStore = (): AuthenticationStore => {
  const state = reactive<AuthenticationState>({
    email: '',
    isAuthenticated: false,
    isInitialized: false
  });

  const initialize = async (): Promise<void> => {
    if (state.isInitialized) {
      return;
    }

    const currentUser = await fetchCurrentUser();
    if (currentUser) {
      state.email = currentUser.email;
      state.isAuthenticated = true;
    }
    state.isInitialized = true;
  };

  const login = async (email: string, password: string): Promise<void> => {
    const user = await signInUser(email, password);
    state.email = user.email;
    state.isAuthenticated = true;
  };

  const logout = async (): Promise<void> => {
    await signOutUser();
    state.email = '';
    state.isAuthenticated = false;
  };

  return {
    state,
    initialize,
    login,
    logout
  };
};

export const authenticationStoreKey: InjectionKey<AuthenticationStore> =
  Symbol('authenticationStore');

export const useAuthenticationStore = (): AuthenticationStore => {
  const store = inject(authenticationStoreKey);
  if (!store) {
    throw new Error('Authentication store is not available');
  }
  return store;
};
