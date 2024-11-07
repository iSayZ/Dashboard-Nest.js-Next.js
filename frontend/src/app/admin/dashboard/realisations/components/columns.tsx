/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowUpDown,
  Clipboard,
  ExternalLink,
  MoreHorizontal,
  PencilLine,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { mutate } from 'swr';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { deleteRealisation, updateRealisation } from '@/api/realisationsApi';
import { formatDateForUX } from '@/lib/dateUtils';
import { Realisation } from '@/types/realisation.interface';

export const columns: ColumnDef<Realisation>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'header',
    header: 'En-tête',
    cell: ({ row }) => {
      const realisation = row.original;
      return (
        <Link
          href={realisation.header}
          target="_blank"
          className="block w-[75px]"
        >
          <AspectRatio ratio={1 / 1}>
            <Image
              src={realisation.header}
              alt={`En-tête de la réalisation ${realisation._id}`}
              fill
              className="rounded-md object-cover shadow-lg"
            />
          </AspectRatio>
        </Link>
      );
    },
  },
  {
    accessorKey: '_id',
    header: 'ID',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'title',
    header: 'Titre',
  },
  {
    accessorKey: 'updated_at',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Dernière modification
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.original.updated_at;
      return formatDateForUX(date.toString());
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      switch (status) {
        case 'active':
          return (
            <>
              <Badge className="bg-lime-500 font-semibold hover:bg-lime-500">
                Activé
              </Badge>
            </>
          );
        case 'desactive':
          return (
            <>
              <Badge className="bg-red-600 font-semibold hover:bg-red-600">
                Désactivé
              </Badge>
            </>
          );
        case 'draft':
          return (
            <>
              <Badge className="bg-amber-500 font-semibold hover:bg-amber-500">
                Brouillon
              </Badge>
            </>
          );
      }
    },
  },
  {
    accessorKey: 'tags',
    header: 'Mot clés',
  },
  {
    accessorKey: 'author',
    header: 'Auteur',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const realisation = row.original;
      const router = useRouter();

      // Function to go to the edition page
      const handleModify = () => {
        router.push(
          `/admin/dashboard/realisations/edition/${realisation.slug}`
        );
      };

      // Open popup to confirm deleting
      const deleteConfirmTrigger = useRef<HTMLButtonElement | null>(null);

      const handleShowDeleteConfirm = () => {
        if (deleteConfirmTrigger.current) {
          deleteConfirmTrigger.current.click();
        }
      };

      // Function to delete a realisation
      const handleDelete = async () => {
        try {
          await deleteRealisation(realisation._id);
          console.log('Réalisation supprimée avec succès.');
          mutate('/realisations');
        } catch (error) {
          console.error(
            'Erreur lors de la suppression de la réalisation:',
            error
          );
        }
      };

      // Function to change a status of a realisation
      const handleChangeStatus = async (
        statusSelected: Realisation['status']
      ) => {
        try {
          await updateRealisation(realisation.slug, { status: statusSelected });
          console.log('Statut de la réalisation changé avec succès.');
          mutate('/realisations');
        } catch (error) {
          console.error(
            'Erreur lors du changement de statut de la réalisation:',
            error
          );
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(realisation.slug)}
              >
                <Clipboard className="mr-2 size-4" />
                <span>Copier le slug de la réalisation</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleModify}>
                <PencilLine className="mr-2 size-4" />
                <span>Modifier la réalisation</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShowDeleteConfirm}>
                <Trash2 className="mr-2 size-4" />
                <span>Supprimer la réalisation</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="mr-2 size-4" />
                <Link href={`/${realisation.slug}`} target="_blank">
                  <span>Voir la réalisation</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Changer le statut</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      disabled={realisation.status === 'active' ? true : false}
                      onClick={() => handleChangeStatus('active')}
                    >
                      <span className="mr-2 size-2 rounded-full bg-lime-500" />
                      <span>Activer</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        realisation.status === 'desactive' ? true : false
                      }
                      onClick={() => handleChangeStatus('desactive')}
                    >
                      <span className="mr-2 size-2 rounded-full bg-red-600" />
                      <span>Désactiver</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={realisation.status === 'draft' ? true : false}
                      onClick={() => handleChangeStatus('draft')}
                    >
                      <span className="mr-2 size-2 rounded-full bg-amber-500" />
                      <span>Mettre en brouillon</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog>
            <AlertDialogTrigger ref={deleteConfirmTrigger}></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmer la Suppression</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer cette réalisation ? Cette
                  action est irréversible et toutes les données associées seront
                  définitivement perdues. Veuillez confirmer votre choix pour
                  continuer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
