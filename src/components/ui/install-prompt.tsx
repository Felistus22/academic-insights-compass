import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show manual prompt after 3 seconds if no native prompt
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    } else {
      // Manual installation instructions
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    let instructions = '';

    if (userAgent.includes('chrome') || userAgent.includes('edge')) {
      instructions = 'Click the install icon in your address bar or go to Settings > Install Padre Pio Report Card';
    } else if (userAgent.includes('firefox')) {
      instructions = 'Go to Settings > Install this site as an app';
    } else if (userAgent.includes('safari')) {
      instructions = 'Tap the Share button and select "Add to Home Screen"';
    } else {
      instructions = 'Look for "Install App" or "Add to Home Screen" in your browser menu';
    }

    alert(`To install Padre Pio Report Card:\n\n${instructions}`);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-2">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Install App</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Install Padre Pio Report Card for faster access and offline use
        </p>
        <div className="flex gap-2">
          <Button onClick={handleInstallClick} size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install
          </Button>
          <Button variant="outline" size="sm" onClick={handleDismiss}>
            Later
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallPrompt;