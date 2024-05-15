import { getNote } from "@/server/notes";

export default async function NoteIdPage({ params }: { params: { id: string } }) {
  const note = await getNote(params.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center">
        <h1>{note?.title}</h1>
      </div>
    </main>
  );
}
