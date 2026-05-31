import { SignIn } from "@clerk/react";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">Welcome back</h1>
      <SignIn />
      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToSignUp}
          className="text-primary hover:text-primary/80 text-sm underline underline-offset-4"
        >
          Need an account? Sign up
        </button>
      </div>
    </div>
  );
}
