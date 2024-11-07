'use client';

import { Clock, Eye, File, TrendingDown } from 'lucide-react';
import { useEffect } from 'react';
import useSWR from 'swr';

import { Skeleton } from '@/components/ui/skeleton';

import { formatDateForUX } from '@/lib/dateUtils';
import { fetcher } from '@/lib/fetcher';
import { AdminProfile } from '@/types/admin.interface';

import { Section } from '../components/template/TopbarMenu';
import { useVisitedSection } from '../contexts/VisitedSectionContext';

import IndicatorCard from './components/IndicatorCard';
import VisitorChart from './components/VisitorChart';

const section: Section = {
  items: [],
  page: {
    path: '/admin/dashboard/accueil',
    name: 'Accueil dashboard',
  },
};

const Index: React.FC = () => {
  const { setVisitedSection } = useVisitedSection();

  useEffect(() => {
    setVisitedSection(section);
  }, [setVisitedSection]);

  const {
    data: profile,
    error,
    isLoading,
  } = useSWR<AdminProfile | null>('/admin/profile', fetcher);

  if (error) return <div>Erreur de chargement du profil.</div>;

  if (isLoading) {
    return (
      <div className="flex size-full flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-6 w-3/5" />
        </div>
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        </div>
        <div className="mx-auto w-full">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-full flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bonjour {profile?.firstname} !
        </h1>
        <p className="text-sm italic">
          Dernière connexion le {profile && formatDateForUX(profile.last_login)}
        </p>
      </div>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <IndicatorCard
            title="Total des visites"
            icon={<Eye />}
            value={130}
            analyze="+10% par rapport au mois dernier"
          />
          <IndicatorCard
            title="Taux de Rebond"
            icon={<TrendingDown />}
            value="55 / 130"
            analyze="-2% par rapport au mois dernier"
          />
          <IndicatorCard
            title="Pages par session"
            icon={<File />}
            value={3}
            analyze="+5% par rapport au mois dernier"
          />
          <IndicatorCard
            title="Durée moy. session"
            icon={<Clock />}
            value="146 sec"
            analyze="+17sec par rapport au mois dernier"
          />
        </div>
      </div>
      <div className="mx-auto w-full">
        <VisitorChart />
      </div>
    </div>
  );
};

export default Index;
