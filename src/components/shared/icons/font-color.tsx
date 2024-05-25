import { cn } from "@/lib/utils";

export default function FontColor({ className }: { className: string }) {
  return (
    <svg
      className={cn("text-foreground", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <path
        fill="currentColor"
        d="M221.631 109 109.92 392h58.055l24.079-61h127.892l24.079 61h58.055L290.369 109Zm-8.261 168L256 169l42.63 108Z"
      />
    </svg>
  );
}
