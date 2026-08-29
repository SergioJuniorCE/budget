import { render, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
}));

vi.mock("@clerk/react", () => ({
  useAuth: () => authState,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => ({ options }),
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

import { Route } from "./_landing.index";

const HomeComponent = Route.options.component as ComponentType;

describe("HomeComponent", () => {
  beforeEach(() => {
    authState.isLoaded = true;
    authState.isSignedIn = true;
  });

  it("points signed-in visitors back to their dashboard", () => {
    render(<HomeComponent />);

    expect(screen.queryAllByRole("link", { name: "Sign in" })).toHaveLength(0);
    expect(screen.getAllByRole("link", { name: /Open dashboard/ })).toHaveLength(2);
  });

  it("keeps the onboarding actions for signed-out visitors", () => {
    authState.isSignedIn = false;

    render(<HomeComponent />);

    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Start budgeting/ })).toHaveLength(2);
  });
});
