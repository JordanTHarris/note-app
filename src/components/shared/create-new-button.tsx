"use client";

import { createNote } from "@/server/notes";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function CreateNewButton({
  className,
  userId,
}: {
  className?: string;
  userId: string;
}) {
  const router = useRouter();

  async function handleClick() {
    const note = await createNote(userId, "Untitled", "");
    const noteId = note.id;
    router.push(`/notes/${noteId}`);
  }

  return (
    <Button className={className} variant="secondary" size={"sm"} onClick={handleClick}>
      Create new <Plus className="h-4 w-4" />
    </Button>
  );
}
