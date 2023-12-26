"use client";
import { createformAction } from "../actions";
import TemplateList from "@/app/(app)/environments/[environmentId]/forms/templates/TemplateList";
import LoadingSpinner from "@fastform/ui/LoadingSpinner";
import type { TEnvironment } from "@fastform/types/environment";
import type { TProduct } from "@fastform/types/product";
import { TFormInput } from "@fastform/types/forms";
import { TTemplate } from "@fastform/types/templates";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { TProfile } from "@fastform/types/profile";

export default function FormStarter({
  environmentId,
  environment,
  product,
  profile,
}: {
  environmentId: string;
  environment: TEnvironment;
  product: TProduct;
  profile: TProfile;
}) {
  const [isCreateformLoading, setIsCreateformLoading] = useState(false);
  const router = useRouter();
  const newformFromTemplate = async (template: TTemplate) => {
    setIsCreateformLoading(true);
    const formType = environment?.widgetSetupCompleted ? "web" : "link";
    const autoComplete = formType === "web" ? 50 : null;
    const augmentedTemplate = {
      ...template.preset,
      type: formType,
      autoComplete,
    } as TFormInput;
    try {
      const form = await createformAction(environmentId, augmentedTemplate);
      router.push(`/environments/${environmentId}/forms/${form.id}/edit`);
    } catch (e) {
      toast.error("An error occured creating a new form");
      setIsCreateformLoading(false);
    }
  };
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col py-12">
      {isCreateformLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="px-7 pb-4">
            <h1 className="text-3xl font-extrabold text-slate-700">
              You&apos;re all set! Time to create your first form.
            </h1>
          </div>
          <TemplateList
            environmentId={environmentId}
            onTemplateClick={(template) => {
              newformFromTemplate(template);
            }}
            environment={environment}
            product={product}
            profile={profile}
          />
        </>
      )}
    </div>
  );
}
