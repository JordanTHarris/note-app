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
  const note = await db.note.create({
    data: {
      title: title,
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
