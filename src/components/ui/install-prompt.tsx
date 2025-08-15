
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

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
      toast.success('App installed successfully!');
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
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setShowPrompt(false);
          toast.success('Installation started!');
        } else {
          toast.info('Installation cancelled');
        }
      } catch (error) {
        console.error('Installation error:', error);
        setShowManualInstructions(true);
      }
    } else {
      // Show manual installation instructions
      setShowManualInstructions(true);
    }
  };

  const getManualInstructions = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        icon: <Monitor className="h-5 w-5" />,
        title: 'Install on Chrome',
        steps: [
          'Look for the install icon (⬇️) in your address bar',
          'Or click the three dots menu → "Install Padre Pio Report Card"',
          'Click "Install" in the popup'
        ]
      };
    } else if (userAgent.includes('edg')) {
      return {
        icon: <Monitor className="h-5 w-5" />,
        title: 'Install on Edge',
        steps: [
          'Click the three dots menu (⋯)',
          'Select "Apps" → "Install this site as an app"',
          'Click "Install"'
        ]
      };
    } else if (userAgent.includes('safari') && userAgent.includes('mobile')) {
      return {
        icon: <Smartphone className="h-5 w-5" />,
        title: 'Install on iOS Safari',
        steps: [
          'Tap the Share button (□↗)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" in the top right'
        ]
      };
    } else if (userAgent.includes('firefox')) {
      return {
        icon: <Monitor className="h-5 w-5" />,
        title: 'Install on Firefox',
        steps: [
          'Click the three lines menu (☰)',
          'Select "Install this site as an app"',
          'Click "Install"'
        ]
      };
    } else {
      return {
        icon: <Monitor className="h-5 w-5" />,
        title: 'Install App',
        steps: [
          'Look for "Install App" in your browser menu',
          'Or check for an install icon in the address bar',
          'Follow your browser\'s installation prompts'
        ]
      };
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowManualInstructions(false);
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  if (!showPrompt) return null;

  const instructions = getManualInstructions();

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 animate-in slide-in-from-bottom-2">
      <CardContent className="p-4">
        {!showManualInstructions ? (
          <>
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
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {instructions.icon}
                <h3 className="font-semibold">{instructions.title}</h3>
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
            <div className="space-y-2 mb-3">
              {instructions.steps.map((step, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDismiss} className="flex-1">
                Got it
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InstallPrompt;
