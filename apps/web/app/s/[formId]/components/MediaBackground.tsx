"use client";

import { Tform } from "@fastform/types/forms";
import React from "react";

interface MediaBackgroundProps {
  children: React.ReactNode;
  form: Tform;
  isEditorView?: boolean;
  isMobilePreview?: boolean;
  ContentRef?: React.RefObject<HTMLDivElement>;
}

export const MediaBackground: React.FC<MediaBackgroundProps> = ({
  children,
  form,
  isEditorView = false,
  isMobilePreview = false,
  ContentRef,
}) => {
  const getFilterStyle = () => {
    return form.styling?.background?.brightness ? `brightness-${form.styling?.background?.brightness}` : "";
  };

  const renderBackground = () => {
    const filterStyle = getFilterStyle();
    const baseClasses = "absolute inset-0 h-full w-full";

    switch (form.styling?.background?.bgType) {
      case "color":
        return (
          <div
            className={`${baseClasses} ${filterStyle}`}
            style={{ backgroundColor: form.styling?.background?.bg || "#ffff" }}
          />
        );
      case "animation":
        return (
          <video muted loop autoPlay className={`${baseClasses} object-cover ${filterStyle}`}>
            <source src={form.styling?.background?.bg || ""} type="video/mp4" />
          </video>
        );
      case "image":
        return (
          <div
            className={`${baseClasses} bg-cover bg-center ${filterStyle}`}
            style={{ backgroundImage: `url(${form.styling?.background?.bg})` }}
          />
        );
      default:
        return <div className={`${baseClasses} bg-white`} />;
    }
  };

  const renderContent = () => (
    <div className="absolute flex h-full w-full items-center justify-center overflow-y-auto">{children}</div>
  );

  if (isMobilePreview) {
    return (
      <div
        ref={ContentRef}
        className={`relative h-[90%] max-h-[40rem] w-80 overflow-hidden rounded-3xl border-8 border-slate-500 ${getFilterStyle()}`}>
        {renderBackground()}
        {renderContent()}
      </div>
    );
  } else if (isEditorView) {
    return (
      <div ref={ContentRef} className="flex flex-grow flex-col overflow-y-auto rounded-b-lg">
        <div className="relative flex w-full flex-grow flex-col items-center justify-center p-4 py-6">
          {renderBackground()}
          <div className="flex h-full w-full items-center justify-center">{children}</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-2">
        {renderBackground()}
        <div className="relative w-full">{children}</div>
      </div>
    );
  }
};
