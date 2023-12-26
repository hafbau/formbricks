import { TformSingleUse } from "@fastform/types/forms";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import footerLogo from "../lib/footerlogo.svg";

type FormLinkUsedProps = {
  singleUseMessage: TformSingleUse | null;
};

const FormLinkUsed = ({ singleUseMessage }: FormLinkUsedProps) => {
  const defaultHeading = "The form has already been answered.";
  const defaultSubheading = "You can only use this link once.";
  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-tr from-slate-200 to-slate-50 py-8 text-center">
      <div></div>
      <div className="flex flex-col items-center space-y-3 text-slate-300">
        <CheckCircleIcon className="h-20 w-20" />
        <h1 className="text-4xl font-bold text-slate-800">
          {!!singleUseMessage?.heading ? singleUseMessage?.heading : defaultHeading}
        </h1>
        <p className="text-lg leading-10 text-gray-500">
          {!!singleUseMessage?.subheading ? singleUseMessage?.subheading : defaultSubheading}
        </p>
      </div>
      <div>
        <Link href="https://getfastform.com">
          <Image src={footerLogo} alt="Brand logo" className="mx-auto w-40" />
        </Link>
      </div>
    </div>
  );
};

export default FormLinkUsed;
