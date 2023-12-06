import { PHProvider, PostHogPageview } from "@fastform/ui/PostHogClient";
import { Suspense } from "react";
import { NoMobileOverlay } from "@fastform/ui/NoMobileOverlay";

export default function AppLayout({ children }) {
  return (
    <>
      <NoMobileOverlay />
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <PHProvider>{children}</PHProvider>
    </>
  );
}
