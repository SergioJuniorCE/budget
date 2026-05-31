import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

// Simple wrapper without heavy dependencies
function AllTheProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options });
}

export * from "@testing-library/react";
export { render };
