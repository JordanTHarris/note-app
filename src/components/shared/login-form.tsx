"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Bars } from "react-loader-spinner";
import { Discord } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const [discordLoading, setDiscordLoading] = useState(false);
  const color = "#5865F2";

  return (
    <div className="flex items-center justify-center">
      <Button
        disabled={discordLoading}
        variant="ghost"
        className="flex h-32 w-32 items-center justify-center space-x-3 rounded-full p-2 transition-all duration-75 focus:outline-none disabled:opacity-100"
        size="icon"
        onClick={() => {
          setDiscordLoading(true);
          void signIn("discord");
        }}
      >
        {discordLoading ? (
          // <LoadingDots className="bg-primary" />
          <Bars height="80" width="80" color={color} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Discord className="h-20 w-20" />
            <div className="h-1 w-16 animate-pulse" style={{ backgroundColor: color }} />
          </div>
        )}
      </Button>
    </div>
  );
};
