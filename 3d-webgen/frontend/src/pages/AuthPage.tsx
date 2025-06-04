// src/pages/AuthPage.tsx
import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register">("register");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
          {mode === "register" ? "Create an Account" : "Welcome Back"}
        </h2>

        {mode === "register" ? <RegisterForm onSuccess={() => setMode("login")} /> : <LoginForm />}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "register" ? (
            <>
              Already have an account?{" "}
              <button className="text-blue-500 underline" onClick={() => setMode("login")}>
                Log in
              </button>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <button className="text-blue-500 underline" onClick={() => setMode("register")}>
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
