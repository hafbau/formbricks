import { TEnvironment } from "@fastform/types/environment";
import { Button } from "@fastform/ui/Button";
import { Unplug } from "lucide-react";
import Link from "next/link";

type TEmptyInAppformsProps = {
  environment: TEnvironment;
};

export default async function EmptyInAppforms({ environment }: TEmptyInAppformsProps) {
  return (
    <div className="flex w-full items-center justify-center gap-8 bg-slate-100 py-12">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-white">
        <Unplug size={48} className="text-amber-500" absoluteStrokeWidth />
      </div>

      <div className="flex flex-col">
        <h1 className="text-xl font-semibold text-slate-900">You&apos;re not plugged in yet!</h1>

        <p className="mt-2 text-sm text-slate-600">Connect your app with Fastform to run in app forms.</p>

        <Link className="mt-2" href={`/environments/${environment.id}/settings/setup`}>
          <Button variant="darkCTA" size="sm" className="flex w-[120px] justify-center">
            Connect
          </Button>
        </Link>
      </div>
    </div>
  );
}
