import { render, screen } from "@testing-library/react";
import { LegalMarkdown } from "./LegalMarkdown";

describe("LegalMarkdown", () => {
  it("renders GFM emphasis, lists, and tables", () => {
    render(
      <LegalMarkdown
        content={`**مدة الإخطار**

- شهر واحد

| النوع | المدة |
| --- | --- |
| إيجار | شهران |`}
      />,
    );

    expect(screen.getByText("مدة الإخطار").tagName).toBe("STRONG");
    expect(screen.getByRole("list")).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
    expect(screen.getByText("شهران")).toBeTruthy();
  });

  it("does not render raw HTML from model output", () => {
    const { container } = render(
      <LegalMarkdown content={'نص آمن <script>alert("xss")</script>'} />,
    );

    expect(container.querySelector("script")).toBeNull();
  });
});
