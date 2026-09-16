import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingFlow } from "@/components/booking/booking-flow";
import { KireetaLoader } from "@/components/cultural/states";

export const metadata: Metadata = { title: "Enter with respect" };

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[90vh] place-items-center bg-night">
          <KireetaLoader label="Preparing the custodian's terms" />
        </div>
      }
    >
      <BookingFlow id={id} />
    </Suspense>
  );
}
