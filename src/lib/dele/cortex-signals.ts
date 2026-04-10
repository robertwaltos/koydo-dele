// Cortex Analytics Signals for DELE
// NOTE: Event names use "prism-signal" for cross-platform compatibility with the Koydo analytics pipeline.

export type PrismEventType =
  | "question_answered"
  | "exam_started"
  | "exam_completed"
  | "section_completed"
  | "daily_limit_reached"
  | "premium_upgrade_shown"
  | "premium_upgrade_clicked";

export interface PrismSignal {
  eventType: PrismEventType;
  value?: number;
  activityType: string;
  metadata?: Record<string, unknown>;
}

export function emitPrismSignal(signal: PrismSignal): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("koydo:prism-signal", { detail: signal }),
  );
}
