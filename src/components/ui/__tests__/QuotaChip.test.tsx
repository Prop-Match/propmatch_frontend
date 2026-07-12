import { render, screen } from "@testing-library/react";
import { QuotaChip } from "../QuotaChip";

describe("QuotaChip", () => {
  it("shows the remaining count when quota is available", () => {
    render(<QuotaChip remaining={3} label="محاولات المطابقة المجانية المتبقية" />);
    expect(screen.getByText(/محاولات المطابقة المجانية المتبقية: 3/)).toBeInTheDocument();
  });

  it("shows the exhausted message at zero", () => {
    render(<QuotaChip remaining={0} label="محاولات المطابقة المجانية المتبقية" />);
    expect(screen.getByText("انتهت محاولاتك المجانية")).toBeInTheDocument();
  });
});
