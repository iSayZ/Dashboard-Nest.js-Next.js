import { useState } from 'react';
import { mutate } from 'swr';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { disable2FA } from '@/api/twoFaApi';
import { use2FACheck } from '@/hooks/2FA/use2FACheck';

import Verify2FAModal from '../../../components/Verify2FAModal';

const Desactivate2FA: React.FC = () => {
  const [showAlertDialog, setShowAlertDialog] = useState<boolean>(false);
  const [showConfirmationDialog, setShowConfirmationDialog] =
    useState<boolean>(false);

  const {
    is2FAModalOpen,
    setIs2FAModalOpen,
    check2FABeforeAction,
    handle2FASuccess,
    currentActionName,
    is2FAEnabled,
    verifyCode,
  } = use2FACheck();

  const handleDisable2FA = async () => {
    try {
      await disable2FA();
      mutate('/admin/settings');
      mutate('/2fa/status');
      setShowAlertDialog(false); // Close Alert Dialog
      setShowConfirmationDialog(true); // Open Confirmation Dialog
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* Button to open the Alert Dialog to confirm action */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <Button
          onClick={() =>
            check2FABeforeAction(
              () => setShowAlertDialog(true),
              'Désactivation 2FA'
            )
          }
          className="min-w-44"
        >
          Désactiver
        </Button>
        <DialogContent
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <div className="space-y-6">
              <DialogTitle className="mr-4">
                Confirmez la désactivation du 2FA
              </DialogTitle>
              <DialogDescription>
                Désactiver l'authentification à deux facteurs (2FA) expose votre
                compte à un risque de sécurité accru. La 2FA ajoute une couche
                supplémentaire de protection en exigeant un code temporaire en
                plus de votre mot de passe, rendant plus difficile l'accès non
                autorisé même si votre mot de passe est compromis. Sans cette
                protection, un attaquant ayant accès à vos identifiants pourrait
                potentiellement prendre le contrôle de votre compte. Nous vous
                recommandons fortement de maintenir cette sécurité active pour
                protéger vos informations sensibles et votre identité en ligne.
              </DialogDescription>
              <div className="flex w-full justify-end gap-4 max-sm:justify-center">
                <DialogClose className="min-w-36" asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button className="min-w-36" onClick={handleDisable2FA}>
                  Confirmer
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Disabled Confirmation Dialog */}
      <Dialog
        open={showConfirmationDialog}
        onOpenChange={setShowConfirmationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <div className="space-y-6">
              <DialogTitle className="mr-4">
                Authentification 2FA désactivé
              </DialogTitle>
              <DialogDescription>
                L'authentification à deux facteurs (2FA) a été désactivée avec
                succès. Votre compte est désormais protégé uniquement par votre
                mot de passe, ce qui peut réduire la sécurité. Si vous changez
                d'avis, vous pouvez réactiver la 2FA à tout moment en accédant
                aux paramètres de votre compte.
              </DialogDescription>
              <div className="flex justify-end gap-4 max-sm:justify-center">
                <DialogClose className="min-w-36" asChild>
                  <Button>Continuer</Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {is2FAEnabled && (
        <Verify2FAModal
          isOpen={is2FAModalOpen}
          onClose={() => setIs2FAModalOpen(false)}
          onVerify={handle2FASuccess}
          verifyCode={verifyCode}
          action={currentActionName}
        />
      )}
    </>
  );
};

export default Desactivate2FA;
