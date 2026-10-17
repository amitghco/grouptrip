import type { Airline, AirportCode } from "../types";

/**
 * Illustrative route profiles for generating mock offers.
 * Airlines, durations and fares are approximations for demo purposes only.
 */
export interface MockRouteOption {
  airline: Airline;
  stopovers: AirportCode[];
  /** One-way duration including connections. */
  durationMinutes: number;
  /** Multiplier applied to the route's base adult fare. */
  fareFactor: number;
}

export interface MockRouteProfile {
  /** Approximate return economy fare per adult in AUD. */
  baseAdultFare: number;
  options: MockRouteOption[];
}

const A = {
  QF: { code: "QF", name: "Qantas" },
  VA: { code: "VA", name: "Virgin Australia" },
  JQ: { code: "JQ", name: "Jetstar" },
  NZ: { code: "NZ", name: "Air New Zealand" },
  GA: { code: "GA", name: "Garuda Indonesia" },
  SQ: { code: "SQ", name: "Singapore Airlines" },
  MH: { code: "MH", name: "Malaysia Airlines" },
  VN: { code: "VN", name: "Vietnam Airlines" },
  VJ: { code: "VJ", name: "Vietjet" },
  EK: { code: "EK", name: "Emirates" },
  TR: { code: "TR", name: "Scoot" },
} satisfies Record<string, Airline>;

export const MOCK_ROUTES: Record<AirportCode, MockRouteProfile> = {
  DPS: {
    baseAdultFare: 720,
    options: [
      { airline: A.QF, stopovers: [], durationMinutes: 380, fareFactor: 1.15 },
      { airline: A.VA, stopovers: [], durationMinutes: 385, fareFactor: 1.0 },
      { airline: A.JQ, stopovers: [], durationMinutes: 390, fareFactor: 0.75 },
      { airline: A.GA, stopovers: [], durationMinutes: 390, fareFactor: 0.95 },
      { airline: A.SQ, stopovers: ["SIN"], durationMinutes: 650, fareFactor: 1.05 },
      { airline: A.MH, stopovers: ["KUL"], durationMinutes: 700, fareFactor: 0.85 },
    ],
  },
  AKL: {
    baseAdultFare: 430,
    options: [
      { airline: A.NZ, stopovers: [], durationMinutes: 185, fareFactor: 1.05 },
      { airline: A.QF, stopovers: [], durationMinutes: 185, fareFactor: 1.1 },
      { airline: A.JQ, stopovers: [], durationMinutes: 190, fareFactor: 0.7 },
      { airline: A.EK, stopovers: [], durationMinutes: 190, fareFactor: 1.2 },
      { airline: A.VA, stopovers: [], durationMinutes: 190, fareFactor: 0.9 },
    ],
  },
  ZQN: {
    baseAdultFare: 540,
    options: [
      { airline: A.NZ, stopovers: [], durationMinutes: 195, fareFactor: 1.05 },
      { airline: A.QF, stopovers: [], durationMinutes: 195, fareFactor: 1.1 },
      { airline: A.JQ, stopovers: [], durationMinutes: 200, fareFactor: 0.75 },
      { airline: A.VA, stopovers: [], durationMinutes: 200, fareFactor: 0.95 },
      { airline: A.NZ, stopovers: ["AKL"], durationMinutes: 345, fareFactor: 0.85 },
    ],
  },
  SGN: {
    baseAdultFare: 980,
    options: [
      { airline: A.VN, stopovers: [], durationMinutes: 545, fareFactor: 1.0 },
      { airline: A.VJ, stopovers: [], durationMinutes: 550, fareFactor: 0.72 },
      { airline: A.SQ, stopovers: ["SIN"], durationMinutes: 770, fareFactor: 1.1 },
      { airline: A.MH, stopovers: ["KUL"], durationMinutes: 830, fareFactor: 0.85 },
    ],
  },
  DAD: {
    baseAdultFare: 1080,
    options: [
      { airline: A.VN, stopovers: ["SGN"], durationMinutes: 760, fareFactor: 1.0 },
      { airline: A.VJ, stopovers: ["SGN"], durationMinutes: 790, fareFactor: 0.78 },
      { airline: A.SQ, stopovers: ["SIN"], durationMinutes: 810, fareFactor: 1.12 },
      { airline: A.MH, stopovers: ["KUL"], durationMinutes: 880, fareFactor: 0.9 },
      { airline: A.TR, stopovers: ["SIN", "SGN"], durationMinutes: 1060, fareFactor: 0.65 },
    ],
  },
};

/** Builds a plausible profile for airports without a hand-written route. */
export function genericRouteProfile(random: () => number): MockRouteProfile {
  const directMinutes = 120 + Math.round(random() * 60) * 10;
  return {
    baseAdultFare: Math.round(200 + directMinutes * 1.4),
    options: [
      { airline: A.QF, stopovers: [], durationMinutes: directMinutes, fareFactor: 1.1 },
      { airline: A.SQ, stopovers: ["SIN"], durationMinutes: directMinutes + 170, fareFactor: 0.9 },
      { airline: A.EK, stopovers: ["MEL"], durationMinutes: directMinutes + 140, fareFactor: 0.95 },
      { airline: A.TR, stopovers: ["SIN", "KUL"], durationMinutes: directMinutes + 330, fareFactor: 0.68 },
    ],
  };
}
