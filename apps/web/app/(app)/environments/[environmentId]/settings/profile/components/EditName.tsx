"use client";

import { Button } from "@fastform/ui/Button";
import { Input } from "@fastform/ui/Input";
import { Label } from "@fastform/ui/Label";
import { useForm, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { updateProfileAction } from "../actions";
import { TProfile } from "@fastform/types/profile";

type FormData = {
  name: string;
};

export function EditName({ profile }: { profile: TProfile }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = useForm<FormData>();

  const nameValue = watch("name", profile.name || "");
  const isNotEmptySpaces = (value: string) => value.trim() !== "";

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      data.name = data.name.trim();
      if (!isNotEmptySpaces(data.name)) {
        toast.error("Please enter at least one character");
        return;
      }
      if (data.name === profile.name) {
        toast.success("This is already your name");
        return;
      }
      await updateProfileAction({ name: data.name });
      toast.success("Your name was updated successfully");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <form className="w-full max-w-sm items-center" onSubmit={handleSubmit(onSubmit)}>
        <Label htmlFor="fullname">Full Name</Label>
        <Input
          type="text"
          id="fullname"
          defaultValue={profile.name || ""}
          {...register("name", { required: true })}
        />

        <div className="mt-4">
          <Label htmlFor="email">Email</Label>
          <Input type="email" id="fullname" defaultValue={profile.email} disabled />
        </div>
        <Button
          type="submit"
          variant="darkCTA"
          className="mt-4"
          loading={isSubmitting}
          disabled={nameValue === "" || isSubmitting}>
          Update
        </Button>
      </form>
    </>
  );
}
