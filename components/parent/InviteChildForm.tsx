"use client";

import { Loader2, Mail, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inviteChild } from "@/lib/actions";

export function InviteChildForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await inviteChild(email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEmail("");
      setSuccess(true);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="child@example.com"
            required
            className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-linear-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white border-0 gap-1.5"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Invite
        </Button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400">
          Invite sent! They'll get an email with a link to accept.
        </p>
      )}
    </form>
  );
}
