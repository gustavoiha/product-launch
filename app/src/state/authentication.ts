import { inject, reactive, type InjectionKey } from 'vue';

export interface AuthenticationState {
  email: string;
  isAuthenticated: boolean;
}

export interface AuthenticationStore {
  state: AuthenticationState;
  login: (email: string, password: string) => void;
  logout: () => void;
}

export const createAuthenticationStore = (): AuthenticationStore => {
  const state = reactive<AuthenticationState>({
    email: '',
    isAuthenticated: false
  });

  const login = (email: string, password: string): void => {
    void password;
    state.email = email;
    state.isAuthenticated = true;
  };

  const logout = (): void => {
    state.email = '';
    state.isAuthenticated = false;
  };

  return {
    state,
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
