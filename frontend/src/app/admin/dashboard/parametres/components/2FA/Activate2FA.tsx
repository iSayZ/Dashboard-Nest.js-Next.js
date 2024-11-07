import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

import LoginDialog from '../../../components/LoginDialog';

import Init2FA from './Init2FA';
import InitSuccess2FA from './InitSuccess2FA';

const Activate2FA: React.FC = () => {
  const [showLoginDialog, setShowLoginDialog] = useState<boolean>(false);
  const [showQrCodeDialog, setShowQrCodeDialog] = useState<boolean>(false);
  const [showInitSuccess2FA, setShowInitSuccess2FA] = useState<boolean>(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Callback to open dialog when login is successfull
  const handleLoginSuccess = () => {
    setShowLoginDialog(false); // Close Login
    setShowQrCodeDialog(true); // Open init 2FA
  };

  // Callback to open dialog when initialization is successfull
  const handleInitSuccess = (backupCodes: string[]) => {
    setBackupCodes(backupCodes); // Stock Backup Codes
    setShowQrCodeDialog(false); // Close init 2FA
    setShowInitSuccess2FA(true); // Open 2FA Success
  };

  return (
    <>
      {/* Button to open the login dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogTrigger asChild>
          <Button onClick={() => setShowLoginDialog(true)} className="min-w-44">
            Activer
          </Button>
        </DialogTrigger>

        {/* Login Dialog */}
        <LoginDialog
          onLoginSuccess={handleLoginSuccess}
          reason="activer la double authentification"
        />
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQrCodeDialog} onOpenChange={setShowQrCodeDialog}>
        <Init2FA
          showQrCodeDialog={showQrCodeDialog}
          onInitSuccess={handleInitSuccess}
        />
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showInitSuccess2FA} onOpenChange={setShowInitSuccess2FA}>
        <InitSuccess2FA backupCodes={backupCodes} />
      </Dialog>
    </>
  );
};

export default Activate2FA;
