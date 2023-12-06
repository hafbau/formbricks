import { UsageAttributesUpdater } from "@/app/(app)/components/FormbricksClient";
import SurveyDropDownMenu from "@/app/(app)/environments/[environmentId]/surveys/components/SurveyDropDownMenu";
import SurveyStarter from "@/app/(app)/environments/[environmentId]/surveys/components/SurveyStarter";
import { generateSurveySingleUseId } from "@/app/lib/singleUseSurveys";
import { authOptions } from "@fastform/lib/authOptions";
import { WEBAPP_URL } from "@fastform/lib/constants";
import { getEnvironment, getEnvironments } from "@fastform/lib/environment/service";
import { getMembershipByUserIdTeamId } from "@fastform/lib/membership/service";
import { getAccessFlags } from "@fastform/lib/membership/utils";
import { getProductByEnvironmentId } from "@fastform/lib/product/service";
import { getSurveys } from "@fastform/lib/form/service";
import { getTeamByEnvironmentId } from "@fastform/lib/team/service";
import type { TEnvironment } from "@fastform/types/environment";
import { Badge } from "@fastform/ui/Badge";
import { SurveyStatusIndicator } from "@fastform/ui/SurveyStatusIndicator";
import { ComputerDesktopIcon, LinkIcon, PlusIcon } from "@heroicons/react/24/solid";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function SurveysList({ environmentId }: { environmentId: string }) {
  const session = await getServerSession(authOptions);
  const product = await getProductByEnvironmentId(environmentId);
  const team = await getTeamByEnvironmentId(environmentId);

  if (!session) {
    throw new Error("Session not found");
  }

  if (!product) {
    throw new Error("Product not found");
  }

  if (!team) {
    throw new Error("Team not found");
  }

  const currentUserMembership = await getMembershipByUserIdTeamId(session?.user.id, team.id);
  const { isViewer } = getAccessFlags(currentUserMembership?.role);
  const isSurveyCreationDeletionDisabled = isViewer;

  const environment = await getEnvironment(environmentId);
  if (!environment) {
    throw new Error("Environment not found");
  }
  const surveys = await getSurveys(environmentId);

  const environments: TEnvironment[] = await getEnvironments(product.id);
  const otherEnvironment = environments.find((e) => e.type !== environment.type)!;

  if (surveys.length === 0) {
    return (
      <SurveyStarter
        environmentId={environmentId}
        environment={environment}
        product={product}
        profile={session.user}
      />
    );
  }

  return (
    <>
      <ul className="grid place-content-stretch gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 ">
        {!isSurveyCreationDeletionDisabled && (
          <Link href={`/environments/${environmentId}/surveys/templates`}>
            <li className="col-span-1 h-56">
              <div className="delay-50 flex h-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-slate-900 to-slate-800 font-light text-white shadow transition ease-in-out hover:scale-105 hover:from-slate-800 hover:to-slate-700">
                <div id="main-cta" className="px-4 py-8 sm:p-14 xl:p-10">
                  <PlusIcon className="stroke-thin mx-auto h-14 w-14" />
                  Create Form
                </div>
              </div>
            </li>
          </Link>
        )}
        {surveys
          .sort((a, b) => b.updatedAt?.getTime() - a.updatedAt?.getTime())
          .map((form) => {
            const isSingleUse = form.singleUse?.enabled ?? false;
            const isEncrypted = form.singleUse?.isEncrypted ?? false;
            const singleUseId = isSingleUse ? generateSurveySingleUseId(isEncrypted) : undefined;
            return (
              <li key={form.id} className="relative col-span-1 h-56">
                <div className="delay-50 flex h-full flex-col justify-between rounded-md bg-white shadow transition ease-in-out hover:scale-105">
                  <div className="px-6 py-4">
                    <Badge
                      StartIcon={form.type === "link" ? LinkIcon : ComputerDesktopIcon}
                      startIconClassName="mr-2"
                      text={form.type === "link" ? "Link Form" : form.type === "web" ? "In-Product Form" : ""}
                      type="gray"
                      size={"tiny"}
                      className="font-base"></Badge>
                    <p className="my-2 line-clamp-3 text-lg">{form.name}</p>
                  </div>
                  <Link
                    href={
                      form.status === "draft"
                        ? `/environments/${environmentId}/surveys/${form.id}/edit`
                        : `/environments/${environmentId}/surveys/${form.id}/summary`
                    }
                    className="absolute h-full w-full"></Link>
                  <div className="divide-y divide-slate-100">
                    <div className="flex justify-between px-4 py-2 text-right sm:px-6">
                      <div className="flex items-center">
                        {form.status !== "draft" && (
                          <>
                            {(form.type === "link" || environment.widgetSetupCompleted) && (
                              <SurveyStatusIndicator status={form.status} />
                            )}
                          </>
                        )}
                        {form.status === "draft" && (
                          <span className="text-xs italic text-slate-400">Draft</span>
                        )}
                      </div>
                      <SurveyDropDownMenu
                        form={form}
                        key={`surveys-${form.id}`}
                        environmentId={environmentId}
                        environment={environment}
                        otherEnvironment={otherEnvironment!}
                        webAppUrl={WEBAPP_URL}
                        singleUseId={singleUseId}
                        isSurveyCreationDeletionDisabled={isSurveyCreationDeletionDisabled}
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
      </ul>
      <UsageAttributesUpdater numSurveys={surveys.length} />
    </>
  );
}
