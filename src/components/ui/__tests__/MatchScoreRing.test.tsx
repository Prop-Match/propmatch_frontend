import { render, screen } from "@testing-library/react";
import { MatchScoreRing } from "../MatchScoreRing";

describe("MatchScoreRing", () => {
  it("renders the percentage with Western Arabic numerals", () => {
    render(<MatchScoreRing score={87} />);
    expect(screen.getByText(/87%/)).toBeInTheDocument();
  });

  it("renders the no-match variant for a null score", () => {
    render(<MatchScoreRing score={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("exposes an accessible label", () => {
    render(<MatchScoreRing score={92} />);
    expect(screen.getByRole("img", { name: /نسبة التطابق/ })).toBeInTheDocument();
  });
});
