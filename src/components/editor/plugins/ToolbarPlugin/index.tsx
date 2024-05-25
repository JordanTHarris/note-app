"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  type ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  type LexicalEditor,
  type NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { type Dispatch, useCallback, useEffect, useState } from "react";
import * as React from "react";
import { IS_APPLE } from "@/components/editor/shared/environment";

import useModal from "../../hooks/useModal";
import { $createStickyNode } from "../../nodes/StickyNode";
// import catTypingGif from "/images/cat-typing.gif";
import DropDown, { DropDownItem } from "../../ui/DropDown";
import DropdownColorPicker from "../../ui/DropdownColorPicker";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import {
  INSERT_IMAGE_COMMAND,
  InsertImageDialog,
  type InsertImagePayload,
} from "../ImagesPlugin";
import { InsertInlineImageDialog } from "../InlineImagePlugin";
import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog";
import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
import { InsertPollDialog } from "../PollPlugin";
import { InsertTableDialog } from "../TablePlugin";
import FontSize from "./fontSize";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ALargeSmall,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code2,
  Columns3,
  FlipVertical,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  ImagePlay,
  Indent,
  Italic,
  Link2,
  ListChecks,
  ListIcon,
  ListOrdered,
  MessageSquareQuote,
  Outdent,
  PaintBucket,
  PencilLine,
  Play,
  Plus,
  Radical,
  Redo,
  Scissors,
  StickyNote,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  Text,
  Type,
  Underline,
  Undo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ImagePayload } from "../../nodes/ImageNode";
import { FontColor } from "@/components/shared/icons";
import { useTheme } from "next-themes";
import { set } from "zod";
import { updateContent } from "@/server/notes";
import { Note } from "@prisma/client";

