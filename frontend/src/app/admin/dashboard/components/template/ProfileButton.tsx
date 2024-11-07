import { ChevronsUpDown, House, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import useSWR from 'swr';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';

import { logout } from '@/api/authApi';
import { fetcher } from '@/lib/fetcher';
import { AdminProfile } from '@/types/admin.interface';

const ProfileButton: React.FC = () => {
  const { data: profile } = useSWR<AdminProfile | null>(
    '/admin/profile',
    fetcher
  );

  const router = useRouter();
  const { isMobile } = useSidebar();
  const [open, setOpen] = useState<boolean>(false);

  const goToSettingsPage = () => {
    router.push('/admin/dashboard/parametres');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/admin/connexion');
    } catch (error) {
      console.error('Erreur lors de la déconnexion : ', error);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={
              open
                ? 'size-full bg-accent p-2 text-accent-foreground'
                : 'size-full p-2'
            }
          >
            <div className="flex w-full items-center gap-2">
              <Avatar className="size-8 rounded-md">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback></AvatarFallback>
              </Avatar>
              <div className="flex flex-col justify-center overflow-hidden text-left">
                <p className="w-full truncate text-sm font-bold">
                  {profile?.firstname} {profile?.lastname}
                </p>
                <p className="w-full truncate text-xs font-normal text-muted-foreground">
                  {profile?.role}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="size-5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={isMobile ? 'center' : 'end'}
          side={isMobile ? 'bottom' : 'right'}
        >
          <DropdownMenuLabel>
            <div className="w-full">
              <div className="flex w-52 max-w-60 items-center gap-2">
                <Avatar className="size-7 rounded-md">
                  <AvatarImage src={profile?.avatar} />
                  <AvatarFallback></AvatarFallback>
                </Avatar>
                <div className="flex w-full flex-col items-start justify-center overflow-hidden text-left">
                  <p className="w-full truncate text-xs font-bold">
                    {profile?.firstname} {profile?.lastname}
                  </p>
                  <p className="w-full truncate text-[0.65rem] font-normal leading-[0.9rem] text-muted-foreground">
                    {profile?.role}
                  </p>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={goToSettingsPage}>
            <Settings className="mr-2 size-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <House className="mr-2 size-4" />
            <Link href="/">Retour au site</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ProfileButton;
