import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusChip } from "./StatusChip";

describe("StatusChip", () => {
  it("comunica o status por texto (não só por cor)", () => {
    render(<StatusChip status="FECHAMENTO_SOLICITADO" />);
    expect(screen.getByText("Fechamento em análise")).toBeInTheDocument();
  });
});
