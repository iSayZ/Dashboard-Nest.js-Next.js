import { Pencil } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { updateAdminProfile } from '@/api/adminApi';
import { uploadAvatar } from '@/api/uploadApi';
import { formatDateForUX } from '@/lib/dateUtils';
import { AdminSettings } from '@/types/admin.interface';

interface ProfileProps {
  profileSettings: AdminSettings;
  handleChangeSettings: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}

const ProfileInformation: React.FC<ProfileProps> = ({
  profileSettings,
  handleChangeSettings,
}) => {
  // To update the avatar of settings
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState<string | null>(null);

  // Simulate click on hidden input file
  const handleUploadAvatarBtnClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Stock the new avatar and show the avatar with temporary url
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files;
    if (file) {
      setNewAvatar(file[0]);
      const url = URL.createObjectURL(file[0]);
      setNewAvatarUrl(url);
    }
  };

  // Submit information values
  const handleSubmitInformation = async () => {
    const profileData: {
      role: string;
      biography: string;
      avatar?: string;
    } = {
      role: profileSettings.role,
      biography: profileSettings.biography,
    };

    if (newAvatar) {
      try {
        const formData = new FormData();
        formData.append('avatar', newAvatar);
        const source = `${profileSettings?.firstname}-${profileSettings?.lastname}`;
        const avatarSrc = await uploadAvatar(formData, source.toLowerCase());
        console.log(avatarSrc);
        profileData.avatar = avatarSrc;
      } catch (e) {
        console.error(e);
      }
    }

    try {
      await updateAdminProfile(profileData);
      toast.success('Votre profil à bien été mis à jour.', {
        description: formatDateForUX(new Date().toISOString()),
        action: {
          label: 'Fermer',
          onClick: () => '',
        },
      });
    } catch {
      toast.error('Erreur lors de la mise à jour du profil.', {
        description: formatDateForUX(new Date().toISOString()),
        action: {
          label: 'Fermer',
          onClick: () => '',
        },
      });
    }
  };

  return (
    <>
      {/* Hidden input to change avatar */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>
            Apportez ici des modifications à votre profil. Cliquez sur
            enregistrer lorsque vous avez terminé.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6 flex items-center justify-around gap-12 max-lg:flex-col max-lg:items-center max-lg:gap-12">
          <div className="mb-auto flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Avatar className="size-52">
                <AvatarImage
                  src={
                    newAvatarUrl ? newAvatarUrl : `${profileSettings?.avatar}`
                  }
                />
                <AvatarFallback></AvatarFallback>
              </Avatar>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-3 top-3 z-10 rounded-full text-foreground"
                      onClick={handleUploadAvatarBtnClick}
                    >
                      <Pencil className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Modifier la photo de profil</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <h2 className="text-lg font-semibold">
              {profileSettings?.firstname} {profileSettings?.lastname}
            </h2>
          </div>
          <div className="w-2/3 space-y-6 max-lg:w-full">
            <div className="w-2/3 space-y-1 max-sm:w-full">
              <Label htmlFor="role">Rôle</Label>
              <Input
                id="role"
                placeholder="Ex: Responsable Marketing, Consultant(e)"
                value={profileSettings?.role}
                name="role"
                onChange={handleChangeSettings}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="biography">Biographie</Label>
              <AutosizeTextarea
                id="biography"
                maxHeight={300}
                placeholder="Décrivez votre parcours professionnel, vos compétences clés, et ce qui vous passionne dans votre domaine. Ex: Plus de 10 ans d'expérience dans le secteur, spécialisé(e) dans l'optimisation de processus et l'innovation technologique."
                value={profileSettings?.biography}
                name="biography"
                onChange={handleChangeSettings}
              />
            </div>
            <div className="flex w-full justify-center">
              <Button onClick={handleSubmitInformation}>
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProfileInformation;
