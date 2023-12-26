"use client";
import { TForm } from "@fastform/types/forms";
import { AdvancedOptionToggle } from "@fastform/ui/AdvancedOptionToggle";
import { DatePicker } from "@fastform/ui/DatePicker";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { Switch } from "@fastform/ui/Switch";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { KeyboardEventHandler, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ResponseOptionsCardProps {
  localform: TForm;
  setLocalform: (form: TForm | ((TForm) => TForm)) => void;
  responseCount: number;
}

export default function ResponseOptionsCard({
  localform,
  setLocalform,
  responseCount,
}: ResponseOptionsCardProps) {
  const [open, setOpen] = useState(false);
  const autoComplete = localform.autoComplete !== null;
  const [redirectToggle, setRedirectToggle] = useState(false);
  const [formCloseOnDateToggle, setformCloseOnDateToggle] = useState(false);
  useState;
  const [redirectUrl, setRedirectUrl] = useState<string | null>("");
  const [formClosedMessageToggle, setformClosedMessageToggle] = useState(false);
  const [verifyEmailToggle, setVerifyEmailToggle] = useState(false);

  const [formClosedMessage, setformClosedMessage] = useState({
    heading: "Form Completed",
    subheading: "This free & open-source form has been closed",
  });

  const [singleUseMessage, setSingleUseMessage] = useState({
    heading: "The form has already been answered.",
    subheading: "You can only use this link once.",
  });

  const [singleUseEncryption, setSingleUseEncryption] = useState(true);
  const [verifyEmailformDetails, setVerifyEmailformDetails] = useState({
    name: "",
    subheading: "",
  });
  const [closeOnDate, setCloseOnDate] = useState<Date>();

  const isPinProtectionEnabled = localform.pin !== null;

  const [verifyProtectWithPinError, setVerifyProtectWithPinError] = useState<string | null>(null);

  const handleRedirectCheckMark = () => {
    setRedirectToggle((prev) => !prev);

    if (redirectToggle && localform.redirectUrl) {
      setRedirectUrl(null);
      setLocalform({ ...localform, redirectUrl: null });
    }
  };

  const handleformCloseOnDateToggle = () => {
    if (formCloseOnDateToggle && localform.closeOnDate) {
      setformCloseOnDateToggle(false);
      setCloseOnDate(undefined);
      setLocalform({ ...localform, closeOnDate: null });
      return;
    }

    if (formCloseOnDateToggle) {
      setformCloseOnDateToggle(false);
      return;
    }
    setformCloseOnDateToggle(true);
  };

  const handleProtectformWithPinToggle = () => {
    setLocalform((prevform) => ({ ...prevform, pin: isPinProtectionEnabled ? null : "1234" }));
  };

  const handleProtectformPinChange = (pin: string) => {
    //check if pin only contains numbers
    const validation = /^\d+$/;
    const isValidPin = validation.test(pin);
    if (!isValidPin) return toast.error("PIN can only contain numbers");
    setLocalform({ ...localform, pin });
  };

  const handleProtectformPinBlurEvent = () => {
    if (!localform.pin) return setVerifyProtectWithPinError(null);

    const regexPattern = /^\d{4}$/;
    const isValidPin = regexPattern.test(`${localform.pin}`);

    if (!isValidPin) return setVerifyProtectWithPinError("PIN must be a four digit number.");
    setVerifyProtectWithPinError(null);
  };

  const handleformPinInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    const exceptThisSymbols = ["e", "E", "+", "-", "."];
    if (exceptThisSymbols.includes(e.key)) e.preventDefault();
  };

  const handleRedirectUrlChange = (link: string) => {
    setRedirectUrl(link);
    setLocalform({ ...localform, redirectUrl: link });
  };

  const handleCloseformMessageToggle = () => {
    setformClosedMessageToggle((prev) => !prev);

    if (formClosedMessageToggle && localform.formClosedMessage) {
      setLocalform({ ...localform, formClosedMessage: null });
    }
  };

  const handleVerifyEmailToogle = () => {
    setVerifyEmailToggle((prev) => !prev);

    if (verifyEmailToggle && localform.verifyEmail) {
      setLocalform({ ...localform, verifyEmail: null });
    }
  };

  const handleCloseOnDateChange = (date: Date) => {
    const equivalentDate = date?.getDate();
    date?.setUTCHours(0, 0, 0, 0);
    date?.setDate(equivalentDate);

    setCloseOnDate(date);
    setLocalform({ ...localform, closeOnDate: date ?? null });
  };

  const handleClosedformMessageChange = ({
    heading,
    subheading,
  }: {
    heading?: string;
    subheading?: string;
  }) => {
    const message = {
      enabled: formCloseOnDateToggle,
      heading: heading ?? formClosedMessage.heading,
      subheading: subheading ?? formClosedMessage.subheading,
    };

    setformClosedMessage(message);
    setLocalform({ ...localform, formClosedMessage: message });
  };

  const handleSingleUseformToggle = () => {
    if (!localform.singleUse?.enabled) {
      setLocalform({
        ...localform,
        singleUse: { enabled: true, ...singleUseMessage, isEncrypted: singleUseEncryption },
      });
    } else {
      setLocalform({ ...localform, singleUse: { enabled: false, isEncrypted: false } });
    }
  };

  const handleSingleUseformMessageChange = ({
    heading,
    subheading,
  }: {
    heading?: string;
    subheading?: string;
  }) => {
    const message = {
      heading: heading ?? singleUseMessage.heading,
      subheading: subheading ?? singleUseMessage.subheading,
    };

    const localformSingleUseEnabled = localform.singleUse?.enabled ?? false;
    setSingleUseMessage(message);
    setLocalform({
      ...localform,
      singleUse: { enabled: localformSingleUseEnabled, ...message, isEncrypted: singleUseEncryption },
    });
  };

  const hangleSingleUseEncryptionToggle = () => {
    if (!singleUseEncryption) {
      setSingleUseEncryption(true);
      setLocalform({
        ...localform,
        singleUse: { enabled: true, ...singleUseMessage, isEncrypted: true },
      });
    } else {
      setSingleUseEncryption(false);
      setLocalform({
        ...localform,
        singleUse: { enabled: true, ...singleUseMessage, isEncrypted: false },
      });
    }
  };

  const handleVerifyEmailformDetailsChange = ({
    name,
    subheading,
  }: {
    name?: string;
    subheading?: string;
  }) => {
    const message = {
      name: name || verifyEmailformDetails.name,
      subheading: subheading || verifyEmailformDetails.subheading,
    };

    setVerifyEmailformDetails(message);
    setLocalform({ ...localform, verifyEmail: message });
  };

  useEffect(() => {
    if (localform.redirectUrl) {
      setRedirectUrl(localform.redirectUrl);
      setRedirectToggle(true);
    }

    if (!!localform.formClosedMessage) {
      setformClosedMessage({
        heading: localform.formClosedMessage.heading ?? formClosedMessage.heading,
        subheading: localform.formClosedMessage.subheading ?? formClosedMessage.subheading,
      });
      setformClosedMessageToggle(true);
    }

    if (localform.singleUse?.enabled) {
      setSingleUseMessage({
        heading: localform.singleUse.heading ?? singleUseMessage.heading,
        subheading: localform.singleUse.subheading ?? singleUseMessage.subheading,
      });
      setSingleUseEncryption(localform.singleUse.isEncrypted);
    }

    if (localform.verifyEmail) {
      setVerifyEmailformDetails({
        name: localform.verifyEmail.name!,
        subheading: localform.verifyEmail.subheading!,
      });
      setVerifyEmailToggle(true);
    }

    if (localform.closeOnDate) {
      setCloseOnDate(localform.closeOnDate);
      setformCloseOnDateToggle(true);
    }
  }, [localform]);

  const handleCheckMark = () => {
    if (autoComplete) {
      const updatedform = { ...localform, autoComplete: null };
      setLocalform(updatedform);
    } else {
      const updatedform = { ...localform, autoComplete: 25 };
      setLocalform(updatedform);
    }
  };

  const handleInputResponse = (e) => {
    const updatedform = { ...localform, autoComplete: parseInt(e.target.value) };
    setLocalform(updatedform);
  };

  const handleInputResponseBlur = (e) => {
    if (parseInt(e.target.value) === 0) {
      toast.error("Response limit can't be set to 0");
      return;
    }

    if (parseInt(e.target.value) <= responseCount) {
      toast.error(`Response limit needs to exceed number of received responses (${responseCount}).`);
      return;
    }
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
            <p className="font-semibold text-slate-800">Response Options</p>
            <p className="mt-1 text-sm text-slate-500">Decide how and how long people can respond.</p>
          </div>
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent>
        <hr className="py-1 text-slate-600" />
        <div className="p-3">
          {/* Close Form on Limit */}
          <AdvancedOptionToggle
            htmlId="closeOnNumberOfResponse"
            isChecked={autoComplete}
            onToggle={handleCheckMark}
            title="Close form on response limit"
            description="Automatically close the form after a certain number of responses."
            childBorder={true}>
            <label htmlFor="autoCompleteResponses" className="cursor-pointer bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Automatically mark the form as complete after
                <Input
                  autoFocus
                  type="number"
                  min={responseCount ? (responseCount + 1).toString() : "1"}
                  id="autoCompleteResponses"
                  value={localform.autoComplete?.toString()}
                  onChange={handleInputResponse}
                  onBlur={handleInputResponseBlur}
                  className="ml-2 mr-2 inline w-20 bg-white text-center text-sm"
                />
                completed responses.
              </p>
            </label>
          </AdvancedOptionToggle>
          {/* Close Form on Date */}
          <AdvancedOptionToggle
            htmlId="closeOnDate"
            isChecked={formCloseOnDateToggle}
            onToggle={handleformCloseOnDateToggle}
            title="Close form on date"
            description="Automatically closes the form at the beginning of the day (UTC)."
            childBorder={true}>
            <div className="flex cursor-pointer p-4">
              <p className="mr-2 mt-3 text-sm font-semibold text-slate-700">
                Automatically mark form as complete on:
              </p>
              <DatePicker date={closeOnDate} handleDateChange={handleCloseOnDateChange} />
            </div>
          </AdvancedOptionToggle>

          {/* Redirect on completion */}
          <AdvancedOptionToggle
            htmlId="redirectUrl"
            isChecked={redirectToggle}
            onToggle={handleRedirectCheckMark}
            title="Redirect on completion"
            description="Redirect user to specified link on form completion"
            childBorder={true}>
            <div className="w-full p-4">
              <div className="flex w-full cursor-pointer items-center">
                <p className="mr-2 w-[400px] text-sm font-semibold text-slate-700">
                  Redirect respondents here:
                </p>
                <Input
                  autoFocus
                  className="w-full bg-white"
                  type="url"
                  placeholder="https://www.example.com"
                  value={redirectUrl ? redirectUrl : ""}
                  onChange={(e) => handleRedirectUrlChange(e.target.value)}
                />
              </div>
            </div>
          </AdvancedOptionToggle>

          {localform.type === "link" && (
            <>
              {/* Adjust Form Closed Message */}
              <AdvancedOptionToggle
                htmlId="adjustformClosedMessage"
                isChecked={formClosedMessageToggle}
                onToggle={handleCloseformMessageToggle}
                title="Adjust 'Form Closed' message"
                description="Change the message visitors see when the form is closed."
                childBorder={true}>
                <div className="flex w-full items-center space-x-1 p-4 pb-4">
                  <div className="w-full cursor-pointer items-center  bg-slate-50">
                    <Label htmlFor="headline">Heading</Label>
                    <Input
                      autoFocus
                      id="heading"
                      className="mb-4 mt-2 bg-white"
                      name="heading"
                      defaultValue={formClosedMessage.heading}
                      onChange={(e) => handleClosedformMessageChange({ heading: e.target.value })}
                    />

                    <Label htmlFor="headline">Subheading</Label>
                    <Input
                      className="mt-2 bg-white"
                      id="subheading"
                      name="subheading"
                      defaultValue={formClosedMessage.subheading}
                      onChange={(e) => handleClosedformMessageChange({ subheading: e.target.value })}
                    />
                  </div>
                </div>
              </AdvancedOptionToggle>

              {/* Single User Form Options */}
              <AdvancedOptionToggle
                htmlId="singleUserformOptions"
                isChecked={!!localform.singleUse?.enabled}
                onToggle={handleSingleUseformToggle}
                title="Single-Use Form Links"
                description="Allow only 1 response per form link."
                childBorder={true}>
                <div className="flex w-full items-center space-x-1 p-4 pb-4">
                  <div className="w-full cursor-pointer items-center  bg-slate-50">
                    <div className="row mb-2 flex cursor-default items-center space-x-2">
                      <Label htmlFor="howItWorks">How it works</Label>
                    </div>
                    <ul className="mb-3 ml-4 cursor-default list-inside list-disc space-y-1">
                      <li className="text-sm text-slate-600">
                        Blocks form if the form URL has no Single Use Id (suId).
                      </li>
                      <li className="text-sm text-slate-600">
                        Blocks form if a submission with the Single Use Id (suId) in the URL exists already.
                      </li>
                    </ul>
                    <Label htmlFor="headline">&lsquo;Link Used&rsquo; Message</Label>
                    <Input
                      autoFocus
                      id="heading"
                      className="mb-4 mt-2 bg-white"
                      name="heading"
                      defaultValue={singleUseMessage.heading}
                      onChange={(e) => handleSingleUseformMessageChange({ heading: e.target.value })}
                    />

                    <Label htmlFor="headline">Subheading</Label>
                    <Input
                      className="mb-4 mt-2 bg-white"
                      id="subheading"
                      name="subheading"
                      defaultValue={singleUseMessage.subheading}
                      onChange={(e) => handleSingleUseformMessageChange({ subheading: e.target.value })}
                    />
                    <Label htmlFor="headline">URL Encryption</Label>
                    <div>
                      <div className="mt-2 flex items-center space-x-1 ">
                        <Switch
                          id="encryption-switch"
                          checked={singleUseEncryption}
                          onCheckedChange={hangleSingleUseEncryptionToggle}
                        />
                        <Label htmlFor="encryption-label">
                          <div className="ml-2">
                            <p className="text-sm font-normal text-slate-600">
                              Enable encryption of Single Use Id (suId) in form URL.
                            </p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </AdvancedOptionToggle>

              {/* Verify Email Section */}
              <AdvancedOptionToggle
                htmlId="verifyEmailBeforeSubmission"
                isChecked={verifyEmailToggle}
                onToggle={handleVerifyEmailToogle}
                title="Verify email before submission"
                description="Only let people with a real email respond."
                childBorder={true}>
                <div className="flex w-full items-center space-x-1 p-4 pb-4">
                  <div className="w-full cursor-pointer items-center  bg-slate-50">
                    <p className="text-md font-semibold">How it works</p>
                    <p className="mb-4 mt-2 text-sm text-slate-500">
                      Respondants will receive the form link via email.
                    </p>
                    <Label htmlFor="headline">Form Name (Public)</Label>
                    <Input
                      autoFocus
                      id="heading"
                      className="mb-4 mt-2 bg-white"
                      name="heading"
                      placeholder="Job Application Form"
                      defaultValue={verifyEmailformDetails.name}
                      onChange={(e) => handleVerifyEmailformDetailsChange({ name: e.target.value })}
                    />

                    <Label htmlFor="headline">Subheader (Public)</Label>
                    <Input
                      className="mt-2 bg-white"
                      id="subheading"
                      name="subheading"
                      placeholder="Thanks for applying as a full stack engineer"
                      defaultValue={verifyEmailformDetails.subheading}
                      onChange={(e) => handleVerifyEmailformDetailsChange({ subheading: e.target.value })}
                    />
                  </div>
                </div>
              </AdvancedOptionToggle>
              <AdvancedOptionToggle
                htmlId="protectformWithPin"
                isChecked={isPinProtectionEnabled}
                onToggle={handleProtectformWithPinToggle}
                title="Protect Form with a PIN"
                description="Only users who have the PIN can access the form."
                childBorder={true}>
                <div className="flex w-full items-center space-x-1 p-4 pb-4">
                  <div className="w-full cursor-pointer items-center  bg-slate-50">
                    <Label htmlFor="headline">Add PIN</Label>
                    <Input
                      autoFocus
                      id="pin"
                      isInvalid={Boolean(verifyProtectWithPinError)}
                      className="mb-4 mt-2 bg-white"
                      name="pin"
                      placeholder="1234"
                      onBlur={handleProtectformPinBlurEvent}
                      defaultValue={localform.pin ? localform.pin : undefined}
                      onKeyDown={handleformPinInputKeyDown}
                      onChange={(e) => handleProtectformPinChange(e.target.value)}
                    />
                    {verifyProtectWithPinError && (
                      <p className="text-sm text-red-700">{verifyProtectWithPinError}</p>
                    )}
                  </div>
                </div>
              </AdvancedOptionToggle>
            </>
          )}
        </div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
}
