/**
 * Публичная настройка Firebase: те же значения, что в прежнем проекте
 * (fate-witcher-sheet). Ключ здесь — не секрет, он всегда виден в собранном
 * сайте; данные защищают правила доступа Firestore (только владелец).
 */
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA6-4T03AveqMAvlYYGTRrX1wWw4bBWNRw',
  authDomain: 'fate-witcher-sheet.firebaseapp.com',
  projectId: 'fate-witcher-sheet',
  storageBucket: 'fate-witcher-sheet.firebasestorage.app',
  messagingSenderId: '702799281373',
  appId: '1:702799281373:web:ab2fde91ec89debec12f34',
} as const;

export const firebaseConfigured = Boolean(FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId);
