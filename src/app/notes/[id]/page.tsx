import { NoteEditor } from "@/components/editor/editor";
import { getNote } from "@/server/notes";

export default async function NoteIdPage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-2 p-2">
        <NoteEditor
          className="flex max-h-full w-full max-w-screen-xl flex-1"
          note={note!}
        />
      </div>
    </main>
  );
}
