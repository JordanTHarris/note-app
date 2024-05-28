"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  type LexicalEditor,
  type TextNode,
} from "lexical";
import { useCallback, useMemo, useState } from "react";
import * as React from "react";
import * as ReactDOM from "react-dom";

import useModal from "../../hooks/useModal";
// import catTypingGif from "images/cat-typing.gif";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { INSERT_IMAGE_COMMAND, InsertImageDialog } from "../ImagesPlugin";
import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog";
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
import { InsertPollDialog } from "../PollPlugin";
import { InsertTableDialog } from "../TablePlugin";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Code2,
  Columns3,
  FlipVertical,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  ImagePlay,
  ListChecks,
  ListIcon,
  ListOrdered,
  MessageSquareQuote,
  PencilLine,
  Play,
  Radical,
  Scissors,
  Table,
  Text,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const catTypingGif = "/images/cat-typing.gif";

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords ?? [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  option: ComponentPickerOption;
}) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
      )}
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      {option.icon}
      <span className="text-sm">{option.title}</span>
    </li>
  );
}

function getDynamicOptions(editor: LexicalEditor, queryString: string) {
  const options: Array<ComponentPickerOption> = [];

  if (queryString == null) {
    return options;
  }

  const tableMatch = queryString.match(/^([1-9]\d?)(?:x([1-9]\d?)?)?$/);

  if (tableMatch !== null) {
    const rows = tableMatch[1]!;
    const colOptions = tableMatch[2]
      ? [tableMatch[2]]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(String);

    options.push(
      ...colOptions.map(
        (columns) =>
          new ComponentPickerOption(`${rows}x${columns} Table`, {
            icon: <Table className="mr-1 h-5 w-5" />,
            keywords: ["table"],
            onSelect: () =>
              editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
          }),
      ),
    );
  }

  return options;
}

type ShowModal = ReturnType<typeof useModal>[1];

