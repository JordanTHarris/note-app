import { ActionTooltip } from "@/components/shared/action-tooltip";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useState } from "react";

export function EditReadModePlugin() {
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(editor.isEditable());

  function onEditableChange(checked: boolean) {
    editor.setEditable(checked);
    setIsEditable(checked);
  }

  return (
    <div className="flex items-center justify-end space-x-2 pr-2 pt-3">
      <Label htmlFor="editable" className="hidden md:flex">
        Edit
      </Label>
      <ActionTooltip label={isEditable ? "Editable" : "Read only"}>
        <div>
          <Switch
            id="editable"
            onCheckedChange={onEditableChange}
            defaultChecked={editor.isEditable()}
          />
        </div>
      </ActionTooltip>
    </div>
  );
}
