"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from "@lexical/react/LexicalTypeaheadMenuPlugin";
import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from "lexical";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as ReactDOM from "react-dom";

class EmojiOption extends MenuOption {
  title: string;
  emoji: string;
  keywords: Array<string>;

  constructor(
    title: string,
    emoji: string,
    options: {
      keywords?: Array<string>;
    },
  ) {
    super(title);
    this.title = title;
    this.emoji = emoji;
    this.keywords = options.keywords ?? [];
  }
}
function EmojiMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiOption;
}) {
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
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
      <span className="mr-1 text-lg">{option.emoji}</span>
      <span className="text-sm">{option.title}</span>
    </li>
  );
}

type Emoji = {
  emoji: string;
  description: string;
  category: string;
  aliases: Array<string>;
  tags: Array<string>;
  unicode_version: string;
  ios_version: string;
  skin_tones?: boolean;
};

const MAX_EMOJI_SUGGESTION_COUNT = 10;

export default function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<Array<Emoji>>([]);

  useEffect(() => {
    void import("../../utils/emoji-list").then((file) => setEmojis(file.default));
  }, []);

  const emojiOptions = useMemo(
    () =>
      emojis != null
        ? emojis.map(
            ({ emoji, aliases, tags }) =>
              new EmojiOption(aliases[0]!, emoji, {
                keywords: [...aliases, ...tags],
              }),
          )
        : [],
    [emojis],
  );

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(":", {
    minLength: 0,
  });

  const options: Array<EmojiOption> = useMemo(() => {
    return emojiOptions
      .filter((option: EmojiOption) => {
        return queryString != null
          ? new RegExp(queryString, "gi").exec(option.title) ?? option.keywords != null
            ? option.keywords.some((keyword: string) =>
                new RegExp(queryString, "gi").exec(keyword),
              )
            : false
          : emojiOptions;
      })
      .slice(0, MAX_EMOJI_SUGGESTION_COUNT);
  }, [emojiOptions, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
    ) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selectedOption == null) {
          return;
        }

        if (nodeToRemove) {
          nodeToRemove.remove();
        }

        selection.insertNodes([$createTextNode(selectedOption.emoji)]);

        closeMenu();
      });
    },
    [editor],
  );

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
      ) => {
        if (anchorElementRef.current == null || options.length === 0) {
          return null;
        }

        return anchorElementRef.current && options.length
          ? ReactDOM.createPortal(
              <ScrollArea className="no-scrollbar !fixed max-h-52 overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                <ul className="list-none">
                  {options.map((option: EmojiOption, index) => (
                    <EmojiMenuItem
                      key={option.key}
                      index={index}
                      isSelected={selectedIndex === index}
                      onClick={() => {
                        setHighlightedIndex(index);
                        selectOptionAndCleanUp(option);
                      }}
                      onMouseEnter={() => {
                        setHighlightedIndex(index);
                      }}
                      option={option}
                    />
                  ))}
                </ul>
              </ScrollArea>,
              anchorElementRef.current,
            )
          : null;
      }}
    />
  );
}
