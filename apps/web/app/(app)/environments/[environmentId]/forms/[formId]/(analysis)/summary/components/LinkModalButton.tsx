"use client";

import { TForm } from "@fastform/types/forms";
import { Button } from "@fastform/ui/Button";
import { ShareIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import clsx from "clsx";
import { TProduct } from "@fastform/types/product";
import ShareEmbedForm from "./ShareEmbedForm";
import { TProfile } from "@fastform/types/profile";

interface LinkFormShareButtonProps {
  form: TForm;
  className?: string;
  webAppUrl: string;
  product: TProduct;
  profile: TProfile;
}

export default function LinkFormShareButton({
  form,
  className,
  webAppUrl,
  product,
  profile,
}: LinkFormShareButtonProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className={clsx(
          "border border-slate-300 bg-white px-2 hover:bg-slate-100 focus:bg-slate-100 lg:px-6",
          className
        )}
        onClick={() => {
          setShowLinkModal(true);
        }}>
        <ShareIcon className="h-5 w-5" />
      </Button>
      {showLinkModal && (
        <ShareEmbedForm
          form={form}
          open={showLinkModal}
          setOpen={setShowLinkModal}
          product={product}
          webAppUrl={webAppUrl}
          profile={profile}
        />
      )}
    </>
  );
}
