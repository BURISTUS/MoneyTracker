import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { AppState } from 'react-native';
import { LockScreen } from '../src/components/ui/LockScreen';
import { useSecurityStore } from '../src/stores/securityStore';

const LOCK_TIMEOUT_MS = 30 * 1000;

export default function LockRoute() {
  const router = useRouter();
  const [isLocked, setIsLocked] = useState(true);

  const handleUnlock = () => {
    setIsLocked(false);
    useSecurityStore.getState().setBackgroundedAt(null);
    router.replace('/main');
  };

  if (!isLocked) return null;

  return <LockScreen onUnlock={handleUnlock} />;
}
