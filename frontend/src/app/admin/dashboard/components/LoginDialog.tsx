'use client';

import { Lock } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { verifyIdentity } from '@/api/authApi';

interface LoginProps {
  onLoginSuccess: () => void;
  reason: string;
}

const LoginDialog: React.FC<LoginProps> = ({ onLoginSuccess, reason }) => {
  const [formData, setFormData] = useState<{ password: string }>({
    password: '',
  });

  const [errorMsg, setErrorMsg] = useState<{
    password: string;
    other: string;
  }>({
    password: '',
    other: '',
  });

  // Handle change for the inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrorMsg((prevError) => ({ ...prevError, other: '' }));

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Check if the input is empty to refresh error msg
    if (name === 'password') {
      setErrorMsg((prevError) => ({
        ...prevError,
        password: '',
      }));
    }
  };

  const handleSubmit = async () => {
    if (formData.password === '') {
      return setErrorMsg({
        ...errorMsg,
        password: 'Le champ mot de passe est obligatoire.',
      });
    }

    try {
      const response = await verifyIdentity(formData);
      if (response === 201) {
        setFormData({ password: '' });
        onLoginSuccess();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMsg({ ...errorMsg, other: error.message });
      } else {
        setErrorMsg({
          ...errorMsg,
          other: 'Une erreur est survenue. Veuillez réessayer.',
        });
      }
    }
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <DialogContent
        className="max-w-xs"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-5" />
            Vérification de votre identité
          </DialogTitle>
          <DialogDescription>
            Veuillez entrer votre mot de passe pour {reason}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={
                  errorMsg.password ? 'outline outline-1 outline-red-500' : ''
                }
                required
              />
              {errorMsg.password && (
                <p className="text-sm text-red-500">{errorMsg.password}</p>
              )}
            </div>
            {errorMsg.other && (
              <p className="text-sm text-red-500">{errorMsg.other}</p>
            )}
          </div>
        </form>
        <div className="flex w-full gap-4">
          <DialogClose className="w-1/2" asChild>
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </DialogClose>
          <Button
            className="w-1/2"
            type="button"
            onClick={handleSubmit}
            onKeyDown={handleKeyDown}
          >
            Vérifier
          </Button>
        </div>
      </DialogContent>
    </>
  );
};

export default LoginDialog;
