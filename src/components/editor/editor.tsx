"use client";

import "./editor-styles.css";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { editorTheme } from "./editor-theme";
import { cn } from "@/lib/utils";

function Placeholder() {
  return (
    <div className="pointer-events-none absolute left-0 top-0 inline-block select-none truncate px-4 py-2 text-muted">
      Enter some rich text...
    </div>
  );
}

const editorConfig = {
  namespace: "React.js Demo",
  nodes: [],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme: editorTheme,
};

export function Editor({ className }: { className?: string }) {
  return (
    <div className={cn("flex rounded-md border", className)}>
      <LexicalComposer initialConfig={editorConfig}>
        <div className={cn("flex flex-1 flex-col")}>
          <ToolbarPlugin />
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
