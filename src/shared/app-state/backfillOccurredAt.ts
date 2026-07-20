/**
 * Pure migration helper for legacy activities missing timeline timestamps.
 *
 * Exports: backfillOccurredAt
 * Depends on: @/features/activities/types
 */

import type { Activity } from "@/features/activities/types";

/**
 * Backfill `occurredAt` for any legacy activities that don't have one.
 * Spreads them evenly across the previous 3 years based on creation order,
 * so the timeline view has visual depth across months/years.
 * Deterministic — same input always produces same output.
 * @param activities - Raw activities from draft storage.
 * @returns Activities with `occurredAt` populated where missing.
 */
export function backfillOccurredAt(activities: Activity[]): Activity[] {
  if (activities.length === 0) return activities;
  if (activities.every((a) => typeof a.occurredAt === "number")) return activities;

  const idIndex = new Map(activities.map((a, i) => [a.id, i]));
  const sortKey = (a: Activity): number => {
    const n = Number(a.id);
    return Number.isFinite(n) ? n : (idIndex.get(a.id) ?? 0);
  };
  const sorted = [...activities].sort((a, b) => sortKey(a) - sortKey(b));

  const now = Date.now();
  const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
  const start = now - threeYears;
  const span = threeYears - 30 * 24 * 60 * 60 * 1000;

  const hashJitter = (id: string): number => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
    return Math.abs(h % 25) * 24 * 60 * 60 * 1000;
  };

  const byId = new Map<string, number>();
  sorted.forEach((act, i) => {
    if (typeof act.occurredAt === "number") {
      byId.set(act.id, act.occurredAt);
      return;
    }
    const ratio = sorted.length === 1 ? 1 : i / (sorted.length - 1);
    const ts = start + Math.round(ratio * span) + hashJitter(act.id);
    byId.set(act.id, ts);
  });

  return activities.map((a) => ({
    ...a,
    occurredAt: typeof a.occurredAt === "number" ? a.occurredAt : byId.get(a.id),
  }));
}
