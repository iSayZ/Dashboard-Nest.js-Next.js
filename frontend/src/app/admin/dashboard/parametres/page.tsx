'use client';

import { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { fetcher } from '@/lib/fetcher';
import { AdminSettings } from '@/types/admin.interface';

import { Section } from '../components/template/TopbarMenu';
import { useVisitedSection } from '../contexts/VisitedSectionContext';

import ProfileInformation from './components/ProfileInformation';
import SecuritySettings from './components/SecuritySettings';

const section: Section = {
  items: [
    {
      path: '/admin/dashboard/accueil',
      name: 'Dashboard',
    },
  ],
  page: {
    path: '/admin/dashboard/parametres',
    name: 'Paramètres',
  },
};

const ProfileSettings: React.FC = () => {
  // Update the section for breadcrumb into topbarMenu
  const { setVisitedSection } = useVisitedSection();

  useEffect(() => {
    setVisitedSection(section);
  }, [setVisitedSection]);

  const {
    data: profileSettings,
    isLoading,
    error,
  } = useSWR<AdminSettings>('/admin/settings', fetcher);

  // To switch section tab
  const [sectionValue, setSectionValue] = useState<string>('du Profil');

  const handleSwitchSection = (value: string) => {
    setSectionValue(value);
  };

  // To update new value of settings
  const handleChangeSettings = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Optimistically update the profileSettings state
    const updatedProfileSettings = { ...profileSettings, [name]: value };
    mutate('/admin/settings', updatedProfileSettings, false); // Update the cached data without revalidation
  };

  // Loading to wait data initializing
  if (isLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <div
          className="inline-block size-12 animate-spin rounded-full border-[3px] border-current border-t-transparent text-foreground"
          role="status"
          aria-label="loading"
        ></div>
      </div>
    );
  }

  if (error || !profileSettings) {
    return <div>Erreur lors du chargement des paramètres du profil.</div>;
  }

  return (
    <>
      <div className="flex size-full items-center justify-center">
        <Tabs defaultValue="profile" className="size-full">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-max grid-cols-2">
              <TabsTrigger
                value="profile"
                onClick={() => handleSwitchSection('du Profil')}
                className="px-12"
              >
                Profil
              </TabsTrigger>
              <TabsTrigger
                value="security"
                onClick={() => handleSwitchSection('de Sécurité')}
                className="px-12"
              >
                Sécurité
              </TabsTrigger>
            </TabsList>
            <h2 className="text-xl font-semibold max-sm:hidden">
              Paramètres {sectionValue}
            </h2>
          </div>
          <TabsContent value="profile">
            <ProfileInformation
              profileSettings={profileSettings}
              handleChangeSettings={handleChangeSettings}
            />
          </TabsContent>
          <TabsContent value="security">
            <SecuritySettings profileSettings={profileSettings} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProfileSettings;
