'use client';

import React, { useEffect } from 'react';
import useSWR from 'swr';

import { fetcher } from '@/lib/fetcher';
import { Realisation } from '@/types/realisation.interface';

import { Section } from '../components/template/TopbarMenu';
import { useVisitedSection } from '../contexts/VisitedSectionContext';

import { columns } from './components/columns';
import { DataTable } from './components/data-table';

const section: Section = {
  items: [
    {
      path: '/admin/dashboard/accueil',
      name: 'Dashboard',
    },
  ],
  page: {
    path: '/admin/dashboard/realisations',
    name: 'Liste des réalisations',
  },
};

const Realisations: React.FC = () => {
  // Update the section for breadcrumb into topbarMenu
  const { setVisitedSection } = useVisitedSection();

  useEffect(() => {
    setVisitedSection(section);
  }, [setVisitedSection]);

  const {
    data: realisations,
    isLoading,
    error,
  } = useSWR<Realisation[]>('/realisations', fetcher);

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

  if (error || !realisations) {
    return <div>Erreur lors du chargement des réalisations.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <DataTable columns={columns} data={realisations} />
    </div>
  );
};

export default Realisations;
