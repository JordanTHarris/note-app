"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ActionTooltip } from "@/components/shared/action-tooltip";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  ListChecks,
  ListIcon,
  ListOrdered,
  MessageSquareQuote,
  Redo,
  Strikethrough,
  Text,
  Underline,
  Undo,
} from "lucide-react";

import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  type LexicalEditor,
  type NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  type HeadingTagType,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $selectAll,
  $setBlocksType,
} from "@lexical/selection";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import { getSelectedNode } from "@/lib/getSelectedNode";
import { sanitizeUrl } from "@/lib/url";
import { ListBulletIcon } from "@radix-ui/react-icons";

const LowPriority = 1;

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

function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
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
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatCheckList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if ($isRangeSelection(selection)) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) selection.insertRawText(textContent);
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
    <Select
      disabled={disabled}
      defaultValue="paragraph"
      value={blockType}
      onValueChange={handleSelect}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select a format" />
      </SelectTrigger>
      <SelectContent
        // disable focus on select and change focus back to editor
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.focus();
        }}
      >
        <SelectGroup>
          <SelectItem value="paragraph" onClick={formatParagraph}>
            <div className="flex items-center">
              <Text className="h-5 w-5" />
              <span className="ml-2 font-medium">Normal</span>
            </div>
          </SelectItem>
          <SelectItem value="h1" onClick={() => formatHeading("h1")}>
            <div className="flex items-center">
              <Heading1 className="h-5 w-5" />
              <span className="ml-2 font-medium">Heading 1</span>
            </div>
          </SelectItem>
          <SelectItem value="h2" onClick={() => formatHeading("h2")}>
            <div className="flex items-center">
              <Heading2 className="h-5 w-5" />
              <span className="ml-2 font-medium">Heading 2</span>
            </div>
          </SelectItem>
          <SelectItem value="h3" onClick={() => formatHeading("h3")}>
            <div className="flex items-center">
              <Heading3 className="h-5 w-5" />
              <span className="ml-2 font-medium">Heading 3</span>
            </div>
          </SelectItem>
          <SelectItem value="bullet" onClick={formatBulletList}>
            <div className="flex items-center">
              <ListIcon className="h-5 w-5" />
              <span className="ml-2 font-medium">Bullet List</span>
            </div>
          </SelectItem>
          <SelectItem value="number" onClick={formatNumberedList}>
            <div className="flex items-center">
              <ListOrdered className="h-5 w-5" />
              <span className="ml-2 font-medium">Number List</span>
            </div>
          </SelectItem>
          <SelectItem value="check" onClick={formatCheckList}>
            <div className="flex items-center">
              <ListChecks className="h-5 w-5" />
              <span className="ml-2 font-medium">Check List</span>
            </div>
          </SelectItem>
          <SelectItem value="quote" onClick={formatQuote}>
            <div className="flex items-center">
              <MessageSquareQuote className="h-5 w-5" />
              <span className="ml-2 font-medium">Quote</span>
            </div>
          </SelectItem>
          <SelectItem value="code" onClick={formatCode}>
            <div className="flex items-center">
              <Code2 className="h-5 w-5" />
              <span className="ml-2 font-medium">Code Block</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
      {/* <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "paragraph")}
        onClick={formatParagraph}
      >
        <i className="icon paragraph" />
        <span className="text">Normal</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "h1")}
        onClick={() => formatHeading("h1")}
      >
        <i className="icon h1" />
        <span className="text">Heading 1</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "h2")}
        onClick={() => formatHeading("h2")}
      >
        <i className="icon h2" />
        <span className="text">Heading 2</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "h3")}
        onClick={() => formatHeading("h3")}
      >
        <i className="icon h3" />
        <span className="text">Heading 3</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "bullet")}
        onClick={formatBulletList}
      >
        <i className="icon bullet-list" />
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "number")}
        onClick={formatNumberedList}
      >
        <i className="icon numbered-list" />
        <span className="text">Numbered List</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "check")}
        onClick={formatCheckList}
      >
        <i className="icon check-list" />
        <span className="text">Check List</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "quote")}
        onClick={formatQuote}
      >
        <i className="icon quote" />
        <span className="text">Quote</span>
      </DropDownItem>
      <DropDownItem
        className={"item " + dropDownActiveClass(blockType === "code")}
        onClick={formatCode}
      >
        <i className="icon code" />
        <span className="text">Code Block</span>
      </DropDownItem> */}
    </Select>
  );
}

// function FontDropDown({
//   editor,
//   value,
//   style,
//   disabled = false,
// }: {
//   editor: LexicalEditor;
//   value: string;
//   style: string;
//   disabled?: boolean;
// }): JSX.Element {
//   const handleClick = useCallback(
//     (option: string) => {
//       editor.update(() => {
//         const selection = $getSelection();
//         if ($isRangeSelection(selection)) {
//           $patchStyleText(selection, {
//             [style]: option,
//           });
//         }
//       });
//     },
//     [editor, style],
//   );

//   const buttonAriaLabel =
//     style === "font-family"
//       ? "Formatting options for font family"
//       : "Formatting options for font size";

//   return (
//     <DropDown
//       disabled={disabled}
//       buttonClassName={"toolbar-item " + style}
//       buttonLabel={value}
//       buttonIconClassName={style === "font-family" ? "icon block-type font-family" : ""}
//       buttonAriaLabel={buttonAriaLabel}
//     >
//       {(style === "font-family" ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
//         ([option, text]) => (
//           <DropDownItem
//             className={`item ${dropDownActiveClass(value === option)} ${
//               style === "font-size" ? "fontsize-item" : ""
//             }`}
//             onClick={() => handleClick(option)}
//             key={option}
//           >
//             <span className="text">{text}</span>
//           </DropDownItem>
//         ),
//       )}
//     </DropDown>
//   );
// }

function Divider() {
  return <div className="divider" />;
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontColor, setFontColor] = useState<string>("#000");
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [fontFamily, setFontFamily] = useState<string>("Arial");
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
  //   const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const IS_APPLE = false;

  const updateToolbar = useCallback(() => {
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
      setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "15px"));
      setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000"));
      setBgColor(
        $getSelectionStyleValueForProperty(selection, "background-color", "#fff"),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
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
  }, [activeEditor, editor, updateToolbar]);

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

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

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
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <BlockFormatDropDown
          disabled={!isEditable}
          blockType={blockType}
          editor={editor}
        />
      )}
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
