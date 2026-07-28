import { Download, RefreshCw, Wifi, WifiOff, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type PwaStatusViewProps = {
  online: boolean;
  offlineReady: boolean;
  needRefresh: boolean;
  onDismissOfflineReady: () => void;
  onDismissRefresh: () => void;
  onUpdate: () => void;
};

export function PwaStatusView({
  online,
  offlineReady,
  needRefresh,
  onDismissOfflineReady,
  onDismissRefresh,
  onUpdate,
}: PwaStatusViewProps) {
  return (
    <aside className="pwa-status" aria-label="Application connectivity and updates">
      <p
        aria-atomic="true"
        aria-live="polite"
        className={online ? 'connectivity-badge is-online' : 'connectivity-badge is-offline'}
        role="status"
      >
        {online ? <Wifi aria-hidden="true" size={16} /> : <WifiOff aria-hidden="true" size={16} />}
        <span>
          {online
            ? 'Online · local simulator ready'
            : 'Offline · cached shell and local simulator remain available'}
        </span>
      </p>

      {offlineReady ? (
        <div className="pwa-notice" role="status">
          <Download aria-hidden="true" size={18} />
          <p>
            <strong>Offline shell ready.</strong> A future warm load can use cached local assets;
            connected tiles and provider refreshes still require a network.
          </p>
          <button
            aria-label="Dismiss offline-ready message"
            onClick={onDismissOfflineReady}
            type="button"
          >
            <X aria-hidden="true" size={17} />
          </button>
        </div>
      ) : null}

      {needRefresh ? (
        <div className="pwa-notice pwa-notice--update" role="status">
          <RefreshCw aria-hidden="true" size={18} />
          <p>
            <strong>Update ready.</strong> Reload when convenient to use the newest verified local
            app assets.
          </p>
          <div>
            <button className="primary-action" onClick={onUpdate} type="button">
              Update app
            </button>
            <button aria-label="Dismiss update message" onClick={onDismissRefresh} type="button">
              <X aria-hidden="true" size={17} />
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

export function PwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const reloadOnControllerChangeRef = useRef(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const handleControllerChange = () => {
      if (reloadOnControllerChangeRef.current) window.location.reload();
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;
    let active = true;
    const cleanups: (() => void)[] = [];
    const observeInstall = (worker: ServiceWorker) => {
      const handleStateChange = () => {
        if (!active || worker.state !== 'installed') return;
        if (navigator.serviceWorker.controller === null) {
          setOfflineReady(true);
        } else {
          setNeedRefresh(true);
        }
      };
      worker.addEventListener('statechange', handleStateChange);
      cleanups.push(() => worker.removeEventListener('statechange', handleStateChange));
    };

    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((registration) => {
        if (!active) return;
        registrationRef.current = registration;
        if (registration.waiting !== null && navigator.serviceWorker.controller !== null) {
          setNeedRefresh(true);
        }
        if (registration.installing !== null) observeInstall(registration.installing);
        const handleUpdateFound = () => {
          if (registration.installing !== null) observeInstall(registration.installing);
        };
        registration.addEventListener('updatefound', handleUpdateFound);
        cleanups.push(() => registration.removeEventListener('updatefound', handleUpdateFound));
      })
      .catch(() => {
        // The full local simulator remains available when service-worker registration is blocked.
      });

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <PwaStatusView
      needRefresh={needRefresh}
      offlineReady={offlineReady}
      online={online}
      onDismissOfflineReady={() => setOfflineReady(false)}
      onDismissRefresh={() => setNeedRefresh(false)}
      onUpdate={() => {
        const waitingWorker = registrationRef.current?.waiting;
        if (waitingWorker === null || waitingWorker === undefined) return;
        reloadOnControllerChangeRef.current = true;
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      }}
    />
  );
}
