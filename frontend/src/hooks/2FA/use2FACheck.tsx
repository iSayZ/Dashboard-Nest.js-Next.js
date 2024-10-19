// hooks/use2FACheck.ts
"use client";

import { useState } from 'react';
import { use2FAStatus } from './use2FAStatus';
import axiosInstance from '@/lib/axiosInstance';

interface Use2FACheckResult {
  is2FAModalOpen: boolean;
  setIs2FAModalOpen: (isOpen: boolean) => void;
  check2FABeforeAction: (action: () => void | Promise<void>, actionName?: string) => void;
  handle2FASuccess: () => void;
  currentActionName: string | undefined;
  is2FAEnabled: boolean | null;
  isLoading: boolean;
  verifyCode: (code: string) => Promise<boolean>;
}

interface Verify2FAResponse {
  success: boolean;
  message?: string;
}

export function use2FACheck(): Use2FACheckResult {
  const [is2FAModalOpen, setIs2FAModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);
  const [currentActionName, setCurrentActionName] = useState<string | undefined>(undefined);
  
  const { is2FAEnabled, isLoading, error } = use2FAStatus();

  const verifyCode = async (code: string): Promise<boolean> => {
    try {
      const { data } = await axiosInstance.post<Verify2FAResponse>('/2fa/verify-2fa', { code });
      return data.success;
    } catch (err) {
      return false;
    }
  };

  const check2FABeforeAction = (
    action: () => void | Promise<void>,
    actionName?: string
  ): void => {
    // If 2FA is not enabled, execute action directly
    if (!is2FAEnabled) {
      action();
      return;
    }

    // Else continue the processus of checking
    setPendingAction(() => action);
    setCurrentActionName(actionName);
    setIs2FAModalOpen(true);
  };

  const handle2FASuccess = async (): Promise<void> => {
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
      setCurrentActionName(undefined);
    }
  };

  return {
    is2FAModalOpen,
    setIs2FAModalOpen,
    check2FABeforeAction,
    handle2FASuccess,
    currentActionName,
    is2FAEnabled,
    isLoading,
    verifyCode
  };
}