import { getCurrentUser, signIn, signOut } from 'aws-amplify/auth';

export interface AuthenticatedUser {
  email: string;
}

export const fetchCurrentUser = async (): Promise<AuthenticatedUser | null> => {
  // Cognito authenticated session: expects email to be available in user attributes.
  const user = await getCurrentUser();
  const email = user.signInDetails?.loginId ?? '';

  if (!email) {
    return null;
  }

  return { email };
};

export const signInUser = async (
  email: string,
  password: string
): Promise<AuthenticatedUser> => {
  // Cognito authentication: expects username=email and password.
  await signIn({ username: email, password });

  return { email };
};

export const signOutUser = async (): Promise<void> => {
  // Cognito sign-out: invalidates the current user session.
  await signOut();
};
