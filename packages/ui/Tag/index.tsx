import { cn } from "@fastform/lib/cn";
import { XCircleIcon } from "@heroicons/react/24/solid";

interface Tag {
  tagId: string;
  tagName: string;
}

interface ResponseTagsWrapperProps {
  tagId: string;
  tagName: string;
  onDelete: (tagId: string) => void;
  tags?: Tag[];
  setTagsState?: (tags: Tag[]) => void;
  highlight?: boolean;
}

export function Tag({ tagId, tagName, onDelete, tags, setTagsState, highlight }: ResponseTagsWrapperProps) {
  return (
    <div
      key={tagId}
      className={cn(
        "relative flex items-center justify-between gap-2 rounded-full bg-slate-600 px-2 py-1 text-slate-100",
        highlight && "animate-shake"
      )}>
      <div className="flex items-center gap-2">
        <span className="text-sm">{tagName}</span>
      </div>

      <span
        className="cursor-pointer text-sm"
        onClick={() => {
          if (tags && setTagsState) setTagsState(tags.filter((tag) => tag.tagId !== tagId));
          onDelete(tagId);
        }}>
        <XCircleIcon fontSize={24} className="h-4 w-4 text-slate-100 hover:text-slate-200" />
      </span>
    </div>
  );
}
