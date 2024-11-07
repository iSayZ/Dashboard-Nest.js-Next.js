import { Mail } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import Verify2FAModal from '../../../components/Verify2FAModal';

import { use2FACheck } from '@/hooks/2FA/use2FACheck';


const EmailDialog: React.FC = () => {
  const [showDialog, setShowDialog] = useState<boolean>(false);

  const {
    is2FAModalOpen,
    setIs2FAModalOpen,
    check2FABeforeAction,
    handle2FASuccess,
    currentActionName,
    is2FAEnabled,
    verifyCode,
  } = use2FACheck();

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <Button
          variant="outline"
          onClick={() =>
            check2FABeforeAction(
              () => setShowDialog(true),
              "Modification de l'adresse mail"
            )
          }
        >
          Modifier mon adresse mail
          <Mail className="text-foreground ml-3 size-5" />
        </Button>
        <DialogContent
          className="max-w-sm"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Editer mon adresse mail</DialogTitle>
            <DialogDescription>
              Cliquez sur Enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="current">Ancienne adresse mail</Label>
              <Input id="current" type="email" className="text-foreground" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Nouvelle adresse mail</Label>
              <Input id="new" type="email" className="text-foreground" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">Confirmation</Label>
              <Input id="new" type="email" className="text-foreground" />
            </div>
            <Button className="ml-auto mt-2 w-1/2 max-sm:m-auto">
              Enregistrer
            </Button>
          </div>
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

export default EmailDialog;
