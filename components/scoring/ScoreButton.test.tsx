// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { ScoreButton } from "./ScoreButton";

function renderButton(props: Partial<Parameters<typeof ScoreButton>[0]> = {}) {
  const onClick = vi.fn();
  render(
    <ScoreButton
      corner="RED"
      action="PUKULAN"
      points={1}
      label="PUKULAN"
      onClick={onClick}
      {...props}
    />
  );
  return { onClick };
}

describe("ScoreButton", () => {
  it("renders the label and points", () => {
    renderButton();

    expect(screen.getByText("PUKULAN")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("exposes an accessible label naming the corner", () => {
    renderButton();

    expect(
      screen.getByRole("button", { name: "PUKULAN +1 poin untuk Sudut Merah" })
    ).toBeInTheDocument();
  });

  it("names the blue corner in the accessible label", () => {
    renderButton({ corner: "BLUE", action: "TENDANGAN", points: 2, label: "TENDANGAN" });

    expect(
      screen.getByRole("button", { name: "TENDANGAN +2 poin untuk Sudut Biru" })
    ).toBeInTheDocument();
  });

  it("renders the optional sub label", () => {
    renderButton({ subLabel: "Tangan / Siku" });

    expect(screen.getByText("Tangan / Siku")).toBeInTheDocument();
  });

  it("calls onClick with corner, action, and points", async () => {
    const user = userEvent.setup();
    const { onClick } = renderButton();

    await user.click(screen.getByRole("button", { name: /PUKULAN/ }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith("RED", "PUKULAN", 1);
  });

  it("never calls onClick while disabled", async () => {
    const user = userEvent.setup();
    const { onClick } = renderButton({ disabled: true });

    const button = screen.getByRole("button", { name: /PUKULAN/ });
    expect(button).toBeDisabled();
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
