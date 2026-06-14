import type { Router } from 'expo-router';

/** Goes back when possible; otherwise replaces with home (avoids GO_BACK errors on web). */
export function safeGoBack(router: Router, fallback = '/' as const) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallback);
  }
}
