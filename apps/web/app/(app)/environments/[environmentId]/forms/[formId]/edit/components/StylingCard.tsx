"use client";

import { TPlacement } from "@fastform/types/common";
import { TForm, TFormBackgroundBgType } from "@fastform/types/forms";
import { ColorPicker } from "@fastform/ui/ColorPicker";
import { Label } from "@fastform/ui/Label";
import { Switch } from "@fastform/ui/Switch";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import Placement from "./Placement";
import FormBgSelectorTab from "./FormBgSelectorTab";

interface StylingCardProps {
  localform: TForm;
  setLocalform: React.Dispatch<React.SetStateAction<TForm>>;
  colours: string[];
}

export default function StylingCard({ localform, setLocalform, colours }: StylingCardProps) {
  const [open, setOpen] = useState(false);

  const { type, productOverwrites, styling } = localform;
  const { brandColor, clickOutsideClose, darkOverlay, placement, highlightBorderColor } =
    productOverwrites ?? {};
  const { bg, bgType, brightness } = styling?.background ?? {};

  const [inputValue, setInputValue] = useState(100);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    handleBrightnessChange(parseInt(e.target.value));
  };

  const togglePlacement = () => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        placement: !!placement ? null : "bottomRight",
        clickOutsideClose: false,
        darkOverlay: false,
      },
    });
  };

  const toggleBrandColor = () => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        brandColor: !!brandColor ? null : "#64748b",
      },
    });
  };

  const toggleBackgroundColor = () => {
    setLocalform({
      ...localform,
      styling: {
        ...localform.styling,
        background: {
          ...localform.styling?.background,
          bg: !!bg ? undefined : "#ffff",
          bgType: !!bg ? undefined : "color",
        },
      },
    });
  };

  const toggleBrightness = () => {
    setLocalform({
      ...localform,
      styling: {
        ...localform.styling,
        background: {
          ...localform.styling?.background,
          brightness: !!brightness ? undefined : 100,
        },
      },
    });
    setInputValue(100);
  };

  const toggleHighlightBorderColor = () => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        highlightBorderColor: !!highlightBorderColor ? null : "#64748b",
      },
    });
  };

  const handleColorChange = (color: string) => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        brandColor: color,
      },
    });
  };

  const handleBgChange = (color: string, type: TFormBackgroundBgType) => {
    setInputValue(100);
    setLocalform({
      ...localform,
      styling: {
        ...localform.styling,
        background: {
          ...localform.styling?.background,
          bg: color,
          bgType: type,
          brightness: undefined,
        },
      },
    });
  };

  const handleBrightnessChange = (percent: number) => {
    setLocalform({
      ...localform,
      styling: {
        ...(localform.styling || {}),
        background: {
          ...localform.styling?.background,
          brightness: percent,
        },
      },
    });
  };

  const handleBorderColorChange = (color: string) => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        highlightBorderColor: color,
      },
    });
  };

  const handlePlacementChange = (placement: TPlacement) => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        placement,
      },
    });
  };

  const handleOverlay = (overlayType: string) => {
    const darkOverlay = overlayType === "dark";

    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        darkOverlay,
      },
    });
  };

  const handleClickOutsideClose = (clickOutsideClose: boolean) => {
    setLocalform({
      ...localform,
      productOverwrites: {
        ...localform.productOverwrites,
        clickOutsideClose,
      },
    });
  };

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="w-full rounded-lg border border-slate-300 bg-white">
      <Collapsible.CollapsibleTrigger asChild className="h-full w-full cursor-pointer">
        <div className="inline-flex px-4 py-4">
          <div className="flex items-center pl-2 pr-5">
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Styling</p>
            <p className="mt-1 truncate text-sm text-slate-500">Overwrite global styling settings</p>
          </div>
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent>
        <hr className="py-1 text-slate-600" />
        <div className="p-3">
          {/* Brand Color */}
          <div className="p-3">
            <div className="ml-2 flex items-center space-x-1">
              <Switch id="autoComplete" checked={!!brandColor} onCheckedChange={toggleBrandColor} />
              <Label htmlFor="autoComplete" className="cursor-pointer">
                <div className="ml-2">
                  <h3 className="text-sm font-semibold text-slate-700">Overwrite Brand Color</h3>
                  <p className="text-xs font-normal text-slate-500">Change the main color for this form.</p>
                </div>
              </Label>
            </div>
            {brandColor && (
              <div className="ml-2 mt-4 rounded-lg border bg-slate-50 p-4">
                <div className="w-full max-w-xs">
                  <Label htmlFor="brandcolor">Color (HEX)</Label>
                  <ColorPicker color={brandColor} onChange={handleColorChange} />
                </div>
              </div>
            )}
          </div>
          {type == "link" && (
            <>
              {/* Background */}
              <div className="p-3">
                <div className="ml-2 flex items-center space-x-1">
                  <Switch id="autoCompleteBg" checked={!!bg} onCheckedChange={toggleBackgroundColor} />
                  <Label htmlFor="autoCompleteBg" className="cursor-pointer">
                    <div className="ml-2">
                      <h3 className="text-sm font-semibold text-slate-700">Change Background</h3>
                      <p className="text-xs font-normal text-slate-500">
                        Pick a background from our library or upload your own.
                      </p>
                    </div>
                  </Label>
                </div>
                {bg && (
                  <FormBgSelectorTab
                    localform={localform}
                    handleBgChange={handleBgChange}
                    colours={colours}
                    bgType={bgType}
                  />
                )}
              </div>
              {/* Overlay */}
              <div className="p-3">
                <div className="ml-2 flex items-center space-x-1">
                  <Switch
                    id="autoCompleteOverlay"
                    checked={!!brightness}
                    onCheckedChange={toggleBrightness}
                  />
                  <Label htmlFor="autoCompleteOverlay" className="cursor-pointer">
                    <div className="ml-2">
                      <h3 className="text-sm font-semibold text-slate-700">Background Overlay</h3>
                      <p className="text-xs font-normal text-slate-500">
                        Darken or lighten background of your choice.
                      </p>
                    </div>
                  </Label>
                </div>
                {brightness && (
                  <div>
                    <div className="mt-4 flex flex-col justify-center rounded-lg border bg-slate-50 p-4 px-8">
                      <h3 className="mb-4 text-sm font-semibold text-slate-700">Transparency</h3>
                      <input
                        id="small-range"
                        type="range"
                        min="1"
                        max="200"
                        value={inputValue}
                        onChange={handleInputChange}
                        className="range-sm mb-6 h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* positioning */}
          {type !== "link" && (
            <div className="p-3 ">
              <div className="ml-2 flex items-center space-x-1">
                <Switch id="formDeadline" checked={!!placement} onCheckedChange={togglePlacement} />
                <Label htmlFor="formDeadline" className="cursor-pointer">
                  <div className="ml-2">
                    <h3 className="text-sm font-semibold text-slate-700">Overwrite Placement</h3>
                    <p className="text-xs font-normal text-slate-500">Change the placement of this form.</p>
                  </div>
                </Label>
              </div>
              {placement && (
                <div className="ml-2 mt-4 flex items-center space-x-1 pb-4">
                  <div className="flex w-full cursor-pointer items-center rounded-lg  border bg-slate-50 p-4">
                    <div className="w-full items-center">
                      <Placement
                        currentPlacement={placement}
                        setCurrentPlacement={handlePlacementChange}
                        setOverlay={handleOverlay}
                        overlay={darkOverlay ? "dark" : "light"}
                        setClickOutsideClose={handleClickOutsideClose}
                        clickOutsideClose={!!clickOutsideClose}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Highlight border */}
          {type !== "link" && (
            <div className="p-3 ">
              <div className="ml-2 flex items-center space-x-1">
                <Switch
                  id="autoComplete"
                  checked={!!highlightBorderColor}
                  onCheckedChange={toggleHighlightBorderColor}
                />
                <Label htmlFor="autoComplete" className="cursor-pointer">
                  <div className="ml-2">
                    <h3 className="text-sm font-semibold text-slate-700">Overwrite Highlight Border</h3>
                    <p className="text-xs font-normal text-slate-500">
                      Change the highlight border for this form.
                    </p>
                  </div>
                </Label>
              </div>
              {!!highlightBorderColor && (
                <div className="ml-2 mt-4 rounded-lg border bg-slate-50 p-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="highlightBorder"
                      checked={!!highlightBorderColor}
                      onCheckedChange={toggleHighlightBorderColor}
                    />
                    <h2 className="text-sm font-medium text-slate-800">Show highlight border</h2>
                  </div>
                  {!!highlightBorderColor && (
                    <div className="mt-6 w-full max-w-xs">
                      <Label htmlFor="brandcolor">Color (HEX)</Label>
                      <ColorPicker color={highlightBorderColor || ""} onChange={handleBorderColorChange} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
}
