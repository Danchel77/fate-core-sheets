import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { useSyncExternalStore } from 'react';
import { auth, googleProvider } from './app';

export type AuthState = { ready: boolean; user: User | null };

let state: AuthState = { ready: false, user: null };
const listeners = new Set<() => void>();
let started = false;

function publish() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Однократный запуск слежения за входом. */
export function initAuth(): void {
  if (started) return;
  started = true;
  if (!auth) {
    state = { ready: true, user: null };
    publish();
    return;
  }
  onAuthStateChanged(auth, (user) => {
    state = { ready: true, user };
    publish();
  });
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getUser(): User | null {
  return state.user;
}

/** Подписка на смену пользователя без хука (для хранилища). */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return subscribe(() => callback(state.user));
}

/* --- окно входа --- */

let dialogOpen = false;
const dialogListeners = new Set<() => void>();

export function openAuthDialog(): void {
  dialogOpen = true;
  dialogListeners.forEach((listener) => listener());
}

export function closeAuthDialog(): void {
  dialogOpen = false;
  dialogListeners.forEach((listener) => listener());
}

export function useAuthDialogOpen(): boolean {
  return useSyncExternalStore(
    (listener) => {
      dialogListeners.add(listener);
      return () => {
        dialogListeners.delete(listener);
      };
    },
    () => dialogOpen,
    () => dialogOpen,
  );
}

/* --- действия --- */

function requireAuth() {
  if (!auth) throw new Error('Firebase не настроен');
  return auth;
}

export async function signInWithGoogle(): Promise<void> {
  if (!googleProvider) throw new Error('Firebase не настроен');
  await signInWithPopup(requireAuth(), googleProvider);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function registerWithEmail(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(requireAuth(), email.trim(), password);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(requireAuth(), email.trim());
}

export async function signOutUser(): Promise<void> {
  await signOut(requireAuth());
}

/** Понятный текст вместо кода ошибки Firebase. */
export function authErrorMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : '';
  switch (code) {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Окно входа закрылось. Попробуйте ещё раз.';
    case 'auth/popup-blocked':
      return 'Браузер закрыл окно входа. Разрешите всплывающие окна для этого сайта.';
    case 'auth/unauthorized-domain':
      return 'Этот адрес пока не разрешён в настройках входа Firebase.';
    case 'auth/operation-not-allowed':
      return 'Этот способ входа пока не включён в проекте Firebase.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Почта или пароль не подошли.';
    case 'auth/invalid-email':
      return 'Похоже, в адресе почты опечатка.';
    case 'auth/user-disabled':
      return 'Этот аккаунт отключён.';
    case 'auth/email-already-in-use':
      return 'Аккаунт с этой почтой уже есть — войдите в него.';
    case 'auth/weak-password':
      return 'Пароль слишком простой: нужно не меньше шести знаков.';
    case 'auth/too-many-requests':
      return 'Слишком много попыток. Подождите пару минут.';
    case 'auth/network-request-failed':
      return 'Нет связи. Проверьте интернет и попробуйте снова.';
    case 'auth/missing-password':
      return 'Введите пароль.';
    default:
      return 'Не получилось. Попробуйте ещё раз.';
  }
}
