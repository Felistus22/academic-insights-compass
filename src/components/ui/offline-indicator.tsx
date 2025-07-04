import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { SyncService } from "@/services/syncService";
import { useState } from "react";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline, wasOffline, markSyncHandled } = useNetworkStatus();
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await SyncService.syncAllData();
      markSyncHandled();
    } finally {
      setIsManualSyncing(false);
    }
  };

  // Don't show anything if online and no pending sync
  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div className={className}>
      {!isOnline ? (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You are offline. Changes will sync when connection is restored.</span>
          </AlertDescription>
        </Alert>
      ) : wasOffline ? (
        <Alert>
          <Wifi className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between w-full">
            <span>Connection restored. Click to sync offline changes.</span>
            <Button 
              size="sm" 
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="ml-2"
            >
              {isManualSyncing ? "Syncing..." : "Sync Now"}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}