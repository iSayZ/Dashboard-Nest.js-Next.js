import { Lock } from 'lucide-react';
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

import { ApiError, changePassword } from '@/api/changeRequestApi';
import { use2FACheck } from '@/hooks/2FA/use2FACheck';
import PasswordChangeAlert from './PasswordChangeAlert';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmationPassword: string;
}

const PasswordDialog: React.FC = () => {
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

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmationPassword: ''
  })

  const [errorMsg, setErrorMsg] = useState<{currentPassword: string, newPassword: string}>({
    currentPassword: '',
    newPassword: ''
  });

  const handleChangePasswordForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
  
    setPasswordForm((prevState) => ({
      ...prevState,
      [id]: value,
    }));

    if (id === 'currentPassword') {
      setErrorMsg((prevError) => ({
        ...prevError,
        currentPassword: '',
      }));
    } else {
      setErrorMsg((prevError) => ({
        ...prevError,
        newPassword: '',
      }));
    }
  };

  // To open alert on submit success
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // To submit
  const handleSubmit = async () => {
    // Reset all errors
    setErrorMsg({
      currentPassword: '',
      newPassword: ''
    });

    if (!passwordForm.currentPassword) {
      return setErrorMsg((prevError) => ({
        ...prevError,
        currentPassword: 'Veuillez remplir tous les champs.',
      }));
    }

    if (!passwordForm.newPassword || !passwordForm.confirmationPassword ) {
      return setErrorMsg((prevError) => ({
        ...prevError,
        newPassword: 'Veuillez remplir tous les champs.',
      }));
    }

    if (passwordForm.newPassword !== passwordForm.confirmationPassword) {
      return setErrorMsg((prevError) => ({
        ...prevError,
        newPassword: 'Les mots de passes ne correspondent pas.',
      }));
    }

    const data = {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    }

    try {
      const response = await changePassword(data);
      console.log("STATUS",response.status);
      if (response.status === 201) {
        setShowDialog(false);
        setIsAlertOpen(true);
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          return setErrorMsg((prevError) => ({
            ...prevError,
            currentPassword: 'Le mot de passe est incorrect.',
          }));
        } else {
          console.log("Erreur:", error.message);
        }
      } else {
        console.log("Erreur inconnue:", error);
      }
    }
  }

  return (
    <>
      <PasswordChangeAlert isOpen={isAlertOpen} setIsOpen={setIsAlertOpen} />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <Button
          variant="outline"
          onClick={() =>
            check2FABeforeAction(
              () => setShowDialog(true),
              'Modification du mot de passe'
            )
          }
        >
          Modifier mon mot de passe
          <Lock className="ml-3 size-5" />
        </Button>
        <DialogContent
          className="max-w-sm"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Editer mon mot de passe</DialogTitle>
            <DialogDescription>
              Cliquez sur Enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Ancien mot de passe</Label>
              <Input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handleChangePasswordForm} className={errorMsg.currentPassword ? 'outline outline-1 outline-red-500' : ''} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={handleChangePasswordForm} className={errorMsg.newPassword ? 'outline outline-1 outline-red-500' : ''} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="confirmationPassword">Confirmation</Label>
              <Input id="confirmationPassword" type="password" value={passwordForm.confirmationPassword} onChange={handleChangePasswordForm} className={errorMsg.newPassword ? 'outline outline-1 outline-red-500' : ''} />
            </div>
            {(errorMsg.currentPassword || errorMsg.newPassword) &&
            <p className='text-sm text-red-600'>{errorMsg.currentPassword || errorMsg.newPassword}</p>}
            <Button className="ml-auto mt-2 w-1/2 max-sm:m-auto" onClick={handleSubmit}>
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

export default PasswordDialog;
