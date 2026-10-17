import { Suspense } from "react";
import { MockDataBanner } from "@/components/MockDataBanner";
import { SearchFormFromUrl } from "@/components/SearchFormFromUrl";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <section className="mb-6 sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          GroupTrip – Holiday Flight Finder
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Compare return flights from Sydney for your family — Bali, Vietnam, New Zealand and more — and see
          the total return price for your travellers at a glance. Each family in the group runs its own search.
        </p>
      </section>

      <MockDataBanner className="mb-6" />

      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-2xl bg-white shadow-sm" />}>
        <SearchFormFromUrl />
      </Suspense>

      <aside className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <strong className="text-slate-800">Local getaways:</strong> Hyams Beach and Jervis Bay are roughly a
        3-hour drive south of Sydney, so they aren&apos;t part of this flight comparison.
      </aside>
    </main>
  );
}
