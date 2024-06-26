"use client";

import * as React from "react";

import ColorPicker from "./ColorPicker";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { ChevronDown } from "lucide-react";
import { type LexicalEditor } from "lexical";

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
  color: string;
  editor: LexicalEditor;
  onChange?: (color: string, skipHistoryStack: boolean) => void;
};

export default function DropdownColorPicker({
  disabled = false,
  color,
  editor,
  onChange,
  children,
}: Props) {
  return (
    <Popover modal>
      <PopoverTrigger
        className="h-7 rounded-md border border-none px-2 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
      >
        <div className="flex items-center gap-1">
          <div
            className="h-4 w-4 rounded-sm border"
            style={{ backgroundColor: color }}
          ></div>
          {children}
          {/* <ChevronDown className="hidden h-5 w-5 opacity-50 xl:block" /> */}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-fit"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          editor.focus();
        }}
      >
        <ColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
