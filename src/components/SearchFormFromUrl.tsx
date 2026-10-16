"use client";

import { useSearchParams } from "next/navigation";
import { SearchForm } from "@/components/SearchForm";
import { formValuesFromSearchParams } from "@/lib/search-form";

/** Pre-fills the search form from query params so "Modify search" keeps previous criteria. */
export function SearchFormFromUrl() {
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  return <SearchForm key={queryString} initialValues={formValuesFromSearchParams(searchParams)} />;
}
