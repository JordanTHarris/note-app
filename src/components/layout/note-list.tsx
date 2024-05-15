"use client";

import { cn } from "@/lib/utils";
import { User, type Note } from "@prisma/client";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateNewButton } from "../shared/create-new-button";
import { useRouter } from "next/navigation";

export function NoteList({
  className,
  notes,
  userId,
}: {
  className?: string;
  notes: Note[];
  userId: string;
}) {
  const router = useRouter();

  function handleClick(noteId: number) {
    void router.push(`/notes/${noteId}`);
  }
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Created at</TableHead>
            <TableHead>Updated at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((note) => (
            <TableRow
              className="cursor-pointer"
              key={note.id}
              onClick={() => handleClick(note.id)}
            >
              <TableCell className="font-medium">{note?.title}</TableCell>
              <TableCell className="">{note?.createdAt.toDateString()}</TableCell>
              <TableCell className="">{note?.updatedAt.toDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CreateNewButton className="" userId={userId} />
    </div>
  );
}
