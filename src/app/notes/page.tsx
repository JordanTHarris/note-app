import { NoteList } from "@/components/layout/note-list";
import { getServerAuthSession } from "@/server/auth";
import { getNotes } from "@/server/notes";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  const notes = await getNotes(user?.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-2">
      <NoteList className="w-full max-w-md lg:max-w-lg" notes={notes} userId={user.id} />
    </main>
  );
}
