"use client";

import { Button } from "@fastform/ui/Button";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";

export const GoogleButton = ({
  text = "Continue with Google",
  inviteUrl,
}: {
  text?: string;
  inviteUrl?: string | null;
}) => {
  const handleLogin = async () => {
    await signIn("google", {
      redirect: true,
      callbackUrl: inviteUrl ? inviteUrl : "/", // redirect after login to /
    });
  };

  return (
    <Button
      type="button"
      EndIcon={FaGoogle}
      startIconClassName="ml-3"
      onClick={handleLogin}
      variant="secondary"
      className="w-full justify-center">
      {text}
    </Button>
  );
};
