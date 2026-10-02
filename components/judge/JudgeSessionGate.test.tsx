// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

const state = vi.hoisted(() => ({
  meResult: "ok" as "ok" | "wrong-match" | "fail",
  replacedWith: null as string | null,
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    judgeSessions: {
      me: async () => {
        if (state.meResult === "fail") throw new Error("Unauthorized");
        return {
          matchId: state.meResult === "ok" ? "M-1" : "M-9",
          judgeId: "J-2",
          judgeNumber: 2,
          judgeName: "Juri 2",
        };
      },
    },
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: (url: string) => {
      state.replacedWith = url;
    },
  }),
}));

import { JudgeSessionGate } from "./JudgeSessionGate";

describe("JudgeSessionGate", () => {
  it("renders the pad when the device session matches the match", async () => {
    state.meResult = "ok";
    state.replacedWith = null;

    render(
      <JudgeSessionGate matchId="M-1">
        <div>Scoring Pad</div>
      </JudgeSessionGate>
    );

    expect(await screen.findByText("Scoring Pad")).toBeInTheDocument();
    expect(state.replacedWith).toBeNull();
  });

  it("sends devices without a session back to the entry page", async () => {
    state.meResult = "fail";
    state.replacedWith = null;

    render(
      <JudgeSessionGate matchId="M-1">
        <div>Scoring Pad</div>
      </JudgeSessionGate>
    );

    await vi.waitFor(() => expect(state.replacedWith).toBe("/judge"));
    expect(screen.queryByText("Scoring Pad")).not.toBeInTheDocument();
  });

  it("sends a session bound to another match back to the entry page", async () => {
    state.meResult = "wrong-match";
    state.replacedWith = null;

    render(
      <JudgeSessionGate matchId="M-1">
        <div>Scoring Pad</div>
      </JudgeSessionGate>
    );

    await vi.waitFor(() => expect(state.replacedWith).toBe("/judge"));
    expect(screen.queryByText("Scoring Pad")).not.toBeInTheDocument();
  });
});
