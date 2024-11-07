import { Info } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { mutate } from 'swr';

import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';

import { init2FA, verifyInitCode2FA } from '@/api/twoFaApi';

interface Init2FAProps {
  showQrCodeDialog: boolean;
  onInitSuccess: (backupCodes: string[]) => void;
}

const Init2FA: React.FC<Init2FAProps> = ({
  showQrCodeDialog,
  onInitSuccess,
}) => {
  const [qrCode, setQrCode] = useState<string>('');
  const [qrCodeIsExpired, setQrCodeIsExpired] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [code2FA, setCode2FA] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (showQrCodeDialog) {
      loadQrCode();
    }
  }, [showQrCodeDialog]);

  // Call API to generate a QR Code
  const loadQrCode = async () => {
    try {
      const response = await init2FA();
      console.log(response);
      setQrCode(response);
    } catch (error) {
      console.error('Erreur lors du chargement des réalisations :', error);
    }
  };

  // If timer to QR Code expiration is out
  const handleTimeOut = () => {
    setQrCodeIsExpired(true);
  };

  // To regenerate a new QR Code
  const handleRegenerateQrCode = () => {
    loadQrCode();
    setQrCodeIsExpired(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setCode2FA('');
    try {
      const response = await verifyInitCode2FA(code2FA);
      mutate('/admin/settings');
      mutate('/2fa/status');
      onInitSuccess(response);
    } catch {
      setErrorMsg('Code invalide');
    }
  };

  return (
    <>
      <DialogContent
        className="max-h-screen max-w-max overflow-auto"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-4">
          <DialogTitle>Scannez le QR Code</DialogTitle>
          <DialogDescription className="flex items-center gap-1 max-md:justify-center">
            <Info className="size-4" />
            Expiration du QR Code dans
            <Timer
              key={refreshKey}
              initialMinutes={15}
              color="muted-foreground"
              onTimeout={handleTimeOut}
            />
            minutes
          </DialogDescription>
        </DialogHeader>
        <div className="flex size-full items-center gap-4 max-md:flex-col">
          {qrCodeIsExpired ? (
            <div className="flex size-[250px] items-center justify-center">
              <Button onClick={handleRegenerateQrCode}>
                Regénérer un QR Code
              </Button>
            </div>
          ) : (
            <Image
              src={qrCode}
              width={250}
              height={250}
              alt="QrCode d'activation de double authentification (2FA)"
              className="m-auto object-cover"
            />
          )}
          <div className="space-y-4 max-md:text-center">
            <h2 className="text-lg font-semibold">Comment ça marche ?</h2>
            <ol className="space-y-2 text-sm">
              <li>
                <span className="font-semibold">
                  1. Ouvrez votre application d'authentification.
                </span>
                <ul className="ml-10 list-disc">
                  <li>
                    Nous vous recommandons{' '}
                    <span className="font-semibold">Google Authenticator</span>{' '}
                    :
                  </li>
                  <li className="ml-8">
                    <a
                      href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=fr&pli=1"
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      Télécharger sur Google Play
                    </a>
                  </li>
                  <li className="ml-8">
                    <a
                      href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                      target="_blank"
                      className="text-blue-500 underline"
                    >
                      Télécharger sur l'App Store
                    </a>
                  </li>
                </ul>
              </li>
              <li>
                <span className="font-semibold">
                  2. Scannez le QR code affiché à gauche.
                </span>
              </li>
              <li>
                <span className="font-semibold">
                  3. Entrez le code généré ci-dessous.
                </span>
              </li>
            </ol>
          </div>
        </div>
        <Separator />
        <div className="my-4 flex flex-col items-center gap-3">
          <p className="text-sm font-medium">
            Entrez le code d'authentification à 6 chiffres généré par
            l'application
          </p>
          <InputOTP
            value={code2FA}
            onChange={(code2FA) => setCode2FA(code2FA)}
            maxLength={6}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-center text-sm text-red-500">{errorMsg}</p>
          <Button disabled={code2FA.length !== 6} onClick={handleSubmit}>
            Soumettre le code
          </Button>
        </div>
      </DialogContent>
    </>
  );
};

export default Init2FA;
