import { firebaseApp } from './app';

let initialized = false;

/**
 * App Check защищает Firebase AI Logic от чужих сайтов.
 * Ключ reCAPTCHA Enterprise публичный; если он не задан, проверка
 * остаётся выключенной, а запросы к модели вернут 403.
 */
export async function ensureAppCheck(): Promise<void> {
  if (initialized || !firebaseApp) return;
  const siteKey = import.meta.env.VITE_APP_CHECK_SITE_KEY;
  if (!siteKey) return;
  const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import('firebase/app-check');
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  initialized = true;
}
