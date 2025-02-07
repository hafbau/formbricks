"use client";

import { TForm } from "@fastform/types/forms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@fastform/ui/DropdownMenu";
import { Button } from "@fastform/ui/Button";
import { PencilSquareIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import { FormStatusIndicator } from "@fastform/ui/FormStatusIndicator";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SuccessMessage from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/SuccessMessage";
import LinkFormShareButton from "@/app/(app)/environments/[environmentId]/forms/[formId]/(analysis)/summary/components/LinkModalButton";
import { TEnvironment } from "@fastform/types/environment";
import { TProduct } from "@fastform/types/product";
import { updateformAction } from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/actions";
import { TProfile } from "@fastform/types/profile";
import FormStatusDropdown from "@/app/(app)/environments/[environmentId]/forms/[formId]/components/FormStatusDropdown";
import { TMembershipRole } from "@fastform/types/memberships";
import { getAccessFlags } from "@fastform/lib/membership/utils";

interface SummaryHeaderProps {
  formId: string;
  environment: TEnvironment;
  form: TForm;
  webAppUrl: string;
  product: TProduct;
  profile: TProfile;
  membershipRole?: TMembershipRole;
}
const SummaryHeader = ({
  formId,
  environment,
  form,
  webAppUrl,
  product,
  profile,
  membershipRole,
}: SummaryHeaderProps) => {
  const router = useRouter();

  const isCloseOnDateEnabled = form.closeOnDate !== null;
  const closeOnDate = form.closeOnDate ? new Date(form.closeOnDate) : null;
  const isStatusChangeDisabled = (isCloseOnDateEnabled && closeOnDate && closeOnDate < new Date()) ?? false;
  const { isViewer } = getAccessFlags(membershipRole);
  return (
    <div className="mb-11 mt-6 flex flex-wrap items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-slate-800">{form.name}</p>
        <span className="text-base font-extralight text-slate-600">{product.name}</span>
      </div>
      <div className="hidden justify-end gap-x-1.5 sm:flex">
        {form.type === "link" && (
          <LinkFormShareButton form={form} webAppUrl={webAppUrl} product={product} profile={profile} />
        )}
        {!isViewer &&
        (environment?.widgetSetupCompleted || form.type === "link") &&
        form?.status !== "draft" ? (
          <FormStatusDropdown environment={environment} form={form} />
        ) : null}
        {!isViewer && (
          <Button
            variant="darkCTA"
            className="h-full w-full px-3 lg:px-6"
            href={`/environments/${environment.id}/forms/${formId}/edit`}>
            Edit
            <PencilSquareIcon className="ml-1 h-4" />
          </Button>
        )}
      </div>
      <div className="block sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="secondary" className="h-full w-full rounded-md p-2">
              <EllipsisHorizontalIcon className="h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="p-2">
            {form.type === "link" && (
              <>
                <LinkFormShareButton
                  className="flex w-full justify-center p-1"
                  form={form}
                  webAppUrl={webAppUrl}
                  product={product}
                  profile={profile}
                />
                <DropdownMenuSeparator />
              </>
            )}
            {(environment?.widgetSetupCompleted || form.type === "link") && form?.status !== "draft" ? (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger
                    disabled={isStatusChangeDisabled}
                    style={isStatusChangeDisabled ? { pointerEvents: "none", opacity: 0.5 } : {}}>
                    <div className="flex items-center">
                      {(form.type === "link" || environment.widgetSetupCompleted) && (
                        <FormStatusIndicator status={form.status} />
                      )}
                      <span className="ml-1 text-sm text-slate-700">
                        {form.status === "inProgress" && "In-progress"}
                        {form.status === "paused" && "Paused"}
                        {form.status === "completed" && "Completed"}
                      </span>
                    </div>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup
                        value={form.status}
                        onValueChange={(value) => {
                          const castedValue = value as "draft" | "inProgress" | "paused" | "completed";
                          updateformAction({ ...form, status: castedValue })
                            .then(() => {
                              toast.success(
                                value === "inProgress"
                                  ? "Form live"
                                  : value === "paused"
                                  ? "Form paused"
                                  : value === "completed"
                                  ? "Form completed"
                                  : ""
                              );
                              router.refresh();
                            })
                            .catch((error) => {
                              toast.error(`Error: ${error.message}`);
                            });
                        }}>
                        <DropdownMenuRadioItem
                          value="inProgress"
                          className="cursor-pointer break-all text-slate-600">
                          In-progress
                        </DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioItem
                          value="paused"
                          className="cursor-pointer break-all text-slate-600">
                          Paused
                        </DropdownMenuRadioItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioItem
                          value="completed"
                          className="cursor-pointer break-all text-slate-600">
                          Completed
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
              </>
            ) : null}
            <Button
              variant="darkCTA"
              size="sm"
              className="flex h-full w-full justify-center px-3 lg:px-6"
              href={`/environments/${environment.id}/forms/${formId}/edit`}>
              Edit
              <PencilSquareIcon className="ml-1 h-4" />
            </Button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <SuccessMessage
        environment={environment}
        form={form}
        webAppUrl={webAppUrl}
        product={product}
        profile={profile}
      />
    </div>
  );
};

export default SummaryHeader;
