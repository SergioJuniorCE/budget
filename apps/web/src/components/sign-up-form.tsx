import { SignUp } from "@clerk/react";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-2xl font-bold tracking-tight">Create account</h1>
      <SignUp />
      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToSignIn}
          className="text-primary hover:text-primary/80 text-sm underline underline-offset-4"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}
