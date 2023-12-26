import FastformClient from "@/app/(app)/components/FastformClient";
import { PHProvider, PostHogPageview } from "@fastform/ui/PostHogClient";
import { authOptions } from "@fastform/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PosthogIdentify from "./components/PosthogIdentify";
import { NoMobileOverlay } from "@fastform/ui/NoMobileOverlay";

export default async function AppLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return redirect(`/auth/login`);
  }

  return (
    <>
      <NoMobileOverlay />
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <PHProvider>
        <>
          <PosthogIdentify session={session} />
          <FastformClient session={session} />
          {children}
        </>
      </PHProvider>
    </>
  );
}
