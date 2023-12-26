import { TForm } from "@fastform/types/forms";
import { useState } from "react";
import AnimatedFormBg from "./AnimatedFormBg";
import ColorFormBg from "./ColorFormBg";
import ImageFormBg from "./ImageFormBg";

interface FormBgSelectorTabProps {
  localform: TForm;
  handleBgChange: (bg: string, bgType: string) => void;
  colours: string[];
  bgType: string | null | undefined;
}

const TabButton = ({ isActive, onClick, children }) => (
  <button
    className={`w-1/4 rounded-md p-2 text-sm font-medium leading-none text-slate-800 ${
      isActive ? "bg-white shadow-sm" : ""
    }`}
    onClick={onClick}>
    {children}
  </button>
);

export default function FormBgSelectorTab({
  localform,
  handleBgChange,
  colours,
  bgType,
}: FormBgSelectorTabProps) {
  const [tab, setTab] = useState(bgType || "image");

  const renderContent = () => {
    switch (tab) {
      case "image":
        return <ImageFormBg localform={localform} handleBgChange={handleBgChange} />;
      case "animation":
        return <AnimatedFormBg localform={localform} handleBgChange={handleBgChange} />;
      case "color":
        return <ColorFormBg localform={localform} handleBgChange={handleBgChange} colours={colours} />;
      default:
        return null;
    }
  };

  return (
    <div className="mt-4 flex flex-col items-center justify-center rounded-lg border bg-slate-50 p-4 px-8">
      <div className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-6 py-1.5">
        <TabButton isActive={tab === "image"} onClick={() => setTab("image")}>
          Image
        </TabButton>
        <TabButton isActive={tab === "animation"} onClick={() => setTab("animation")}>
          Animation
        </TabButton>
        <TabButton isActive={tab === "color"} onClick={() => setTab("color")}>
          Color
        </TabButton>
      </div>
      {renderContent()}
    </div>
  );
}
