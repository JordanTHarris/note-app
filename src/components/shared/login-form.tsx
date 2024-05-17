"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Bars } from "react-loader-spinner";
import { Discord, Google } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [discordLoading, setDiscordLoading] = useState(false);
  const googleColor = "#FBBD0A";
  const discordColor = "#5865F2";

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        disabled={googleLoading}
        variant="ghost"
        className="flex h-32 w-32 items-center justify-center space-x-3 rounded-full p-2 transition-all duration-75 focus:outline-none disabled:opacity-100"
        size="icon"
        onClick={() => {
          setGoogleLoading(true);
          void signIn("google");
        }}
      >
        {googleLoading ? (
          <Bars height="80" width="80" color={googleColor} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Google className="h-20 w-20" />
            <div
              className="h-1 w-16 animate-pulse"
              style={{ backgroundColor: googleColor }}
            />
          </div>
        )}
      </Button>
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
          <Bars height="80" width="80" color={discordColor} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Discord className="h-20 w-20" />
            <div
              className="h-1 w-16 animate-pulse"
              style={{ backgroundColor: discordColor }}
            />
          </div>
        )}
      </Button>
    </div>
  );
};
