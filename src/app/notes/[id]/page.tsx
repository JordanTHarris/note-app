import { Editor } from "@/components/editor/editor";
import { getNote } from "@/server/notes";

export default async function NoteIdPage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-2">
        <h1 className="text-xl">{note?.title}</h1>
        <Editor className="w-full max-w-lg flex-1" />
      </div>
    </main>
  );
}
