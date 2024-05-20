"use client";

import { ActionTooltip } from "@/components/shared/action-tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  return (
    <div className="mb-1 flex flex-wrap gap-1 p-1" ref={toolbarRef}>
      <ActionTooltip label="Undo">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          className="text-muted-foreground"
          aria-label="Undo"
        >
          <Undo />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Redo">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          className="text-muted-foreground"
          aria-label="Redo"
        >
          <Redo />
        </Button>
      </ActionTooltip>
      <Divider />
      <ActionTooltip label="Bold">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          className={cn(
            "text-muted-foreground",
            isBold && "bg-secondary text-foreground",
          )}
          aria-label="Format Bold"
        >
          <Bold />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Italic">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          className={cn(
            "text-muted-foreground",
            isItalic && "bg-secondary text-foreground",
          )}
          aria-label="Format Italics"
        >
          <Italic />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Underline">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          className={cn(
            "text-muted-foreground",
            isUnderline && "bg-secondary text-foreground",
          )}
          aria-label="Format Underline"
        >
          <Underline />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Strikethrough">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
          }}
          className={cn(
            "text-muted-foreground",
            isStrikethrough && "bg-secondary text-foreground",
          )}
          aria-label="Format Strikethrough"
        >
          <Strikethrough />
        </Button>
      </ActionTooltip>
      <Divider />
      <ActionTooltip label="Left Align">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
          className="text-muted-foreground"
          aria-label="Left Align"
        >
          <AlignLeft />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Center Align">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
          className="text-muted-foreground"
          aria-label="Center Align"
        >
          <AlignCenter />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Right Align">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
          className="text-muted-foreground"
          aria-label="Right Align"
        >
          <AlignRight />
        </Button>
      </ActionTooltip>
      <ActionTooltip label="Justify Align">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
          className="text-muted-foreground"
          aria-label="Justify Align"
        >
          <AlignJustify />
        </Button>
      </ActionTooltip>
    </div>
  );
}
