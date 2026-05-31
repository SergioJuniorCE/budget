import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";

describe("Card", () => {
  it("renders with content", () => {
    render(
      <Card>
        <CardContent>Card content</CardContent>
      </Card>,
    );
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders with header and title", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>,
    );
    expect(screen.getByText("Card Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders with footer", () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter>Footer content</CardFooter>
      </Card>,
    );
    expect(screen.getByText("Footer content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <Card className="custom-card" data-testid="card">
        Content
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveClass("custom-card");
  });

  it("renders with small size", () => {
    render(
      <Card size="sm" data-testid="card">
        <CardContent>Small card</CardContent>
      </Card>,
    );
    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "sm");
  });
});
