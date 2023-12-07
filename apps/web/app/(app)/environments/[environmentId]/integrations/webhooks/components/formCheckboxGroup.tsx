import React from "react";
import { Checkbox } from "@fastform/ui/Checkbox";
import { Tform } from "@fastform/types/forms";

interface formCheckboxGroupProps {
  forms: Tform[];
  selectedforms: string[];
  selectedAllforms: boolean;
  onSelectAllforms: () => void;
  onSelectedformChange: (formId: string) => void;
  allowChanges: boolean;
}

export const formCheckboxGroup: React.FC<formCheckboxGroupProps> = ({
  forms,
  selectedforms,
  selectedAllforms,
  onSelectAllforms,
  onSelectedformChange,
  allowChanges,
}) => {
  return (
    <div className="mt-1 rounded-lg border border-slate-200">
      <div className="grid content-center rounded-lg bg-slate-50 p-3 text-left text-sm text-slate-900">
        <div className="my-1 flex items-center space-x-2">
          <Checkbox
            type="button"
            id="allforms"
            className="bg-white"
            value=""
            checked={selectedAllforms}
            onCheckedChange={onSelectAllforms}
            disabled={!allowChanges}
          />
          <label
            htmlFor="allforms"
            className={`flex cursor-pointer items-center ${selectedAllforms ? "font-semibold" : ""} ${
              !allowChanges ? "cursor-not-allowed opacity-50" : ""
            }`}>
            All current and new forms
          </label>
        </div>
        {forms.map((form) => (
          <div key={form.id} className="my-1 flex items-center space-x-2">
            <Checkbox
              type="button"
              id={form.id}
              value={form.id}
              className="bg-white"
              checked={selectedforms.includes(form.id) && !selectedAllforms}
              disabled={selectedAllforms || !allowChanges}
              onCheckedChange={() => {
                if (allowChanges) {
                  onSelectedformChange(form.id);
                }
              }}
            />
            <label
              htmlFor={form.id}
              className={`flex cursor-pointer items-center ${
                selectedAllforms ? "cursor-not-allowed opacity-50" : ""
              } ${!allowChanges ? "cursor-not-allowed opacity-50" : ""}`}>
              {form.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default formCheckboxGroup;
