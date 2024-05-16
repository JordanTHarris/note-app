"use server";

import { db } from "@/server/db";

export async function getNote(id: string) {
  const note = await db.note.findUnique({
    where: {
      id: Number(id).valueOf(),
    },
  });
  return note;
}

export async function getNotes(userId: string) {
  const notes = await db.note.findMany({
    where: {
      createdBy: {
        id: userId,
      },
    },
  });

  return notes;
}

export async function createNote(userId: string, title: string, content: string) {
  const noteCount = await db.note.count(); // Add count for testing
  const note = await db.note.create({
    data: {
      title: `${title} ${noteCount + 1}`,
      content: content,
      createdBy: {
        connect: {
          id: userId,
        },
      },
    },
  });
  return note;
}

export async function deleteNote(id: number) {
  const note = await db.note.delete({
    where: {
      id: id,
    },
  });
  return note;
}
