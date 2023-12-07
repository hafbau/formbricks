import FileInput from "@fastform/ui/FileInput";
import { Tform } from "@fastform/types/forms";

interface ImageformBgBgProps {
  localform?: Tform;
  handleBgChange: (url: string, bgType: string) => void;
}

export default function ImageformBg({ localform, handleBgChange }: ImageformBgBgProps) {
  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  };

  const fileUrl = isUrl(localform?.styling?.background?.bg ?? "")
    ? localform?.styling?.background?.bg ?? ""
    : "";

  return (
    <div className="mb-2 mt-4 w-full rounded-lg border bg-slate-50 p-4">
      <div className="flex w-full items-center justify-center">
        <FileInput
          id="form-bg-file-input"
          allowedFileExtensions={["png", "jpeg", "jpg"]}
          environmentId={localform?.environmentId}
          onFileUpload={(url: string[]) => {
            if (url.length > 0) {
              handleBgChange(url[0], "image");
            } else {
              handleBgChange("#ffff", "color");
            }
          }}
          fileUrl={fileUrl}
        />
      </div>
    </div>
  );
}
