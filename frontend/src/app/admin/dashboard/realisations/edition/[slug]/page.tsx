'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import { Button } from '@/components/ui/button';

import { updateRealisation } from '@/api/realisationsApi';
import { uploadRealisationImage } from '@/api/uploadApi';
import { formatDateForUX } from '@/lib/dateUtils';
import { fetcher } from '@/lib/fetcher';
import { Realisation } from '@/types/realisation.interface';

import { Section } from '../../../components/template/TopbarMenu';
import { useModifyRealisation } from '../../../contexts/ModifyRealisationContext';
import { useVisitedSection } from '../../../contexts/VisitedSectionContext';

import ModifyRealisationFour from './steps/ModifyRealisationFour';
import ModifyRealisationOne from './steps/ModifyRealisationOne';
import ModifyRealisationThree from './steps/ModifyRealisationThree';
import ModifyRealisationTwo from './steps/ModifyRealisationTwo';

const section: Section = {
  items: [
    {
      path: '/admin/dashboard/accueil',
      name: 'Dashboard',
    },
    {
      path: '/admin/dashboard/realisations',
      name: 'Réalisations',
    },
  ],
  page: {
    path: '/admin/dashboard/realisation/edition',
    name: 'Editer une realisation',
  },
};

interface ModifyRealisationProps {
  params: {
    slug: string;
  };
}

const ModifyRealisationPage: React.FC<ModifyRealisationProps> = ({
  params,
}) => {
  const {
    step,
    setStep,
    setContent,
    content,
    formData,
    setFormData,
    header,
    setFormErrors,
  } = useModifyRealisation();

  const { setVisitedSection } = useVisitedSection();

  useEffect(() => {
    setVisitedSection(section);
  }, [setVisitedSection]);

  const router = useRouter();
  const { slug } = params;

  const {
    data: realisation,
    isLoading,
    error,
  } = useSWR<Realisation>(`/realisations/${slug}`, fetcher);

  useEffect(() => {
    if (realisation) {
      setFormData({
        title: realisation.title,
        slug: realisation.slug,
        tags: realisation.tags,
        status: realisation.status,
        header: realisation.header,
      });
      setContent(realisation.content);
    }
  }, [realisation, setFormData, setContent]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    // Ajout de l'événement beforeunload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Nettoyage de l'événement avant le démontage du composant
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // To go to previous step
  const handlePrevStep = () => {
    setStep((step) => step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // To go to next step
  const handleNextStep = () => {
    // Condition of step 1
    if (step === 1 && (!formData.title || !formData.slug)) {
      if (!formData.title) {
        setFormErrors((prev) => ({
          ...prev,
          title: 'Le champ titre est obligatoire.',
        }));
      }
      if (!formData.slug) {
        setFormErrors((prev) => ({
          ...prev,
          slug: 'Le champ slug est obligatoire.',
        }));
      }
      return;
    }

    // Condition of step 2
    if (step === 2 && !content) {
      return setFormErrors((prev) => ({
        ...prev,
        content: 'Le champ contenu est obligatoire.',
      }));
    }

    // Condition of step 3
    if (step === 3 && !formData.header) {
      return setFormErrors((prev) => ({
        ...prev,
        header: "L'image d'en-tête est obligatoire.",
      }));
    }

    setStep((step) => step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step Informations
  const [stepInfo, setStepInfo] = useState<string>('');

  // Return details according to current step
  useEffect(() => {
    switch (step) {
      case 1:
        setStepInfo("Renseignez le titre, le slug de l'article.");
        break;
      case 2:
        setStepInfo('Rédigez votre article.');
        break;
      case 3:
        setStepInfo(
          "Ajoutez les tags, sélectionnez le statut et téléchargez l'image d'en-tête."
        );
        break;
      default:
        setStepInfo('Revoyez et finalisez votre article avant publication.');
        break;
    }
  }, [step]);

  const extractImageSourcesFromHtml = (htmlString: string) => {
    const imageSources: string[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Select all <img>
    doc.querySelectorAll('img').forEach((img) => {
      // Get only path of src
      const path = img.src.split(`${process.env.NEXT_PUBLIC_API_BASE_URL}`)[1];
      imageSources.push(path);
    });

    // Return array of path src
    return imageSources;
  };

  // Submit to create realisation
  const handleSubmit = async () => {
    const imageUrls = extractImageSourcesFromHtml(content);

    const realisation = {
      ...formData,
      content,
      imageUrls,
    };

    if (header) {
      // Prepare header to upload
      const image = new FormData();
      image.append('file', header);

      // Uploading header
      const srcHeader = await uploadRealisationImage(image, formData.slug);

      realisation.header = srcHeader;
    }

    // Call API to create
    try {
      const response = await updateRealisation(slug, realisation);
      if (response.success) {
        toast.success('Réalisation publié avec succès.', {
          description: formatDateForUX(new Date().toISOString()),
          action: {
            label: 'Fermer',
            onClick: () => '',
          },
        });
        router.push('/admin/dashboard/realisations');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la publication.', {
        description: formatDateForUX(new Date().toISOString()),
        action: {
          label: 'Fermer',
          onClick: () => '',
        },
      });
    }
  };

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

  if (error || !realisation) {
    return <div>Erreur lors du chargement de la réalisation.</div>;
  }

  return (
    <div className="m-auto size-full space-y-10 2xl:w-2/3">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          Modifier la réalisation : <span className="font-normal">{slug}</span>
        </h1>
        <h2 className="italic">
          Étape {step} - {stepInfo}
        </h2>
      </div>
      <div>
        {step === 1 && <ModifyRealisationOne />}
        {step === 2 && <ModifyRealisationTwo />}
        {step === 3 && <ModifyRealisationThree />}
        {step === 4 && <ModifyRealisationFour />}
      </div>
      <div className="flex w-full justify-between">
        <Button variant="destructive">Annuler</Button>
        <div className="space-x-4">
          {step > 1 && <Button onClick={handlePrevStep}>Précédent</Button>}
          {step < 4 ? (
            <Button onClick={handleNextStep}>Suivant</Button>
          ) : (
            <Button onClick={handleSubmit}>Mettre à jour</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifyRealisationPage;
