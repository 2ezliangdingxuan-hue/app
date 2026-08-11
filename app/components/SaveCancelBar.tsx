import { Button } from "./Button";

type SaveCancelBarProps = {
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  className?: string;
};

export function SaveCancelBar({ onSave, onCancel, saving = false, className = "" }: SaveCancelBarProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button type="button" variant="primary" size="sm" onClick={onSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
      <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
    </div>
  );
}
