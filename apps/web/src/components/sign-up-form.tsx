import { SignUp } from "@clerk/react";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Create Account</h1>
      <SignUp />
      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToSignIn}
          className="text-indigo-600 hover:text-indigo-800 text-sm underline"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}
