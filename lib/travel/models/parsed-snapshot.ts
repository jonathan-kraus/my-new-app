/*
 * @FilePath: \my-new-app\lib\travel\models\parsed-snapshot.ts
 * @Author       : Jonathan
 * @Date         : 2026-02-22 13:02:05
 * @Description  : Parsed snapshot model produced directly from AA email HTML
 * @LastEditors: Jonathan
 * @LastEditTime: 2026-02-23 12:32:54
 */

import type { ParsedFlightSegment } from "@/lib/travel/parser/aa";

/* -------------------------------------------------------
 * Parsed Travel Snapshot (parser-layer model)
 * ----------------------------------------------------- */

export interface ParsedTravelSnapshot {
  id: string; // UUID for this snapshot (generated before DB insert)
  source: "AA_EMAIL"; // future-proof for other airlines
  receivedAt: Date; // when the email was ingested
  confirmationCode: string; // e.g. "YGZGJQ"
  issuedDate: string; // e.g. "February 21, 2026"
  passengers: Passenger[];
  segments: ParsedFlightSegment[]; // parser-layer segments (array seats, rich structure)
  payment: PaymentBreakdown[];
  bags: BagInfo[];
  rawHtml: string; // full HTML for debugging + reprocessing
}

/* -------------------------------------------------------
 * Passenger
 * ----------------------------------------------------- */

export interface Passenger {
  name: string; // "Jonathan Kraus"
  aadvantageNumberMasked: string; // "3AT****"
  ticketNumber: string; // "0012318562505"
  price: number; // 233.19
}

/* -------------------------------------------------------
 * Payment Breakdown
 * ----------------------------------------------------- */

export interface PaymentBreakdown {
  method: string; // "Trip Credit", "Mastercard", "Total paid"
  details: string; // "ending 2978"
  amount: number; // 250.00
}

/* -------------------------------------------------------
 * Bag Info
 * ----------------------------------------------------- */

export interface BagInfo {
  type: string; // "1st bag", "2nd bag"
  price: string; // "No charge", "$50.00"
  channel: "Airport" | "Online"; // AA emails distinguish these
}
