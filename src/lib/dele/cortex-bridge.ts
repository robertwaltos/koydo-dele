/**
 * DELE → Cortex Signal Bridge
 *
 * Translates DELE exam practice, session, and result events into PRISM signals.
 * All emitters are fire-and-forget (silent-fail on network errors).
 *
 * NOTE: This is distinct from cortex-signals.ts, which dispatches browser
 * CustomEvents for the client-side analytics pipeline. This module POSTs
 * structured PRISM band signals to the /api/cortex/signals server endpoint.
 */

import type { PrismBand, PrismSignalType } from "@/lib/cortex-v5/prism/types";

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

function emit(
  signals: Array<{
    band: PrismBand;
    signalType: PrismSignalType;
    value: number;
    timestamp: string;
    conceptId?: string;
    domainId?: string;
  }>,
): void {
  if (signals.length === 0) return;
  if (typeof window === "undefined") return;
  fetch("/api/cortex/signals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ signals }),
  }).catch(() => {
    // Fire-and-forget — network errors silently dropped
  });
}

function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Public emitters
// ---------------------------------------------------------------------------

/**
 * Call when a DELE practice session starts.
 * @param skill - Skill code (e.g. "comprension-lectura", "expresion-oral")
 */
export function emitDELESessionStart(skill: string): void {
  emit([
    {
      band: "temporal" as PrismBand,
      signalType: "warmup_duration_ms" as PrismSignalType,
      value: 0,
      timestamp: now(),
      domainId: "dele",
      conceptId: `dele:${skill}`,
    },
  ]);
}

/**
 * Call when a practice question is answered.
 * @param skill - Skill code
 * @param isCorrect - Whether the answer was correct
 * @param timeMs - Time taken to answer in milliseconds
 */
export function emitDELEQuestionAnswer(
  skill: string,
  isCorrect: boolean,
  timeMs: number,
): void {
  emit([
    {
      band: "temporal" as PrismBand,
      signalType: "completion_time_ms" as PrismSignalType,
      value: Math.min(timeMs, 3_600_000),
      timestamp: now(),
      domainId: "dele",
      conceptId: `dele:${skill}`,
    },
    ...(isCorrect
      ? []
      : [
          {
            band: "persistence" as PrismBand,
            signalType: "retry_after_error" as PrismSignalType,
            value: 1 as number,
            timestamp: now(),
            domainId: "dele",
            conceptId: `dele:${skill}`,
          },
        ]),
  ]);
}

/**
 * Call when a mock exam section is completed with a score.
 * @param skill - Skill code
 * @param scorePercent - Score as a percentage (0–100)
 */
export function emitDELEExamCompleted(skill: string, scorePercent: number): void {
  emit([
    {
      band: "persistence" as PrismBand,
      signalType: "task_completion_rate" as PrismSignalType,
      value: Math.min(1, Math.max(0, scorePercent / 100)),
      timestamp: now(),
      domainId: "dele",
      conceptId: `dele:${skill}`,
    },
  ]);
}
