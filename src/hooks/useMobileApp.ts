import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

export interface MobileInfo {
  platform: 'ios' | 'android' | 'web';
  isNative: boolean;
  isReady: boolean;
}

export function useMobileApp() {
  const [mobileInfo, setMobileInfo] = useState<MobileInfo>({
    platform: 'web',
    isNative: false,
    isReady: false,
  });

  useEffect(() => {
    const initializeMobile = async () => {
      const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
      const isNative = Capacitor.isNativePlatform();

      if (isNative) {
        try {
          // Configure status bar
          if (platform === 'ios' || platform === 'android') {
            await StatusBar.setStyle({ style: Style.Light });
            
            if (platform === 'android') {
              await StatusBar.setBackgroundColor({ color: '#f97316' });
            }
          }

          // Hide splash screen after app is ready
          await SplashScreen.hide();

          // Configure keyboard behavior
          if (platform === 'ios') {
            Keyboard.addListener('keyboardWillShow', () => {
              document.body.classList.add('keyboard-open');
            });

            Keyboard.addListener('keyboardWillHide', () => {
              document.body.classList.remove('keyboard-open');
            });
          }

          // Handle app state changes
          App.addListener('appStateChange', ({ isActive }) => {
            if (isActive) {
              console.log('App became active');
            } else {
              console.log('App became inactive');
            }
          });

          // Handle deep links
          App.addListener('appUrlOpen', (data) => {
            console.log('App opened with URL:', data.url);
            // Handle deep link navigation here
            const path = new URL(data.url).pathname;
            if (path) {
              window.location.hash = path;
            }
          });

          // Handle back button on Android
          if (platform === 'android') {
            App.addListener('backButton', ({ canGoBack }) => {
              if (canGoBack) {
                window.history.back();
              } else {
                App.exitApp();
              }
            });
          }
        } catch (error) {
          console.error('Error initializing mobile app:', error);
        }
      }

      setMobileInfo({
        platform,
        isNative,
        isReady: true,
      });
    };

    initializeMobile();

    return () => {
      // Cleanup listeners
      if (Capacitor.isNativePlatform()) {
        Keyboard.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, []);

  return mobileInfo;
}

// Utility to check if running on mobile
export function isMobileApp(): boolean {
  return Capacitor.isNativePlatform();
}

// Utility to get platform
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}

// Safe area insets for mobile
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Use CSS environment variables for safe area
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      setInsets({
        top: parseInt(computedStyle.getPropertyValue('--sat') || '0', 10),
        bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0', 10),
        left: parseInt(computedStyle.getPropertyValue('--sal') || '0', 10),
        right: parseInt(computedStyle.getPropertyValue('--sar') || '0', 10),
      });
    }
  }, []);

  return insets;
}
