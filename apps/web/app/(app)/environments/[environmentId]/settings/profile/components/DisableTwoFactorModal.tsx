"use client";

import { disableTwoFactorAuthAction } from "@/app/(app)/environments/[environmentId]/settings/profile/actions";
import { PasswordInput } from "@fastform/ui/PasswordInput";
import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import { OTPInput } from "@fastform/ui/OTPInput";
import { useRouter } from "next/navigation";
import { Modal } from "@fastform/ui/Modal";
import React, { useEffect, useState } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";

type TDisableTwoFactorFormState = {
  password: string;
  code: string;
  backupCode?: string;
};

type TDisableTwoFactorModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DisableTwoFactorModal = ({ open, setOpen }: TDisableTwoFactorModalProps) => {
  const router = useRouter();
  const { handleSubmit, control, setValue } = useForm<TDisableTwoFactorFormState>();
  const [backupCodeInputVisible, setBackupCodeInputVisible] = useState(false);

  useEffect(() => {
    setValue("backupCode", "");
    setValue("code", "");
  }, [backupCodeInputVisible, setValue]);

  const resetState = () => {
    setBackupCodeInputVisible(false);
    setValue("password", "");
    setValue("backupCode", "");
    setValue("code", "");
    setOpen(false);
  };

  const onSubmit: SubmitHandler<TDisableTwoFactorFormState> = async (data) => {
    const { code, password, backupCode } = data;

    try {
      const { message } = await disableTwoFactorAuthAction({ code, password, backupCode });
      toast.success(message);

      router.refresh();
      resetState();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={open} setOpen={() => resetState()} noPadding>
      <>
        <div>
          <div className="p-6">
            <h1 className="text-lg font-semibold">Disable two factor authentication</h1>
            <p className="text-sm text-slate-700">
              If you need to disable 2FA, we recommend re-enabling it as soon as possible.
            </p>
          </div>

          <form className="flex flex-col space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 px-6">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field, formState: { errors } }) => (
                  <>
                    <PasswordInput
                      id="password"
                      autoComplete="current-password"
                      placeholder="*******"
                      aria-placeholder="password"
                      required
                      className="focus:border-brand focus:ring-brand block w-full rounded-md border-slate-300 shadow-sm sm:text-sm"
                      {...field}
                    />

                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600" id="password-error">
                        {errors.password.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="px-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-sm font-medium text-slate-700">
                  {backupCodeInputVisible ? "Backup Code" : "Two-Factor Code"}
                </label>

                <p className="text-sm text-slate-700">
                  {backupCodeInputVisible
                    ? "Each backup code can be used exactly once to grant access without your authenticator."
                    : "Two-factor authentication enabled. Please enter the six-digit code from your authenticator app."}
                </p>
              </div>

              {backupCodeInputVisible ? (
                <Controller
                  name="backupCode"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="XXXXX-XXXXX" className="mt-2" />}
                />
              ) : (
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <OTPInput
                      value={field.value}
                      valueLength={6}
                      onChange={field.onChange}
                      containerClassName="justify-start mt-4"
                    />
                  )}
                />
              )}
            </div>

            <div className="flex w-full items-center justify-between border-t border-slate-300 p-4">
              <div>
                <Button
                  variant="minimal"
                  size="sm"
                  type="button"
                  onClick={() => setBackupCodeInputVisible((prev) => !prev)}>
                  {backupCodeInputVisible ? "Go Back" : "Lost access"}
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="secondary" size="sm" type="button" onClick={() => setOpen(false)}>
                  Cancel
                </Button>

                <Button variant="darkCTA" size="sm">
                  Disable
                </Button>
              </div>
            </div>
          </form>
        </div>
      </>
    </Modal>
  );
};

export default DisableTwoFactorModal;
