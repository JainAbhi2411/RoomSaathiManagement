// PWA Utilities for Roomsaathi

// Register Service Worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      console.log('[PWA] Service Worker registered successfully:', registration.scope);
      
      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
      
      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

// Check for Service Worker updates
export const checkForUpdates = (registration: ServiceWorkerRegistration): void => {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New service worker available
          console.log('[PWA] New version available');
          
          // Notify user about update
          if (window.confirm('A new version of Roomsaathi is available. Update now?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    }
  });
};

// Install PWA prompt
let deferredPrompt: any = null;

export const setupInstallPrompt = (): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    
    // Dispatch custom event to notify app
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredPrompt = null;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
};

export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    console.log('[PWA] Install prompt not available');
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] User choice:', outcome);

  // Clear the deferredPrompt
  deferredPrompt = null;

  return outcome === 'accepted';
};

export const isInstalled = (): boolean => {
  // Check if app is installed
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const canInstall = (): boolean => {
  return deferredPrompt !== null;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
  }
  return 'denied';
};

// Show notification
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/icons/logo-512.png',
          badge: '/icons/logo-512.png',
          ...options,
        });
      });
    } else {
      new Notification(title, {
        icon: '/icons/logo-512.png',
        ...options,
      });
    }
  }
};

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupOnlineListener = (
  onOnline: () => void,
  onOffline: () => void
): void => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
};
