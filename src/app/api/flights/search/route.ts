import type { NextRequest } from "next/server";
import { searchParamsToRawInput } from "@/lib/flights/search-params";
import { createFlightSearchService } from "@/lib/flights/service";
import type { FlightSearchResult, SearchApiError } from "@/lib/flights/types";
import { validateSearchInput } from "@/lib/flights/validation";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: NextRequest) {
  const validation = validateSearchInput(searchParamsToRawInput(request.nextUrl.searchParams));
  if (!validation.ok) {
    return Response.json(
      {
        error: "invalid_request",
        message: "Some search criteria are invalid.",
        fieldErrors: validation.errors,
      } satisfies SearchApiError,
      { status: 400, headers: NO_STORE },
    );
  }

  try {
    const result = await createFlightSearchService().search(validation.value);
    return Response.json(result satisfies FlightSearchResult, { headers: NO_STORE });
  } catch (error) {
    console.error("Flight search failed", error);
    return Response.json(
      {
        error: "provider_error",
        message: "Flight search is temporarily unavailable. Please try again.",
      } satisfies SearchApiError,
      { status: 502, headers: NO_STORE },
    );
  }
}
