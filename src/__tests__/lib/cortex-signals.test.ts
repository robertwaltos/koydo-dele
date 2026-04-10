import { describe, it, expect, vi } from "vitest";
import { emitPrismSignal } from "@/lib/dele/cortex-signals";

describe("PRISM Signals", () => {
  it("dispatches custom event on window", () => {
    const spy = vi.fn();
    window.addEventListener("koydo:prism-signal", spy);
    emitPrismSignal({ eventType: "question_answered", activityType: "dele" });
    expect(spy).toHaveBeenCalled();
    window.removeEventListener("koydo:prism-signal", spy);
  });

  it("includes correct event detail", () => {
    let detail: unknown;
    const handler = (e: Event) => { detail = (e as CustomEvent).detail; };
    window.addEventListener("koydo:prism-signal", handler);
    emitPrismSignal({ eventType: "exam_started", value: 1, activityType: "dele" });
    expect(detail).toEqual({ eventType: "exam_started", value: 1, activityType: "dele" });
    window.removeEventListener("koydo:prism-signal", handler);
  });
});
