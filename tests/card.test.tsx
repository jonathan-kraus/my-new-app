import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "../app/components/ui/card";

it.each([
  [Card, "card", "bg-card"],
  [CardHeader, "card-header", "grid"],
  [CardTitle, "card-title", "font-semibold"],
  [CardDescription, "card-description", "text-muted-foreground"],
  [CardAction, "card-action", "col-start-2"],
  [CardContent, "card-content", "px-6"],
  [CardFooter, "card-footer", "items-center"],
] as const)(
  "renders %s with its slot, styling, children and caller attributes",
  (Component, slot, style) => {
    const html = renderToStaticMarkup(
      <Component id="astronomy" aria-label="Astronomy" className="custom-card">
        <span>Sunrise</span>
      </Component>,
    );
    expect(html).toContain(`data-slot="${slot}"`);
    expect(html).toContain(style);
    expect(html).toContain("custom-card");
    expect(html).toContain('id="astronomy"');
    expect(html).toContain('aria-label="Astronomy"');
    expect(html).toContain("<span>Sunrise</span>");
  },
);

it("allows callers to override default padding without duplicate Tailwind classes", () => {
  const html = renderToStaticMarkup(
    <CardContent className="px-2">Content</CardContent>,
  );
  expect(html).toContain('class="px-2"');
  expect(html).not.toContain("px-6");
});
