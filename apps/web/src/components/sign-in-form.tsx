import { SignIn } from "@clerk/react";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Welcome Back</h1>
      <SignIn />
      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-800 text-sm underline"
        >
          Need an account? Sign Up
        </button>
      </div>
    </div>
  );
}
