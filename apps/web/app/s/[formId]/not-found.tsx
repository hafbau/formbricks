import React from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import footerLogo from "./lib/footerlogo.svg";
import Image from "next/image";
import { Button } from "@fastform/ui/Button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-between bg-gradient-to-br from-slate-200 to-slate-50 py-8 text-center">
      <div></div>
      <div className="flex flex-col items-center space-y-3 text-slate-300">
        <QuestionMarkCircleIcon className="h-20 w-20" />,
        <h1 className="text-4xl font-bold text-slate-800">Form not found.</h1>
        <p className="text-lg leading-10 text-gray-500">There is no form with this ID.</p>
        <Button variant="darkCTA" className="mt-2" href="https://getfastform.com">
          Create your own
        </Button>
      </div>
      <div>
        <Link href="https://getfastform.com">
          <Image src={footerLogo} alt="Brand logo" className="mx-auto w-40" />
        </Link>
      </div>
    </div>
  );
}
