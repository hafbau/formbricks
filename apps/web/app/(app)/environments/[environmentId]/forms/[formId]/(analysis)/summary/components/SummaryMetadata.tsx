import { timeSinceConditionally } from "@fastform/lib/time";
import { TResponse } from "@fastform/types/responses";
import { Tform } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fastform/ui/Tooltip";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";

interface SummaryMetadataProps {
  responses: TResponse[];
  showDropOffs: boolean;
  setShowDropOffs: React.Dispatch<React.SetStateAction<boolean>>;
  form: Tform;
  displayCount: number;
}

const StatCard = ({ label, percentage, value, tooltipText }) => (
  <TooltipProvider delayDuration={50}>
    <Tooltip>
      <TooltipTrigger>
        <div className="flex h-full cursor-default flex-col justify-between space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm">
          <p className="text-sm text-slate-600">
            {label}
            {percentage && percentage !== "NaN%" && (
              <span className="ml-1 rounded-xl bg-slate-100 px-2 py-1 text-xs">{percentage}</span>
            )}
          </p>
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

function formatTime(ttc, totalResponses) {
  const seconds = ttc / (1000 * totalResponses);
  let formattedValue;

  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    formattedValue = `${minutes}m ${remainingSeconds.toFixed(2)}s`;
  } else {
    formattedValue = `${seconds.toFixed(2)}s`;
  }

  return formattedValue;
}

export default function SummaryMetadata({
  responses,
  form,
  displayCount,
  setShowDropOffs,
  showDropOffs,
}: SummaryMetadataProps) {
  const completedResponsesCount = useMemo(() => responses.filter((r) => r.finished).length, [responses]);
  const [validTtcResponsesCount, setValidResponsesCount] = useState(0);

  const ttc = useMemo(() => {
    let validTtcResponsesCountAcc = 0; //stores the count of responses that contains a _total value
    const ttc = responses.reduce((acc, response) => {
      if (response.ttc?._total) {
        validTtcResponsesCountAcc++;
        return acc + response.ttc._total;
      }
      return acc;
    }, 0);
    setValidResponsesCount(validTtcResponsesCountAcc);
    return ttc;
  }, [responses]);

  const totalResponses = responses.length;

  return (
    <div className="mb-4">
      <div className="flex flex-col-reverse gap-y-2 lg:grid lg:grid-cols-3 lg:gap-x-2">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-x-2 lg:col-span-2">
          <div className="flex flex-col justify-between space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">Displays</p>
            <p className="text-2xl font-bold text-slate-800">
              {displayCount === 0 ? <span>-</span> : displayCount}
            </p>
          </div>
          <StatCard
            label="Starts"
            percentage={`${Math.round((totalResponses / displayCount) * 100)}%`}
            value={totalResponses === 0 ? <span>-</span> : totalResponses}
            tooltipText="People who started the form."
          />
          <StatCard
            label="Responses"
            percentage={`${Math.round((completedResponsesCount / displayCount) * 100)}%`}
            value={responses.length === 0 ? <span>-</span> : completedResponsesCount}
            tooltipText="People who completed the form."
          />
          <StatCard
            label="Drop Offs"
            percentage={`${Math.round(((totalResponses - completedResponsesCount) / totalResponses) * 100)}%`}
            value={responses.length === 0 ? <span>-</span> : totalResponses - completedResponsesCount}
            tooltipText="People who started but not completed the form."
          />
          <StatCard
            label="Time to Complete"
            percentage={null}
            value={
              validTtcResponsesCount === 0 ? <span>-</span> : `${formatTime(ttc, validTtcResponsesCount)}`
            }
            tooltipText="Average time to complete the form."
          />
        </div>
        <div className="flex flex-col justify-between gap-2 lg:col-span-1">
          <div className="text-right text-xs text-slate-400">
            Last updated: {timeSinceConditionally(form.updatedAt.toISOString())}
          </div>
          <Button
            variant="minimal"
            className="w-max self-start"
            EndIcon={showDropOffs ? ChevronDownIcon : ChevronUpIcon}
            onClick={() => setShowDropOffs(!showDropOffs)}>
            Analyze Drop Offs
          </Button>
        </div>
      </div>
    </div>
  );
}
