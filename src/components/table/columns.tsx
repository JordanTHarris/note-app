"use client";

import { type Note } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowUp, MoreHorizontal, Trash2 } from "lucide-react";
import { deleteNote } from "@/server/notes";
import { useRouter } from "next/navigation";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Note>[] = [
  {
    accessorKey: "title",
    sortingFn: "alphanumeric",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          className="group w-full justify-start"
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Title
          <div className="ml-2 h-4 w-4">
            {isSorted === "asc" && (
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            )}
            {isSorted === "desc" && <ArrowUp className="h-4 w-4 text-muted-foreground" />}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => {
      const { title } = row.original;
      return <div className="w-32 truncate font-medium">{title}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    sortingFn: "datetime",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          className="group w-full justify-start"
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Created at
          <div className="ml-2 h-4 w-4">
            {isSorted === "asc" && (
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            )}
            {isSorted === "desc" && <ArrowUp className="h-4 w-4 text-muted-foreground" />}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => {
      const { createdAt } = row.original;
      const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    sortingFn: "datetime",
    header: ({ column }) => {
      const isSorted = column.getIsSorted();
      return (
        <Button
          className="group w-full justify-start"
          variant="ghost"
          onClick={() => column.toggleSorting(isSorted === "asc")}
        >
          Updated at
          <div className="ml-2 h-4 w-4">
            {isSorted === "asc" && (
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            )}
            {isSorted === "desc" && <ArrowUp className="h-4 w-4 text-muted-foreground" />}
          </div>
        </Button>
      );
    },
    cell: ({ row }) => {
      const { updatedAt } = row.original;
      const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return <div className="font-medium">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const noteId = row.original.id;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useRouter();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            <DropdownMenuItem
              className="group hover:!bg-destructive"
              onClick={(e) => {
                e.stopPropagation();
                void deleteNote(noteId);
                router.refresh();
              }}
            >
              <Trash2 className="mr-1 h-4 w-4 text-destructive group-hover:text-destructive-foreground" />
              <span className="text-destructive group-hover:text-destructive-foreground">
                Delete
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
