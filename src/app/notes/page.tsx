import { DataTable } from "@/components/table/data-table";
import { getServerAuthSession } from "@/server/auth";
import { getNotes } from "@/server/notes";
import { redirect } from "next/navigation";
import { columns } from "@/components/table/columns";

export default async function NotesPage() {
  const session = await getServerAuthSession();
  const user = session?.user;
  if (!user) {
    redirect("/login");
  }

  const notes = await getNotes(user?.id);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-2">
      <DataTable
        className="h-48 min-h-full w-full max-w-sm sm:max-w-lg"
        columns={columns}
        data={notes}
        userId={user.id}
      />
    </main>
  );
}