const catTypingGif = "/images/cat-typing.gif";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const blockTypeToIcon = {
  bullet: <ListIcon className="mr-1 h-5 w-5" />,
  check: <ListChecks className="mr-1 h-5 w-5" />,
  code: <Code2 className="mr-1 h-5 w-5" />,
  h1: <Heading1 className="mr-1 h-5 w-5" />,
  h2: <Heading2 className="mr-1 h-5 w-5" />,
  h3: <Heading3 className="mr-1 h-5 w-5" />,
  h4: <Heading4 className="mr-1 h-5 w-5" />,
  h5: <Heading5 className="mr-1 h-5 w-5" />,
  h6: <Heading6 className="mr-1 h-5 w-5" />,
  number: <ListOrdered className="mr-1 h-5 w-5" />,
  paragraph: <Text className="mr-1 h-5 w-5" />,
  quote: <MessageSquareQuote className="mr-1 h-5 w-5" />,
};

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Courier New", "Courier New"],
  ["Georgia", "Georgia"],
  ["Times New Roman", "Times New Roman"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Verdana", "Verdana"],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["13px", "13px"],
  ["14px", "14px"],
  ["15px", "15px"],
  ["16px", "16px"],
  ["17px", "17px"],
  ["18px", "18px"],
  ["19px", "19px"],
  ["20px", "20px"],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: React.ReactElement;
    iconRTL: React.ReactElement;
    name: string;
  };
} = {
  center: {
    icon: <AlignCenter className="mr-1 h-5 w-5" />,
    iconRTL: <AlignCenter className="mr-1 h-5 w-5" />,
    name: "Center Align",
  },
  end: {
    icon: <AlignRight className="mr-1 h-5 w-5" />,
    iconRTL: <AlignLeft className="mr-1 h-5 w-5" />,
    name: "End Align",
  },
  justify: {
    icon: <AlignJustify className="mr-1 h-5 w-5" />,
    iconRTL: <AlignJustify className="mr-1 h-5 w-5" />,
    name: "Justify Align",
  },
  left: {
    icon: <AlignLeft className="mr-1 h-5 w-5" />,
    iconRTL: <AlignLeft className="mr-1 h-5 w-5" />,
    name: "Left Align",
  },
  right: {
    icon: <AlignRight className="mr-1 h-5 w-5" />,
    iconRTL: <AlignRight className="mr-1 h-5 w-5" />,
    name: "Right Align",
  },
  start: {
    icon: <AlignLeft className="mr-1 h-5 w-5" />,
    iconRTL: <AlignRight className="mr-1 h-5 w-5" />,
    name: "Start Align",
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) {
    return "active dropdown-item-active";
  } else {
    return "";
  }
}

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  function handleSelect(value: string) {
    if (value === "paragraph") {
      formatParagraph();
    } else if (value === "h1") {
      formatHeading("h1");
    } else if (value === "h2") {
      formatHeading("h2");
    } else if (value === "h3") {
      formatHeading("h3");
    } else if (value === "bullet") {
      formatBulletList();
    } else if (value === "number") {
      formatNumberedList();
    } else if (value === "check") {
      formatCheckList();
    } else if (value === "quote") {
      formatQuote();
    } else if (value === "code") {
      formatCode();
    }
  }

  return (
    <Select disabled={disabled} value={blockType} onValueChange={handleSelect}>
      <SelectTrigger className="h-7 w-fit truncate">
        {/* <SelectValue placeholder="Select a format" /> */}
        <div className="flex items-center truncate">
          {blockTypeToIcon[blockType]}
          <span className="hidden font-medium lg:block">
            {blockTypeToBlockName[blockType]}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent
        // disable focus on select and change focus back to editor
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.focus();
        }}
      >
        <SelectGroup>
          <SelectItem value="paragraph">
            <div className="flex items-center">
              {blockTypeToIcon.paragraph}
              <span className="font-medium">Normal</span>
            </div>
          </SelectItem>
          <SelectItem value="h1">
            <div className="flex items-center">
              {blockTypeToIcon.h1}
              <span className="font-medium">Heading 1</span>
            </div>
          </SelectItem>
          <SelectItem value="h2">
            <div className="flex items-center">
              {blockTypeToIcon.h2}
              <span className="font-medium">Heading 2</span>
            </div>
          </SelectItem>
          <SelectItem value="h3">
            <div className="flex items-center">
              {blockTypeToIcon.h3}
              <span className="font-medium">Heading 3</span>
            </div>
          </SelectItem>
          <SelectItem value="bullet">
            <div className="flex items-center">
              {blockTypeToIcon.bullet}
              <span className="font-medium">Bullet List</span>
            </div>
          </SelectItem>
          <SelectItem value="number">
            <div className="flex items-center">
              {blockTypeToIcon.number}
              <span className="font-medium">Number List</span>
            </div>
          </SelectItem>
          <SelectItem value="check">
            <div className="flex items-center">
              {blockTypeToIcon.check}
              <span className="font-medium">Check List</span>
            </div>
          </SelectItem>
          <SelectItem value="quote">
            <div className="flex items-center">
              {blockTypeToIcon.quote}
              <span className="font-medium">Quote</span>
            </div>
          </SelectItem>
          <SelectItem value="code">
            <div className="flex items-center">
              {blockTypeToIcon.code}
              <span className="font-medium">Code Block</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel =
    style === "font-family"
      ? "Formatting options for font family"
      : "Formatting options for font size";

  return (
    <Select disabled={disabled} value={value} onValueChange={handleClick}>
      <SelectTrigger className="h-7 w-fit truncate">
        <div className="flex items-center truncate">
          <Type className="mr-1 h-5 w-5" />
          <span className="hidden font-medium lg:block">{value}</span>
        </div>
      </SelectTrigger>
      <SelectContent
        // disable focus on select and change focus back to editor
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.focus();
        }}
      >
        <SelectGroup>
          {(style === "font-family" ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
            ([option, text]) => (
              <SelectItem value={option} onClick={() => handleClick(option)} key={option}>
                <span className="font-medium">{text}</span>
              </SelectItem>
            ),
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  function handleSelect(value: string) {
    if (value === "left") {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
    } else if (value === "center") {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
    } else if (value === "right") {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
    } else if (value === "justify") {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
    } else if (value === "start") {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "start");
    } else if (value === "end") {
      editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "end");
    } else if (value === "indent") {
      editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
    } else if (value === "outdent") {
      editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
    }
  }

  return (
    <Select disabled={disabled} value={value.toString()} onValueChange={handleSelect}>
      <SelectTrigger className="h-7 w-fit truncate">
        <div className="flex items-center truncate">
          {isRTL ? formatOption.iconRTL : formatOption.icon}
          <span className="hidden font-medium lg:block">{formatOption.name}</span>
        </div>
      </SelectTrigger>
      <SelectContent
        // disable focus on select and change focus back to editor
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.focus();
        }}
      >
        <SelectGroup>
          <SelectItem value="left">
            <div className="flex items-center">
              {ELEMENT_FORMAT_OPTIONS.left.icon}
              <span className="font-medium">Left Align</span>
            </div>
          </SelectItem>
          <SelectItem value="center">
            <div className="flex items-center">
              {ELEMENT_FORMAT_OPTIONS.center.icon}
              <span className="font-medium">Center Align</span>
            </div>
          </SelectItem>
          <SelectItem value="right">
            <div className="flex items-center">
              {ELEMENT_FORMAT_OPTIONS.right.icon}
              <span className="font-medium">Right Align</span>
            </div>
          </SelectItem>
          <SelectItem value="justify">
            <div className="flex items-center">
              {ELEMENT_FORMAT_OPTIONS.justify.icon}
              <span className="font-medium">Justify Align</span>
            </div>
          </SelectItem>
          <SelectItem value="start">
            <div className="flex items-center">
              {isRTL
                ? ELEMENT_FORMAT_OPTIONS.start.iconRTL
                : ELEMENT_FORMAT_OPTIONS.start.icon}
              <span className="font-medium">Start Align</span>
            </div>
          </SelectItem>
          <SelectItem value="end">
            <div className="flex items-center">
              {isRTL
                ? ELEMENT_FORMAT_OPTIONS.end.iconRTL
                : ELEMENT_FORMAT_OPTIONS.end.icon}
              <span className="font-medium">End Align</span>
            </div>
          </SelectItem>
        </SelectGroup>
        <Separator />
        <SelectGroup>
          <SelectItem
            value="outdent"
            onClick={() => {
              editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
            }}
          >
            <div className="flex items-center">
              {isRTL ? (
                <Indent className="mr-1 h-5 w-5" />
              ) : (
                <Outdent className="mr-1 h-5 w-5" />
              )}
              <span className="font-medium">Outdent</span>
            </div>
          </SelectItem>
          <SelectItem
            value="indent"
            onClick={() => {
              editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
            }}
          >
            <div className="flex items-center">
              {isRTL ? (
                <Outdent className="mr-1 h-5 w-5" />
              ) : (
                <Indent className="mr-1 h-5 w-5" />
              )}
              <span className="font-medium">Indent</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function InsertDropDown({
  activeEditor,
  editor,
  insertGifOnClick,
  isEditable,
  showModal,
}: {
  activeEditor: LexicalEditor;
  editor: LexicalEditor;
  insertGifOnClick: (payload: Readonly<ImagePayload>) => void;
  isEditable: boolean;
  showModal: (title: string, showModal: (onClose: () => void) => JSX.Element) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-7 rounded-md border border-input px-3 hover:bg-accent"
        disabled={!isEditable}
      >
        <div className="flex items-center">
          <Plus className="mr-1 h-4 w-4" />
          <p className="mr-1 hidden text-sm font-semibold lg:block">Insert</p>
          <ChevronDown className="m1-1 h-4 w-4 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
          }}
        >
          <FlipVertical className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Horizontal Rule</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_PAGE_BREAK, undefined);
          }}
        >
          <Scissors className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Page Break</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            showModal("Insert Image", (onClose) => (
              <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <ImageIcon className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Image</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            showModal("Insert Inline Image", (onClose) => (
              <InsertInlineImageDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <ImageIcon className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Inline Image</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            insertGifOnClick({
              altText: "Cat typing on a laptop",
              src: catTypingGif,
            })
          }
        >
          <ImagePlay className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">GIF</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined);
          }}
        >
          <PencilLine className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Excalidraw</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            showModal("Insert Table", (onClose) => (
              <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <Table className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Table</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            showModal("Insert Poll", (onClose) => (
              <InsertPollDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <ListChecks className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Poll</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            showModal("Insert Columns Layout", (onClose) => (
              <InsertLayoutDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <Columns3 className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Columns Layout</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            showModal("Insert Equation", (onClose) => (
              <InsertEquationDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <Radical className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Equation</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.update(() => {
              const root = $getRoot();
              const stickyNode = $createStickyNode(0, 0);
              root.append(stickyNode);
            });
          }}
        >
          <StickyNote className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Sticky Note</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
          }}
        >
          <Play className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Collapsible Container</span>
        </DropdownMenuItem>
        {EmbedConfigs.map((embedConfig) => (
          <DropdownMenuItem
            key={embedConfig.type}
            onClick={() => {
              activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type);
            }}
            className="item"
          >
            {embedConfig.icon}
            <span className="text-sm font-semibold">{embedConfig.contentName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdditionalStylesDropdown({
  activeEditor,
  clearFormatting,
  isEditable,
  isStrikethrough,
  isSubscript,
  isSuperscript,
}: {
  activeEditor: LexicalEditor;
  clearFormatting: () => void;
  isEditable: boolean;
  isStrikethrough: boolean;
  isSubscript: boolean;
  isSuperscript: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="h-7 rounded-md border border-input px-3 hover:bg-accent"
        disabled={!isEditable}
      >
        <div className="flex items-center">
          <ALargeSmall className="mr-1 h-5 w-5" />
          <ChevronDown className="m1-1 h-4 w-4 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuCheckboxItem
          checked={isStrikethrough}
          onCheckedChange={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
          }}
        >
          <Strikethrough className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Strikethrough</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isSubscript}
          onCheckedChange={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
          }}
        >
          <Subscript className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Subscript</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={isSuperscript}
          onCheckedChange={() => {
            activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
          }}
        >
          <Superscript className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Superscript</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={false} onClick={clearFormatting}>
          <Strikethrough className="mr-1 h-4 w-4" />
          <span className="text-sm font-semibold">Clear Formatting</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
  note,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
  note: Note;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [rootType, setRootType] = useState<keyof typeof rootTypeToRootName>("root");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontColor, setFontColor] = useState<string>("#000");
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());

  const { resolvedTheme } = useTheme();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage()!;
            setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] ?? language : "");
            return;
          }
        }
      }
      // Handle buttons
      setFontColor(
        $getSelectionStyleValueForProperty(
          selection,
          "color",
          resolvedTheme === "dark" ? "#fff" : "#000",
        ),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          resolvedTheme === "dark" ? "#000" : "#fff",
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() ?? "left",
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "15px"));
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl("https://");
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {},
      );
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();
        const extractedNodes = selection.extract();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node;
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] ?? textNode;
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] ?? textNode;
            }
            /**
             * If the selected text has one format applied
             * selecting a portion of the text, could
             * clear the format to the wrong portion of the text.
             *
             * The cleared text is based on the length of the selected text.
             */
            // We need this in case the selected text only has one format
            const extractedTextNode = extractedNodes[0];
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode;
            }

            if (textNode.__style !== "") {
              textNode.setStyle("");
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
            }
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("");
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  async function saveToDb() {
    const content = JSON.stringify(editor.getEditorState());
    try {
      await updateContent(note.id, content);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    // <div className="toolbar items-center">
    <div className="sticky top-0 z-10 flex w-full items-center gap-1 p-1">
      <div className="flex flex-1 flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
          type="button"
          className="h-7 w-7 text-muted-foreground"
          aria-label="Undo"
        >
          <Undo />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo || !isEditable}
          onClick={() => {
            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
          type="button"
          className="h-7 w-7 text-muted-foreground"
          aria-label="Redo"
        >
          <Redo />
        </Button>
        <Separator className="h-7" orientation="vertical" />
        {blockType in blockTypeToBlockName && activeEditor === editor && (
          <>
            <BlockFormatDropDown
              disabled={!isEditable}
              blockType={blockType}
              rootType={rootType}
              editor={editor}
            />
            <Separator className="h-7" orientation="vertical" />
          </>
        )}
        {blockType === "code" ? (
          <Select
            disabled={!isEditable}
            value={codeLanguage}
            onValueChange={(value) => onCodeLanguageSelect(value)}
          >
            <SelectTrigger className="h-7 w-fit truncate">
              <div className="flex items-center truncate">
                <span className="hidden font-medium lg:block">
                  {getLanguageFriendlyName(codeLanguage)}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent
              className="max-h-96"
              // disable focus on select and change focus back to editor
              onCloseAutoFocus={(e) => {
                e.preventDefault();
                editor.focus();
              }}
            >
              <SelectGroup>
                {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
                  return (
                    <SelectItem value={value} key={value}>
                      <span className="font-medium">{name}</span>
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
        ) : (
          <>
            <FontDropDown
              disabled={!isEditable}
              style={"font-family"}
              value={fontFamily}
              editor={editor}
            />
            <Separator className="h-7" orientation="vertical" />
            <FontSize
              selectionFontSize={fontSize.slice(0, -2)}
              editor={editor}
              disabled={!isEditable}
            />
            <Separator className="h-7" orientation="vertical" />
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
              }}
              className={cn(
                "h-7 w-7 text-muted-foreground",
                isBold && "bg-secondary text-foreground",
              )}
              title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
              type="button"
              aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"}`}
            >
              <Bold className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
              }}
              className={cn(
                "h-7 w-7 text-muted-foreground",
                isItalic && "bg-secondary text-foreground",
              )}
              title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
              type="button"
              aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"}`}
            >
              <Italic className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
              }}
              className={cn(
                "h-7 w-7 text-muted-foreground",
                isUnderline && "bg-secondary text-foreground",
              )}
              title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
              type="button"
              aria-label={`Format text to underlined. Shortcut: ${
                IS_APPLE ? "⌘U" : "Ctrl+U"
              }`}
            >
              <Underline className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
              }}
              className={cn(
                "h-7 w-7 text-muted-foreground",
                isCode && "bg-secondary text-foreground",
              )}
              title="Insert code block"
              type="button"
              aria-label="Insert code block"
            >
              <Code2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!isEditable}
              onClick={insertLink}
              className={cn(
                "h-7 w-7 text-muted-foreground",
                isLink && "bg-secondary text-foreground",
              )}
              aria-label="Insert link"
              title="Insert link"
              type="button"
            >
              <Link2 className="h-5 w-5" />
            </Button>
            <DropdownColorPicker
              disabled={!isEditable}
              color={fontColor}
              editor={activeEditor}
              onChange={onFontColorSelect}
            >
              <FontColor className="mr-1 h-5 w-5" />
            </DropdownColorPicker>
            <DropdownColorPicker
              disabled={!isEditable}
              color={bgColor}
              editor={activeEditor}
              onChange={onBgColorSelect}
            >
              <PaintBucket className="mr-1 h-5 w-5 scale-90" />
            </DropdownColorPicker>

            <AdditionalStylesDropdown
              activeEditor={activeEditor}
              clearFormatting={clearFormatting}
              isEditable={isEditable}
              isStrikethrough={isStrikethrough}
              isSubscript={isSubscript}
              isSuperscript={isSuperscript}
            />

            <Separator className="h-7" orientation="vertical" />

            <InsertDropDown
              activeEditor={activeEditor}
              editor={editor}
              insertGifOnClick={insertGifOnClick}
              isEditable={isEditable}
              showModal={showModal}
            />
          </>
        )}
        <Separator className="h-7" orientation="vertical" />
        <ElementFormatDropdown
          disabled={!isEditable}
          value={elementFormat}
          editor={editor}
          isRTL={isRTL}
        />

        {modal}
      </div>
      <Button className="h-7 self-start" onClick={saveToDb}>
        Save
      </Button>
    </div>
  );
}
