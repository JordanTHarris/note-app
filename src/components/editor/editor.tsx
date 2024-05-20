"use client";

import "./editor-styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { editorTheme } from "./editor-theme";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { type Note } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateTitle } from "@/server/notes";
import { EditReadModePlugin } from "./plugins/EditReadModePlugin";

function Placeholder() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 inline-block select-none truncate px-4 py-2 text-muted-foreground">
      Enter some rich text...
    </div>
  );
}

const editorConfig = {
  namespace: "Note",
  nodes: [],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: editorTheme,
};

export function Editor({ className, note }: { className?: string; note: Note }) {
  const router = useRouter();

  async function handleTitleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.currentTarget.blur();
    }
  }

  async function handleTitleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const newTitle = event.currentTarget.value;

    // Reset to previous title if input is empty
    if (newTitle === "") {
      event.currentTarget.value = note.title;
      return;
    }

    try {
      await updateTitle(note.id, newTitle);
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSave() {
    console.log("save");
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-20 items-center justify-start">
          <Button
            className="h-8 w-8"
            variant="ghost"
            size="icon"
            onClick={() => router.push("/notes")}
          >
            <ArrowLeft />
          </Button>
        </div>
        <Input
          className="max-w-72 border-none text-center text-xl font-semibold"
          defaultValue={note?.title}
          onKeyDown={handleTitleKeyDown}
          onBlur={handleTitleBlur}
        />
        <div className="flex w-20 justify-end">
          <Button variant="secondary" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
      <LexicalComposer initialConfig={editorConfig}>
        <div className={cn("flex flex-1 flex-col rounded-md border")}>
          <div className="flex items-start justify-between border-b">
            <ToolbarPlugin />
            <EditReadModePlugin />
          </div>
          <div className="relative flex h-full">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  // className="editor-input"
                  className="relative min-h-40 flex-1 resize-none px-4 py-2 text-base outline-none"
                />
              }
              placeholder={<Placeholder />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            {/* <TreeViewPlugin /> */}
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
