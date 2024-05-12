"use client";

// import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      // className={cn(className)}
    >
      <Sun
        className={cn(
          className,
          "absolute rotate-0 scale-75 text-amber-600 transition-all dark:-rotate-90 dark:scale-0",
        )}
      />
      <Moon
        className={cn(
          className,
          "absolute rotate-90 scale-0 text-indigo-400 transition-all dark:rotate-0 dark:scale-75",
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
