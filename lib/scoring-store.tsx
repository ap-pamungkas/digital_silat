"use client";

/**
 * Re-export compatibility layer for ScoringContext.
 * Real state management is modularized inside context/ScoringContext.tsx
 */

export {
  ScoringProvider,
  useScoringContext,
  useScoringContext as useScoring,
} from "@/context/ScoringContext";

export type {
  ScoringContextType,
  LastFeedbackState,
} from "@/context/ScoringContext";
