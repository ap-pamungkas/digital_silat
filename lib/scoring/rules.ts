import {
  MATCH_STAGES,
  MATCH_TIMER_ACTIONS,
  MatchStage,
  MatchTimerAction,
  SCORING_ACTIONS,
  ScoreEvent,
  ScoringAction,
} from "@/lib/types";

export const SCORE_CONSENSUS_WINDOW_MS = 2000;

export const MIN_JUDGES_REQUIRED = 2;

export const SCORE_POINTS: Partial<Record<ScoringAction, number>> = {
  PUKULAN: 1,
  TENDANGAN: 2,
  JATUHAN: 3,
  TANGKISAN_PUKULAN: 2,
  TANGKISAN_TENDANGAN: 3,
};

export const SCOREABLE_ACTIONS: readonly ScoringAction[] = SCORING_ACTIONS.filter(
  (action) => SCORE_POINTS[action] !== undefined
);

export type ScoreEventGroupKey = `${ScoreEvent["status"]}:${number}:${ScoreEvent["corner"]}:${ScoreEvent["action"]}`;

export function scorePointsForAction(action: ScoringAction): number | undefined {
  return SCORE_POINTS[action];
}

export function isScoringAction(value: unknown): value is ScoringAction {
  return typeof value === "string" && SCORING_ACTIONS.includes(value as ScoringAction);
}

export function isMatchStage(value: unknown): value is MatchStage {
  return typeof value === "string" && MATCH_STAGES.includes(value as MatchStage);
}

export function isMatchTimerAction(value: unknown): value is MatchTimerAction {
  return typeof value === "string" && MATCH_TIMER_ACTIONS.includes(value as MatchTimerAction);
}

export function toMatchStage(stage: string, fallback: MatchStage = "PENYISIHAN"): MatchStage {
  const normalized = stage
    .replace(/^BABAK\s+/i, "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
  return isMatchStage(normalized) ? normalized : fallback;
}

export type ScoreEventGroup = {
  key: ScoreEventGroupKey;
  firstTimestamp: number;
  events: ScoreEvent[];
};

export function buildScoreEventGroups(events: ScoreEvent[]): {
  groups: ScoreEventGroup[];
  groupByEventId: Map<string, ScoreEventGroup>;
} {
  const orderedEvents = [...events].sort(
    (first, second) => first.timestamp - second.timestamp
  );
  const groups: ScoreEventGroup[] = [];
  const groupByEventId = new Map<string, ScoreEventGroup>();

  for (const event of orderedEvents) {
    const key: ScoreEventGroupKey = `${event.status}:${event.round}:${event.corner}:${event.action}`;
    let group = groups.find(
      (candidate) =>
        candidate.key === key &&
        event.timestamp - candidate.firstTimestamp <= SCORE_CONSENSUS_WINDOW_MS
    );
    if (!group) {
      group = { key, firstTimestamp: event.timestamp, events: [] };
      groups.push(group);
    }
    group.events.push(event);
    groupByEventId.set(event.id, group);
  }

  return { groups, groupByEventId };
}

export function agreedJudgeNumbers(group: ScoreEventGroup | undefined, fallback: number[]): number[] {
  if (!group) return fallback;
  return [...new Set(group.events.map((event) => event.judgeNumber))].sort(
    (first, second) => first - second
  );
}