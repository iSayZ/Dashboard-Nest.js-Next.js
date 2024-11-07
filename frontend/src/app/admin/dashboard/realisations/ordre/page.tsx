'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { Button } from '@/components/ui/button';

import { updateOrderRealisation } from '@/api/realisationsApi';
import { formatDateForUX } from '@/lib/dateUtils';
import { fetcher } from '@/lib/fetcher';
import { Realisation } from '@/types/realisation.interface';

import { Section } from '../../components/template/TopbarMenu';
import { useVisitedSection } from '../../contexts/VisitedSectionContext';

import Item from './components/Item';
import SortableItem from './components/SortableItem';

const EditRealisation: React.FC = () => {
  // Update the section for breadcrumb into topbarMenu
  const { setVisitedSection } = useVisitedSection();

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
      path: '/admin/dashboard/realisation/ordre',
      name: `Réorganisation de l'ordre d'affichage`,
    },
  };

  useEffect(() => {
    setVisitedSection(section);
  }, [setVisitedSection]);

  const {
    data: items,
    isLoading,
    error,
  } = useSWR<Realisation[]>('/realisations/active', fetcher);

  // Manage the state of items and active item being dragged
  const [activeItem, setActiveItem] = useState<Realisation>(); // Track the item being dragged
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor)); // Define sensors for drag-and-drop

  // Local state for temporarily rearranged items
  const [tempItems, setTempItems] = useState<Realisation[] | undefined>(items);

  useEffect(() => {
    // Sync tempItems with items loaded from SWR
    if (items) {
      setTempItems(items);
    }
  }, [items]);

  // Function to handle drag start event
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveItem(items?.find((item) => item._id === active.id)); // Set active item when drag starts
  };

  // Function to handle drag end event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !tempItems) return;

    // Trouver les index de l'élément actif et de l'élément cible
    const activeIndex = tempItems.findIndex((item) => item._id === active.id);
    const overIndex = tempItems.findIndex((item) => item._id === over.id);

    if (activeIndex !== overIndex) {
      // Appliquer arrayMove sur l'état local temporaire
      const newOrder = arrayMove(tempItems, activeIndex, overIndex);
      setTempItems(newOrder); // Mise à jour temporaire pour l'affichage immédiat

      // Mettre à jour SWR sans re-fetch immédiat
      mutate('/realisations/active', newOrder, false);
    }
    setActiveItem(undefined); // Réinitialiser l'élément actif
  };

  const handleDragCancel = () => {
    setActiveItem(undefined); // Reset active item when drag is canceled
  };

  // Handle saving the current order
  const handleButtonClick = async () => {
    const itemIds: { slug: string; order: number }[] | undefined = items?.map(
      (item, index) => ({
        slug: item.slug,
        order: index + 1,
      })
    );

    try {
      if (!itemIds) throw error;
      const response = await updateOrderRealisation(itemIds);
      if (response.success) {
        toast.success('Ordre des articles mis à jour avec succès.', {
          description: formatDateForUX(new Date().toISOString()),
          action: {
            label: 'Fermer',
            onClick: () => '',
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour de l'ordre des articles.", {
        description: formatDateForUX(new Date().toISOString()),
        action: {
          label: 'Fermer',
          onClick: () => '',
        },
      });
    }
  };

  // Reset the order to the original array
  const handleRefresh = () => {
    mutate('/realisations/active');
    alert('Ordre réinitialisé !');
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

  if (error || !items) {
    return <div>Erreur lors du chargement des réalisations.</div>;
  }

  return (
    <>
      {/* Header and description */}
      <h2 className="text-xl font-semibold">
        Déplacez les images des articles en fonction de l'ordre d'affichage
        désiré.
      </h2>
      <p className="italic text-muted-foreground">
        Seuls les articles ayant l'état "
        <span className="font-semibold text-lime-500">Activé</span>" seront
        visibles ici.
      </p>

      {/* DndContext for handling drag and drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // Collision detection strategy
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map((item) => ({ id: item.order }))}
          strategy={rectSortingStrategy}
        >
          {' '}
          {/* Define the sorting strategy */}
          <div className="mx-auto my-8 grid grid-cols-6 gap-4">
            {' '}
            {/* Grid layout for items */}
            {items?.map((item, index) => (
              <SortableItem key={item._id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
        <DragOverlay adjustScale style={{ transformOrigin: '0 0 ' }}>
          {' '}
          {/* Overlay to show the item being dragged */}
          {activeItem ? <Item item={activeItem} isDragging /> : null}{' '}
          {/* Render the active item during drag */}
        </DragOverlay>
      </DndContext>

      {/* Action buttons */}
      <div className="flex w-full gap-4">
        <Button
          onClick={handleButtonClick}
          className="bg-lime-600 hover:bg-lime-600/85"
        >
          Sauvegarder cet ordre
        </Button>
        <Button onClick={handleRefresh} variant="destructive">
          Annuler les changements
        </Button>
      </div>
    </>
  );
};

export default EditRealisation;
