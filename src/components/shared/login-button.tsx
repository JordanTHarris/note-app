"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function LoginButton(props: ButtonProps) {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/login")} {...props}>
      Login
    </Button>
  );
}
