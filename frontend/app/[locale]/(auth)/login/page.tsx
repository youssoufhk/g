"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/features/auth/use-auth";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gamma.local");
  const [password, setPassword] = useState("gamma_dev_password");
  const login = useLogin();
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await login.mutateAsync({ email, password, tenantSchema: "t_dev" });
      router.push("/dashboard");
    } catch {
      // error is surfaced by login.error below
    }
  }

  return (
    <Card padded>
      <CardHeader>
        <div>
          <CardTitle>Sign in to Gamma</CardTitle>
          <CardDescription>
            Dev credentials pre-filled. Replace with your own once you
            register an account.
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="block text-xs font-medium text-[var(--color-text-2)] mb-1">
            Email
          </span>
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-[var(--color-text-2)] mb-1">
            Password
          </span>
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {login.error && (
          <p className="text-xs text-[var(--color-error)]">
            {(login.error as Error).message}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={login.isPending}
          className="w-full"
        >
          Sign in
        </Button>
      </form>
    </Card>
  );
}
