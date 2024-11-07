import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { AdminSettings } from '@/types/admin.interface';

import Settings2FA from './2FA/Settings2FA';
import EmailDialog from './email/EmailDialog';
import PasswordDialog from './password/PasswordDialog';

interface SecurityProps {
  profileSettings: AdminSettings;
}

const SecuritySettings: React.FC<SecurityProps> = ({ profileSettings }) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sécurité</CardTitle>
          <CardDescription>
            Modifiez ici vos paramètres de sécurité.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex size-full justify-around max-xl:mt-6 max-xl:flex-col max-xl:gap-12">
            <div className="flex flex-col justify-center gap-4  max-xl:flex-row max-xl:gap-6 max-sm:m-auto max-sm:flex-col">
              <EmailDialog />
              <PasswordDialog />
            </div>
            <div className="w-[2px] bg-muted-foreground/30 max-xl:h-px max-xl:w-full" />
            <div className="w-1/2 max-xl:w-full">
              <Settings2FA profileSettings={profileSettings} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default SecuritySettings;
