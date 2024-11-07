'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowLeftRight,
  PencilLine,
  PlusCircleIcon,
  Settings,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { deleteRealisation } from '@/api/realisationsApi';

interface DataWithIdAndSlug {
  _id: string;
  slug: string;
}

interface DataTableProps<TData extends DataWithIdAndSlug, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends DataWithIdAndSlug, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(5);
  const [totalItems, setTotalItems] = useState<number>(data.length);
  const totalPages = Math.ceil(totalItems / pageSize);
  const [paginatedData, setPaginatedData] = useState<TData[]>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  // State to change default column visibility
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      _id: false,
      desc: false,
      tags: false,
      author: false,
    });

  const [rowSelection, setRowSelection] = React.useState({});

  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Calcul data of pagination
  useEffect(() => {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    setPaginatedData(data.slice(start, end));
  }, [data, pageIndex, pageSize]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      columnVisibility,
      rowSelection,
      sorting,
    },
  });

  const router = useRouter();

  // Function to go to the creation page
  const handleCreate = () => {
    router.push('/admin/dashboard/realisations/creation');
  };

  // Function to go to the edition page
  const handleModify = () => {
    const selectedRow =
      table.getFilteredSelectedRowModel().rows[0].original.slug;
    router.push(`/admin/dashboard/realisations/${selectedRow}/edition`);
  };

  // Function to delete a realisation selection
  const handleDeleteSelection = async () => {
    const selectedRows = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original);

    for (const realisation of selectedRows) {
      try {
        await deleteRealisation(realisation._id);
        console.log(`Réalisation ${realisation._id} supprimée avec succès.`);
        mutate('/realisations');
      } catch (error) {
        console.error(
          `Erreur lors de la suppression de la réalisation ${realisation._id}:`,
          error
        );
      }
    }
  };

  // Function to go to the order page
  const goToSortingPage = () => {
    router.push('/admin/dashboard/realisations/ordre');
  };

  return (
    <div>
      <div className="max-md:flew-wrap flex items-center pb-4 max-md:flex-col max-md:items-start max-md:gap-4">
        <Input
          placeholder="Rechercher par titre..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="mr-4 max-w-96 bg-background"
        />
        <div className="ml-auto flex items-center space-x-2 max-md:ml-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreate} variant="outline" size="icon">
                  <PlusCircleIcon className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Nouvelle réalisation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleModify}
                  variant="outline"
                  size="icon"
                  disabled={
                    table.getFilteredSelectedRowModel().rows.length === 1
                      ? false
                      : true
                  }
                >
                  <PencilLine className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Modifier la réalisation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DropdownMenu>
                  <AlertDialog>
                    <AlertDialogTrigger className="ml-auto" asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        disabled={
                          table.getFilteredSelectedRowModel().rows.length > 0
                            ? false
                            : true
                        }
                      >
                        <Trash2 className="size-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Confirmer la Suppression
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer ces réalisations ?
                          Cette action est irréversible et toutes les données
                          associées seront définitivement perdues. Veuillez
                          confirmer votre choix pour continuer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSelection}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Supprimer la sélection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={goToSortingPage} variant="outline" size="icon">
                  <ArrowLeftRight className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Réorganiser les ordres de publication</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Affichage</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id === 'updatedAt'
                              ? 'Dernière modification'
                              : column.columnDef.header?.toString()}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paramètres des colonnes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="rounded-md border bg-background shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 pt-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{' '}
          {table.getFilteredRowModel().rows.length} ligne(s) selectionée(s).
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          Précédente
        </Button>
        <span className="">
          Page {pageIndex + 1} sur {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex + 1 >= totalPages}
        >
          Suivante
        </Button>
      </div>
    </div>
  );
}
