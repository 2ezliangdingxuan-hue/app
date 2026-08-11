import type { ReactNode } from "react";
import { IconButton } from "./IconButton";
import { EditIcon } from "./EditIcon";
import { SaveCancelBar } from "./SaveCancelBar";

type EditableFieldProps = {
  editing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  view: ReactNode;
  edit: ReactNode;
  saving?: boolean;
  stacked?: boolean;
  className?: string;
};

export function EditableField({
  editing,
  onEdit,
  onSave,
  onCancel,
  view,
  edit,
  saving = false,
  stacked = false,
  className = "",
}: EditableFieldProps) {
  if (editing) {
    return (
      <div className={`flex ${stacked ? "flex-col" : "flex-wrap items-center"} gap-3 ${className}`}>
        {edit}
        <SaveCancelBar onSave={onSave} onCancel={onCancel} saving={saving} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {view}
      <IconButton size="sm" onClick={onEdit} aria-label="Edit">
        <EditIcon size={18} />
      </IconButton>
    </div>
  );
}
