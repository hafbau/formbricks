"use client";

import React from "react";
import { useEffect, useState } from "react";
import Previewform from "../../../components/Previewform";
import QuestionsAudienceTabs from "./QuestionsSettingsTabs";
import QuestionsView from "./QuestionsView";
import SettingsView from "./SettingsView";
import FormMenuBar from "./FormMenuBar";
import { TEnvironment } from "@fastform/types/environment";
import { Tform } from "@fastform/types/forms";
import { TProduct } from "@fastform/types/product";
import { TAttributeClass } from "@fastform/types/attributeClasses";
import { TActionClass } from "@fastform/types/actionClasses";
import { TMembershipRole } from "@fastform/types/memberships";
import Loading from "@/app/(app)/environments/[environmentId]/forms/[formId]/edit/loading";

interface FormEditorProps {
  form: Tform;
  product: TProduct;
  environment: TEnvironment;
  actionClasses: TActionClass[];
  attributeClasses: TAttributeClass[];
  responseCount: number;
  membershipRole?: TMembershipRole;
  colours: string[];
}

export default function FormEditor({
  form,
  product,
  environment,
  actionClasses,
  attributeClasses,
  responseCount,
  membershipRole,
  colours,
}: FormEditorProps): JSX.Element {
  const [activeView, setActiveView] = useState<"questions" | "settings">("questions");
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [localform, setLocalform] = useState<Tform | null>();
  const [invalidQuestions, setInvalidQuestions] = useState<String[] | null>(null);

  useEffect(() => {
    if (form) {
      if (localform) return;
      setLocalform(JSON.parse(JSON.stringify(form)));

      if (form.questions.length > 0) {
        setActiveQuestionId(form.questions[0].id);
      }
    }
  }, [form]);

  // when the form type changes, we need to reset the active question id to the first question
  useEffect(() => {
    if (localform?.questions?.length && localform.questions.length > 0) {
      setActiveQuestionId(localform.questions[0].id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localform?.type]);

  if (!localform) {
    return <Loading />;
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <FormMenuBar
          setLocalform={setLocalform}
          localform={localform}
          form={form}
          environment={environment}
          activeId={activeView}
          setActiveId={setActiveView}
          setInvalidQuestions={setInvalidQuestions}
          product={product}
          responseCount={responseCount}
        />
        <div className="relative z-0 flex flex-1 overflow-hidden">
          <main className="relative z-0 flex-1 overflow-y-auto focus:outline-none">
            <QuestionsAudienceTabs activeId={activeView} setActiveId={setActiveView} />
            {activeView === "questions" ? (
              <QuestionsView
                localform={localform}
                setLocalform={setLocalform}
                activeQuestionId={activeQuestionId}
                setActiveQuestionId={setActiveQuestionId}
                product={product}
                invalidQuestions={invalidQuestions}
                setInvalidQuestions={setInvalidQuestions}
              />
            ) : (
              <SettingsView
                environment={environment}
                localform={localform}
                setLocalform={setLocalform}
                actionClasses={actionClasses}
                attributeClasses={attributeClasses}
                responseCount={responseCount}
                membershipRole={membershipRole}
                colours={colours}
              />
            )}
          </main>
          <aside className="group hidden flex-1 flex-shrink-0 items-center justify-center overflow-hidden border-l border-slate-100 bg-slate-50 py-6  md:flex md:flex-col">
            <Previewform
              form={localform}
              setActiveQuestionId={setActiveQuestionId}
              activeQuestionId={activeQuestionId}
              product={product}
              environment={environment}
              previewType={localform.type === "web" ? "modal" : "fullwidth"}
              onFileUpload={async (file) => file.name}
            />
          </aside>
        </div>
      </div>
    </>
  );
}
