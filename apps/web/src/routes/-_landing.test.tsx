import { render, screen } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
}));

vi.mock("@clerk/react", () => ({
  useAuth: () => authState,
  UserButton: () => <button aria-label="Open user menu" />,
}));

vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => ({ options }),
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Outlet: () => <div data-testid="landing-content" />,
}));

vi.mock("@/components/mode-toggle", () => ({
  ModeToggle: () => <button aria-label="Toggle theme" />,
}));

import { Route } from "./_landing";

const LandingLayout = Route.options.component as ComponentType;

describe("LandingLayout", () => {
  beforeEach(() => {
    authState.isLoaded = true;
    authState.isSignedIn = true;
  });

  it("shows the app destination and account menu when signed in", () => {
    render(<LandingLayout />);

    expect(screen.queryAllByRole("link", { name: "Sign in" })).toHaveLength(0);
    expect(screen.getAllByRole("link", { name: "Dashboard" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Open user menu" })).toBeInTheDocument();
  });

  it("shows the sign-in and onboarding actions when signed out", () => {
    authState.isSignedIn = false;

    render(<LandingLayout />);

    expect(screen.getAllByRole("link", { name: "Sign in" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Start budgeting" })).toHaveLength(2);
    expect(screen.queryByRole("button", { name: "Open user menu" })).not.toBeInTheDocument();
  });
});
