"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import "./ExcalidrawModal.css";

import dynamic from "next/dynamic";
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);
// import { Excalidraw } from "@excalidraw/excalidraw";
import {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
} from "@excalidraw/excalidraw/types/types";
import * as React from "react";
import { ReactPortal, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import Modal from "../../ui/Modal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export type ExcalidrawInitialElements = ExcalidrawInitialDataState["elements"];

type Props = {
  /**
   * The initial set of elements to draw into the scene
   */
  initialElements: ExcalidrawInitialElements;
  /**
   * The initial set of elements to draw into the scene
   */
  initialAppState: AppState;
  /**
   * The initial set of elements to draw into the scene
   */
  initialFiles: BinaryFiles;
  /**
   * Controls the visibility of the modal
   */
  isShown?: boolean;
  /**
   * Callback when closing and discarding the new changes
   */
  onClose: () => void;
  /**
   * Completely remove Excalidraw component
   */
  onDelete: () => void;
  /**
   * Callback when the save button is clicked
   */
  onSave: (
    elements: ExcalidrawInitialElements,
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => void;
};

export const useCallbackRefState = () => {
  const [refValue, setRefValue] = React.useState<ExcalidrawImperativeAPI | null>(null);
  const refCallback = React.useCallback(
    (value: ExcalidrawImperativeAPI | null) => setRefValue(value),
    [],
  );
  return [refValue, refCallback] as const;
};

/**
 * @explorer-desc
 * A component which renders a modal with Excalidraw (a painting app)
 * which can be used to export an editable image
 */
export default function ExcalidrawModal({
  onSave,
  initialElements,
  initialAppState,
  initialFiles,
  isShown = false,
  onDelete,
  onClose,
}: Props) {
  const excaliDrawModelRef = useRef<HTMLDivElement | null>(null);
  const [excalidrawAPI, excalidrawAPIRefCallback] = useCallbackRefState();
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [elements, setElements] = useState<ExcalidrawInitialElements>(initialElements);
  const [files, setFiles] = useState<BinaryFiles>(initialFiles);

  const { resolvedTheme } = useTheme();
  initialAppState.theme = resolvedTheme === "dark" ? "dark" : "light";

  function save() {
    if (elements && elements.filter((el) => !el.isDeleted).length > 0) {
      const appState = excalidrawAPI?.getAppState();
      // We only need a subset of the state
      const partialState: Partial<AppState> = {
        exportBackground: appState?.exportBackground,
        exportScale: appState?.exportScale,
        exportWithDarkMode: appState?.theme === "dark",
        isBindingEnabled: appState?.isBindingEnabled,
        isLoading: appState?.isLoading,
        name: appState?.name,
        theme: appState?.theme,
        viewBackgroundColor: appState?.viewBackgroundColor,
        viewModeEnabled: appState?.viewModeEnabled,
        zenModeEnabled: appState?.zenModeEnabled,
        zoom: appState?.zoom,
      };
      onSave(elements, partialState, files);
    } else {
      // delete node if the scene is clear
      onDelete();
    }
  }

  function discard() {
    if (elements && elements.filter((el) => !el.isDeleted).length === 0) {
      // delete node if the scene is clear
      onDelete();
    } else {
      //Otherwise, show confirmation dialog before closing
      setDiscardModalOpen(true);
    }
  }
  function ShowDiscardDialog(): JSX.Element {
    return (
      <Dialog open={discardModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you abolutely sure?</DialogTitle>
            <DialogDescription>
              Are you sure you want to discard the changes?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setDiscardModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDiscardModalOpen(false);
                onClose();
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (isShown === false) {
    return null;
  }

  const onChange = (els: ExcalidrawInitialElements, _: AppState, fls: BinaryFiles) => {
    setElements(els);
    setFiles(fls);
  };

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      onDelete();
    }
  }

  return (
    <Dialog open={isShown} modal={true}>
      <DialogContent
        className="flex h-[80vh] w-full max-w-screen-xl flex-col"
        ref={excaliDrawModelRef}
        onKeyDown={handleKeyDown}
        hideClose
      >
        <DialogHeader className="h-full w-full">
          {discardModalOpen && <ShowDiscardDialog />}
          <Excalidraw
            onChange={onChange}
            excalidrawAPI={excalidrawAPIRefCallback}
            initialData={{
              appState: initialAppState || { isLoading: false },
              elements: initialElements,
              files: initialFiles,
            }}
            autoFocus
          />
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" onClick={discard}>
            Discard
          </Button>
          <Button variant="default" onClick={save}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