function getBaseOptions(editor: LexicalEditor, showModal: ShowModal) {
  return [
    new ComponentPickerOption("Paragraph", {
      icon: <Text className="mr-1 h-5 w-5" />,
      keywords: ["normal", "paragraph", "p", "text"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createParagraphNode());
          }
        }),
    }),
    new ComponentPickerOption(`Heading 1`, {
      icon: <Heading1 className="mr-1 h-5 w-5" />,
      keywords: ["heading", "header", `h1`],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h1"));
          }
        }),
    }),
    new ComponentPickerOption(`Heading 2`, {
      icon: <Heading2 className="mr-1 h-5 w-5" />,
      keywords: ["heading", "header", `h2`],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h2"));
          }
        }),
    }),
    new ComponentPickerOption(`Heading 3`, {
      icon: <Heading3 className="mr-1 h-5 w-5" />,
      keywords: ["heading", "header", `h3`],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createHeadingNode("h3"));
          }
        }),
    }),
    new ComponentPickerOption("Table", {
      icon: <Table className="mr-1 h-5 w-5" />,
      keywords: ["table", "grid", "spreadsheet", "rows", "columns"],
      onSelect: () =>
        showModal("Insert Table", (onClose) => (
          <InsertTableDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("Numbered List", {
      icon: <ListOrdered className="mr-1 h-5 w-5" />,
      keywords: ["numbered list", "ordered list", "ol"],
      onSelect: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Bulleted List", {
      icon: <ListIcon className="mr-1 h-5 w-5" />,
      keywords: ["bulleted list", "unordered list", "ul"],
      onSelect: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Check List", {
      icon: <ListChecks className="mr-1 h-5 w-5" />,
      keywords: ["check list", "todo list"],
      onSelect: () => editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
    }),
    new ComponentPickerOption("Quote", {
      icon: <MessageSquareQuote className="mr-1 h-5 w-5" />,
      keywords: ["block quote"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        }),
    }),
    new ComponentPickerOption("Code", {
      icon: <Code2 className="mr-1 h-5 w-5" />,
      keywords: ["javascript", "python", "js", "codeblock"],
      onSelect: () =>
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            if (selection.isCollapsed()) {
              $setBlocksType(selection, () => $createCodeNode());
            } else {
              // Will this ever happen?
              const textContent = selection.getTextContent();
              const codeNode = $createCodeNode();
              selection.insertNodes([codeNode]);
              selection.insertRawText(textContent);
            }
          }
        }),
    }),
    new ComponentPickerOption("Divider", {
      icon: <FlipVertical className="mr-1 h-5 w-5" />,
      keywords: ["horizontal rule", "divider", "hr"],
      onSelect: () => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Page Break", {
      icon: <Scissors className="mr-1 h-5 w-5" />,
      keywords: ["page break", "divider"],
      onSelect: () => editor.dispatchCommand(INSERT_PAGE_BREAK, undefined),
    }),
    new ComponentPickerOption("Excalidraw", {
      icon: <PencilLine className="mr-1 h-5 w-5" />,
      keywords: ["excalidraw", "diagram", "drawing"],
      onSelect: () => editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
    }),
    new ComponentPickerOption("Poll", {
      icon: <ListChecks className="mr-1 h-5 w-5" />,
      keywords: ["poll", "vote"],
      onSelect: () =>
        showModal("Insert Poll", (onClose) => (
          <InsertPollDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    ...EmbedConfigs.map(
      (embedConfig) =>
        new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
          icon: embedConfig.icon,
          keywords: [...embedConfig.keywords, "embed"],
          onSelect: () => editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
        }),
    ),
    new ComponentPickerOption("Equation", {
      icon: <Radical className="mr-1 h-5 w-5" />,
      keywords: ["equation", "latex", "math"],
      onSelect: () =>
        showModal("Insert Equation", (onClose) => (
          <InsertEquationDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("GIF", {
      icon: <ImagePlay className="mr-1 h-5 w-5" />,
      keywords: ["gif", "animate", "image", "file"],
      onSelect: () =>
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          altText: "Cat typing on a laptop",
          src: catTypingGif,
        }),
    }),
    new ComponentPickerOption("Image", {
      icon: <ImageIcon className="mr-1 h-5 w-5" />,
      keywords: ["image", "photo", "picture", "file"],
      onSelect: () =>
        showModal("Insert Image", (onClose) => (
          <InsertImageDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("Collapsible", {
      icon: <Play className="mr-1 h-5 w-5" />,
      keywords: ["collapse", "collapsible", "toggle"],
      onSelect: () => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
    }),
    new ComponentPickerOption("Columns Layout", {
      icon: <Columns3 className="mr-1 h-5 w-5" />,
      keywords: ["columns", "layout", "grid"],
      onSelect: () =>
        showModal("Insert Columns Layout", (onClose) => (
          <InsertLayoutDialog activeEditor={editor} onClose={onClose} />
        )),
    }),
    new ComponentPickerOption("Align Left", {
      icon: <AlignLeft className="mr-1 h-5 w-5" />,
      keywords: ["align", "justify", "left"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left"),
    }),
    new ComponentPickerOption("Align Center", {
      icon: <AlignCenter className="mr-1 h-5 w-5" />,
      keywords: ["align", "justify", "center"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center"),
    }),
    new ComponentPickerOption("Align Right", {
      icon: <AlignRight className="mr-1 h-5 w-5" />,
      keywords: ["align", "justify", "right"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right"),
    }),
    new ComponentPickerOption("Align Justify", {
      icon: <AlignJustify className="mr-1 h-5 w-5" />,
      keywords: ["align", "justify"],
      onSelect: () => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify"),
    }),
  ];
}

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", {
    minLength: 0,
  });

  const options = useMemo(() => {
    const baseOptions = getBaseOptions(editor, showModal);

    if (!queryString) {
      return baseOptions;
    }

    const regex = new RegExp(queryString, "i");

    return [
      ...getDynamicOptions(editor, queryString),
      ...baseOptions.filter(
        (option) =>
          regex.test(option.title) ||
          option.keywords.some((keyword) => regex.test(keyword)),
      ),
    ];
  }, [editor, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string,
    ) => {
      editor.update(() => {
        nodeToRemove?.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor],
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp }) =>
          anchorElementRef.current && options.length
            ? ReactDOM.createPortal(
                // <div className="typeahead-popover component-picker-menu">
                <div className="fixed rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                  <ScrollArea className="max-h-52 overflow-y-auto">
                    <ul className="list-none">
                      {options.map((option, i: number) => (
                        <ComponentPickerMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            selectOptionAndCleanUp(option);
                          }}
                          key={option.key}
                          option={option}
                        />
                      ))}
                    </ul>
                  </ScrollArea>
                </div>,
                anchorElementRef.current,
              )
            : null
        }
      />
    </>
  );
}
