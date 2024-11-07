import { ShieldCheck, ShieldX } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import { AdminSettings } from '@/types/admin.interface';

import Activate2FA from './Activate2FA';
import Desactivate2FA from './Desactivate2FA';
import GenerateBackupCode2FA from './GenerateBackup2FA';
import Info2FA from './Info2FA';

interface Settings2FAProps {
  profileSettings: AdminSettings;
}

const Settings2FA: React.FC<Settings2FAProps> = ({ profileSettings }) => {
  return (
    <div className="flex size-full flex-col gap-6">
      <div className="flex items-center justify-center gap-4">
        <h2 className="text-center text-lg font-semibold">
          Authentification à deux facteurs (2FA)
        </h2>
        <p className="text-lg font-semibold">-</p>
        {profileSettings.two_fa_enabled ? (
          <Badge className="bg-lime-500 text-sm font-semibold text-secondary hover:bg-lime-500">
            Activé
            <ShieldCheck className="ml-2 size-4" />
          </Badge>
        ) : (
          <Badge className="bg-red-600 text-sm font-semibold text-secondary hover:bg-red-600">
            Désactivé
            <ShieldX className="ml-2 size-4" />
          </Badge>
        )}
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Pour renforcer la sécurité de votre compte, nous vous recommandons
        d'activer l'authentification à deux facteurs (2FA). Cette fonctionnalité
        ajoute une couche de protection supplémentaire en vous demandant, en
        plus de votre mot de passe, de saisir un code de vérification généré sur
        votre téléphone via une application comme Google Authenticator.
      </p>
      <hr className="m-auto h-[2px] w-2/3" />
      <div className="mt-2 flex w-full justify-center gap-4">
        {profileSettings.two_fa_enabled ? (
          <>
            <GenerateBackupCode2FA />
            <Desactivate2FA />
          </>
        ) : (
          <>
            <Info2FA />
            <Activate2FA />
          </>
        )}
      </div>
    </div>
  );
};

export default Settings2FA;
