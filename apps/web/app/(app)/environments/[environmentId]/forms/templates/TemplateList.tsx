"use client";

import { replacePresetPlaceholders } from "@/app/lib/templates";
import { cn } from "@fastform/lib/cn";
import type { TEnvironment } from "@fastform/types/environment";
import type { TProduct } from "@fastform/types/product";
import { TProfile } from "@fastform/types/profile";
import { TformInput } from "@fastform/types/forms";
import { TTemplate } from "@fastform/types/templates";
import { Button } from "@fastform/ui/Button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@fastform/ui/Tooltip";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/solid";
import { SplitIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createformAction } from "../actions";
import { customform, templates, testTemplate } from "./templates";

type TemplateList = {
  environmentId: string;
  profile: TProfile;
  onTemplateClick: (template: TTemplate) => void;
  environment: TEnvironment;
  product: TProduct;
  templateSearch?: string;
};

const ALL_CATEGORY_NAME = "All";
const RECOMMENDED_CATEGORY_NAME = "For you";
export default function TemplateList({
  environmentId,
  profile,
  onTemplateClick,
  product,
  environment,
  templateSearch,
}: TemplateList) {
  const router = useRouter();
  const [activeTemplate, setActiveTemplate] = useState<TTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(RECOMMENDED_CATEGORY_NAME);

  const [categories, setCategories] = useState<Array<string>>([]);

  useEffect(() => {
    const defaultCategories = [
      /* ALL_CATEGORY_NAME, */
      ...(Array.from(new Set(templates.map((template) => template.category))) as string[]),
    ];

    const fullCategories =
      !!profile?.objective && profile.objective !== "other"
        ? [RECOMMENDED_CATEGORY_NAME, ALL_CATEGORY_NAME, ...defaultCategories]
        : [ALL_CATEGORY_NAME, ...defaultCategories];

    setCategories(fullCategories);

    const activeFilter = templateSearch
      ? ALL_CATEGORY_NAME
      : !!profile?.objective && profile.objective !== "other"
      ? RECOMMENDED_CATEGORY_NAME
      : ALL_CATEGORY_NAME;
    setSelectedFilter(activeFilter);
  }, [profile, templateSearch]);

  const addform = async (activeTemplate) => {
    setLoading(true);
    const formType = environment?.widgetSetupCompleted ? "web" : "link";
    const autoComplete = formType === "web" ? 50 : null;
    const augmentedTemplate = {
      ...activeTemplate.preset,
      type: formType,
      autoComplete,
    } as TformInput;
    const form = await createformAction(environmentId, augmentedTemplate);
    router.push(`/environments/${environmentId}/forms/${form.id}/edit`);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory =
      selectedFilter === ALL_CATEGORY_NAME ||
      template.category === selectedFilter ||
      (profile.objective &&
        selectedFilter === RECOMMENDED_CATEGORY_NAME &&
        template.objectives?.includes(profile.objective));

    const templateName = template.name?.toLowerCase();
    const templateDescription = template.description?.toLowerCase();
    const searchQuery = templateSearch?.toLowerCase() ?? "";
    const searchWords = searchQuery.split(" ");

    const matchesSearch = searchWords.every(
      (word) => templateName?.includes(word) || templateDescription?.includes(word)
    );

    return matchesCategory && matchesSearch;
  });

  return (
    <main className="relative z-0 flex-1 overflow-y-auto px-6 pb-6 pt-3 focus:outline-none">
      <div className="mb-6 flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedFilter(category)}
            disabled={templateSearch && templateSearch.length > 0 ? true : false}
            className={cn(
              selectedFilter === category
                ? " bg-slate-800 font-semibold text-white"
                : " bg-white text-slate-700 hover:bg-slate-100",
              "mt-2 rounded border border-slate-800 px-2 py-1 text-xs transition-all duration-150 "
            )}>
            {category}
            {category === RECOMMENDED_CATEGORY_NAME && <SparklesIcon className="ml-1 inline h-5 w-5" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            const newTemplate = replacePresetPlaceholders(customform, product);
            onTemplateClick(newTemplate);
            setActiveTemplate(newTemplate);
          }}
          className={cn(
            activeTemplate?.name === customform.name
              ? "ring-brand border-transparent ring-2"
              : "hover:border-brand-dark  border-dashed border-slate-300",
            "duration-120  group relative rounded-lg border-2  bg-transparent p-6 transition-colors duration-150"
          )}>
          <PlusCircleIcon className="text-brand-dark h-8 w-8 transition-all duration-150 group-hover:scale-110" />
          <h3 className="text-md mb-1 mt-3 text-left font-bold text-slate-700 ">{customform.name}</h3>
          <p className="text-left text-xs text-slate-600 ">{customform.description}</p>
          {activeTemplate?.name === customform.name && (
            <div className="text-left">
              <Button
                variant="darkCTA"
                className="mt-6 px-6 py-3"
                disabled={activeTemplate === null}
                loading={loading}
                onClick={() => addform(activeTemplate)}>
                Create form
              </Button>
            </div>
          )}
        </button>
        {(process.env.NODE_ENV === "development"
          ? [...filteredTemplates, testTemplate]
          : filteredTemplates
        ).map((template: TTemplate) => (
          <div
            onClick={() => {
              const newTemplate = replacePresetPlaceholders(template, product);
              onTemplateClick(newTemplate);
              setActiveTemplate(newTemplate);
            }}
            key={template.name}
            className={cn(
              activeTemplate?.name === template.name && "ring-2 ring-slate-400",
              "duration-120 group relative cursor-pointer rounded-lg bg-white p-6 shadow transition-all duration-150 hover:scale-105"
            )}>
            <div className="flex">
              <div
                className={`rounded border px-1.5 py-0.5 text-xs ${
                  template.category === "Product Experience"
                    ? "border-blue-300 bg-blue-50 text-blue-500"
                    : template.category === "Exploration"
                    ? "border-pink-300 bg-pink-50 text-pink-500"
                    : template.category === "Growth"
                    ? "border-orange-300 bg-orange-50 text-orange-500"
                    : template.category === "Increase Revenue"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-500"
                    : template.category === "Customer Success"
                    ? "border-violet-300 bg-violet-50 text-violet-500"
                    : "border-slate-300 bg-slate-50 text-slate-500" // default color
                }`}>
                {template.category}
              </div>
              {template.preset.questions.some((question) => question.logic && question.logic.length > 0) && (
                <TooltipProvider delayDuration={80}>
                  <Tooltip>
                    <TooltipTrigger>
                      <div>
                        <SplitIcon className="ml-1.5 h-5 w-5  rounded border border-slate-300 bg-slate-50 p-0.5 text-slate-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>This form uses branching logic.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <h3 className="text-md mb-1 mt-3 text-left font-bold text-slate-700">{template.name}</h3>
            <p className="text-left text-xs text-slate-600">{template.description}</p>
            {activeTemplate?.name === template.name && (
              <Button
                variant="darkCTA"
                className="mt-6 px-6 py-3"
                disabled={activeTemplate === null}
                loading={loading}
                onClick={() => addform(activeTemplate)}>
                Use this template
              </Button>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
