'use client';

import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

import { Section } from '../../../components/topbarMenu';
import { useVisitedSection } from '../../../VisitedSectionContext';

const EditRealisation: React.FC = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  // Update the section for breadcrumb into topbarMenu
  const { setVisitedSection } = useVisitedSection();

  const section: Section = {
    items: [
      {
        path: '/dashboard',
        name: 'Dashboard',
      },
      {
        path: '/dashboard/realisations',
        name: 'Réalisations',
      },
    ],
    page: {
      path: '/dashboard/realisation/:slug/edition',
      name: `Édition de ${slug}`,
    },
  };

  useEffect(() => {
    setVisitedSection(section);
  }, [setVisitedSection]);

  return <h1 className="text-2xl font-bold">Edition de {slug}</h1>;
};

export default EditRealisation;