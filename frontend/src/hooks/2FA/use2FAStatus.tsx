'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';

interface TwoFAStatusResponse {
  is2FAEnabled: boolean;
}

export function use2FAStatus() {
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    data: status,
    error: swrError,
    isLoading,
  } = useSWR<TwoFAStatusResponse>('/2fa/status', fetcher);

  // Get status 2Fa of the user before check
  useEffect(() => {
    if (swrError) {
      setError(
        swrError instanceof Error
          ? swrError.message
          : 'Erreur lors de la vérification du statut 2FA'
      );
      return;
    }

    if (status) {
      setIs2FAEnabled(status.is2FAEnabled);
    }
  }, [status, swrError]);

  return { is2FAEnabled, isLoading, error };
}
