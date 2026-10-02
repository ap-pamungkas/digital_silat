// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { PenaltyDialog } from "./PenaltyDialog";

function renderDialog(props: Partial<Parameters<typeof PenaltyDialog>[0]> = {}) {
  const onClose = vi.fn();
  const onConfirmPenalty = vi.fn();
  render(
    <PenaltyDialog
      isOpen
      onClose={onClose}
      onConfirmPenalty={onConfirmPenalty}
      redAthleteName="Merah Test"
      blueAthleteName="Biru Test"
      {...props}
    />
  );
  return { onClose, onConfirmPenalty };
}

describe("PenaltyDialog", () => {
  it("renders nothing when closed", () => {
    renderDialog({ isOpen: false });

    expect(screen.queryByText("Berikan Hukuman / Penalti")).not.toBeInTheDocument();
  });

  it("lists every server-defined penalty with its points", () => {
    renderDialog();

    expect(screen.getByText("Teguran 1")).toBeInTheDocument();
    expect(screen.getByText("Peringatan 1 (P1)")).toBeInTheDocument();
    expect(screen.getByText("Diskualifikasi")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("-99")).toBeInTheDocument();
  });

  it("does not confirm from the selection step", async () => {
    const user = userEvent.setup();
    const { onConfirmPenalty } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));

    expect(onConfirmPenalty).not.toHaveBeenCalled();
    expect(screen.getByText("Konfirmasi Hukuman Wasit")).toBeInTheDocument();
  });

  it("Batal closes the dialog without confirming", async () => {
    const user = userEvent.setup();
    const { onClose, onConfirmPenalty } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Batal" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirmPenalty).not.toHaveBeenCalled();
  });

  it("Kembali returns to the selection step without confirming", async () => {
    const user = userEvent.setup();
    const { onConfirmPenalty } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));
    await user.click(screen.getByRole("button", { name: "Kembali" }));

    expect(onConfirmPenalty).not.toHaveBeenCalled();
    expect(screen.getByText("Berikan Hukuman / Penalti")).toBeInTheDocument();
  });

  it("confirms the chosen corner, penalty, and referee note", async () => {
    const user = userEvent.setup();
    const { onConfirmPenalty } = renderDialog();

    await user.click(screen.getByRole("button", { name: /Sudut Biru/ }));
    await user.click(screen.getByRole("button", { name: /Peringatan 1 \(P1\)/ }));
    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));
    await user.type(
      screen.getByPlaceholderText("Contoh: Pukulan terlarang / Keluar gelanggang"),
      "Keluar gelanggang"
    );
    await user.click(screen.getByRole("button", { name: "Konfirmasi Hukuman" }));

    expect(onConfirmPenalty).toHaveBeenCalledTimes(1);
    expect(onConfirmPenalty).toHaveBeenCalledWith("BLUE", "PERINGATAN_1", "Keluar gelanggang");
  });

  it("falls back to the penalty label when the note is empty", async () => {
    const user = userEvent.setup();
    const { onConfirmPenalty } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Lanjutkan" }));
    await user.click(screen.getByRole("button", { name: "Konfirmasi Hukuman" }));

    expect(onConfirmPenalty).toHaveBeenCalledWith("RED", "TEGURAN_1", "Teguran 1");
  });
});
