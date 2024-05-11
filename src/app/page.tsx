import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="animate-linear bg-gradient-to-r from-red-600 via-indigo-500 to-red-600 bg-[length:200%_auto] bg-clip-text text-center text-6xl font-extrabold tracking-tight text-transparent sm:text-[5rem] lg:text-8xl lg:leading-tight">
          Note App
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl border bg-card p-4 hover:bg-accent"
            href="/"
          >
            <h3 className="text-2xl font-bold">Create New +</h3>
            <div className="text-lg">Create a new note from scratch.</div>
          </Link>
          <Link
            className="flex max-w-xs flex-col gap-4 rounded-xl border bg-card p-4 hover:bg-accent"
            href="/notes"
          >
            <h3 className="text-2xl font-bold">Browse Collection →</h3>
            <div className="text-lg">View your full collection of notes.</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
