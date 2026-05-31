import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { SignIn, SignUp } from "@clerk/react";

export const Route = createFileRoute("/_auth/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const search = useSearch({ from: "/_auth/sign-in" }) as { redirect?: string };
  const redirectUrl = search.redirect || "/dashboard";

  return (
    <div className="w-full">
      {showSignUp ? (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-center mb-6">Create account</h1>
          <SignUp signInUrl="/sign-in" redirectUrl={redirectUrl} />
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowSignUp(false)}
              className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Already have an account? Sign in
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold tracking-tight text-center mb-6">Welcome back</h1>
          <SignIn signUpUrl="/sign-in" redirectUrl={redirectUrl} />
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowSignUp(true)}
              className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Need an account? Sign up
            </button>
          </div>
        </>
      )}
    </div>
  );
}
