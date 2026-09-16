import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverView } from "@/components/discovery/discover-view";
import { KireetaLoader } from "@/components/cultural/states";

export const metadata: Metadata = {
  title: "Discover Karnataka",
  description: "Cultural experiences published by the people who carry them, on their own terms.",
};

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[80vh] place-items-center bg-night">
          <KireetaLoader label="Loading experiences" />
        </div>
      }
    >
      <DiscoverView />
    </Suspense>
  );
}
