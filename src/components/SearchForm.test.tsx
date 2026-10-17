import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_FORM_VALUES } from "@/lib/search-form";
import { isoDaysFromToday } from "@/test/fixtures";
import { SearchForm } from "./SearchForm";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const initialValues = {
  ...DEFAULT_FORM_VALUES,
  departureDate: isoDaysFromToday(30),
  returnDate: isoDaysFromToday(40),
  destinations: ["DPS"],
};

describe("SearchForm", () => {
  beforeEach(() => push.mockReset());

  it("renders default SYD origin and suggested destinations", () => {
    render(<SearchForm initialValues={initialValues} />);
    expect(screen.getByLabelText("Departure airport")).toHaveValue("SYD");
    for (const code of ["DPS", "AKL", "ZQN", "SGN", "DAD"]) {
      expect(screen.getByRole("button", { name: new RegExp(`\\(${code}\\)`) })).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /\(DPS\)/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("navigates to results with serialised criteria", async () => {
    const user = userEvent.setup();
    render(<SearchForm initialValues={initialValues} />);
    await user.click(screen.getByRole("button", { name: /\(AKL\)/ }));
    await user.type(screen.getByLabelText("Other destination IATA code"), "nan{Enter}");
    await user.click(screen.getByRole("button", { name: "Increase adults" }));
    await user.type(screen.getByLabelText(/Family budget/), "9000");
    await user.click(screen.getByRole("button", { name: "Search Flights" }));

    expect(push).toHaveBeenCalledTimes(1);
    const url = new URL(push.mock.calls[0][0], "http://localhost");
    expect(url.pathname).toBe("/results");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      origin: "SYD",
      destinations: "DPS,AKL,NAN",
      departureDate: initialValues.departureDate,
      returnDate: initialValues.returnDate,
      adults: "3",
      maxBudget: "9000",
    });
  });

  it("shows validation errors and does not navigate", async () => {
    const user = userEvent.setup();
    render(<SearchForm initialValues={{ ...initialValues, returnDate: initialValues.departureDate }} />);
    await user.click(screen.getByRole("button", { name: /\(DPS\)/ }));
    await user.clear(screen.getByLabelText("Departure airport"));
    await user.click(screen.getByRole("button", { name: "Search Flights" }));

    expect(push).not.toHaveBeenCalled();
    expect(screen.getByText("Departure airport is required.")).toBeInTheDocument();
    expect(screen.getByText("Choose at least one destination.")).toBeInTheDocument();
    expect(screen.getByText("Return date must be after the departure date.")).toBeInTheDocument();
    expect(screen.getByLabelText("Departure airport")).toHaveAttribute("aria-invalid", "true");
  });

  it("rejects an invalid custom IATA code", async () => {
    const user = userEvent.setup();
    render(<SearchForm initialValues={initialValues} />);
    await user.type(screen.getByLabelText("Other destination IATA code"), "N1");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText(/Enter a 3-letter IATA code/)).toBeInTheDocument();
  });

  it("rejects a well-formed code that isn't a known airport", async () => {
    const user = userEvent.setup();
    render(<SearchForm initialValues={initialValues} />);
    await user.type(screen.getByLabelText("Other destination IATA code"), "XYZ{Enter}");
    expect(screen.getByText(/XYZ isn't in GroupTrip's airport list/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove XYZ" })).not.toBeInTheDocument();
  });

  it("collects child ages and lap infants", async () => {
    const user = userEvent.setup();
    render(<SearchForm initialValues={initialValues} />);
    await user.click(screen.getByRole("button", { name: "Increase children" }));
    await user.click(screen.getByRole("button", { name: "Increase children" }));
    await user.click(screen.getByRole("button", { name: "Search Flights" }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByText("Select an age for each child.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Child 1 age"), "4");
    await user.selectOptions(screen.getByLabelText("Child 2 age"), "9");
    await user.click(screen.getByRole("button", { name: "Increase infants" }));
    await user.click(screen.getByRole("button", { name: "Increase infants" }));
    expect(screen.getByRole("button", { name: "Increase infants" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Decrease adults" }));
    expect(screen.getByLabelText("Infants")).toHaveValue(1);
    await user.click(screen.getByRole("button", { name: "Search Flights" }));

    const url = new URL(push.mock.calls[0][0], "http://localhost");
    expect(url.searchParams.get("adults")).toBe("1");
    expect(url.searchParams.get("childAges")).toBe("4,9");
    expect(url.searchParams.get("infants")).toBe("1");
  });
});
