import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/StatusMessage";
import { ResultsView } from "@/components/ResultsView";

export const metadata: Metadata = {
  title: "Flight comparison – GroupTrip",
};

export default function ResultsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Suspense fallback={<LoadingState />}>
        <ResultsView />
      </Suspense>
    </main>
  );
}
