"use client";

import Link from "next/link";
import { Check, LoaderCircle } from "lucide-react";
import { useId, useRef, useState, type FormEvent } from "react";
import { isEmail } from "@/lib/release";

interface WaitlistFormProps {
  /** Where the request is sent. Set with NEXT_PUBLIC_WAITLIST_ENDPOINT; the form is not rendered without it. */
  endpoint: string;
}

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; message: string };

/**
 * Early-access request. It posts to the configured endpoint and reports what that endpoint answers:
 * "sent" only on a 2xx response, the real failure otherwise. Nothing is stored in the browser.
 *
 * The request is JSON: { email, consent: true, source: "briefnest-website" }, which form services such as
 * Formspree, Basin and Getform accept, as will a small endpoint of your own.
 */
export function WaitlistForm({ endpoint }: WaitlistFormProps) {
  const id = useId();
  const emailField = useRef<HTMLInputElement>(null);
  const consentField = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const consent = form.get("consent") === "on";
    // Left empty by people, filled by bots.
    if (String(form.get("company") ?? "") !== "") return;

    const next: typeof errors = {};
    if (!email) next.email = "Enter your email address.";
    else if (!isEmail(email)) next.email = "That doesn’t look like an email address. Check it and try again.";
    if (!consent) next.consent = "Tick the box so we can email you.";
    setErrors(next);
    if (next.email) return emailField.current?.focus();
    if (next.consent) return consentField.current?.focus();

    setStatus({ kind: "sending" });
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, consent: true, source: "briefnest-website" }),
      });
      if (!response.ok) throw new Error(`The server answered ${response.status}.`);
      setStatus({ kind: "sent" });
    } catch (error) {
      const detail = error instanceof Error && error.message.startsWith("The server") ? ` ${error.message}` : "";
      setStatus({ kind: "failed", message: `Your request wasn’t sent.${detail} Check your connection and try again.` });
    }
  };

  if (status.kind === "sent") {
    return (
      <div role="status" className="flex gap-3 rounded-[var(--radius-card)] bg-teal-400/10 p-5 shadow-[inset_0_0_0_1px_rgb(90_210_204/0.35)]">
        <Check className="mt-0.5 size-5 shrink-0 text-teal-300" aria-hidden="true" />
        <div>
          <p className="font-semibold text-paper">Request sent.</p>
          <p className="t-small mt-1 text-fog">We’ll email you when a build is ready for you. Nothing else will be sent to that address.</p>
        </div>
      </div>
    );
  }

  const sending = status.kind === "sending";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4" aria-describedby={status.kind === "failed" ? `${id}-status` : undefined}>
      <div>
        <label htmlFor={`${id}-email`} className="t-h4 block text-paper">
          Email address
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            ref={emailField}
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
            placeholder="you@example.com"
            className="min-h-12 w-full flex-1 rounded-full bg-white/6 px-5 text-paper shadow-[inset_0_0_0_1px_var(--line-strong)] transition-shadow placeholder:text-dim focus-visible:shadow-[inset_0_0_0_1px_var(--color-teal-400)] aria-[invalid=true]:shadow-[inset_0_0_0_1px_var(--color-app-orange)]"
          />
          <button type="submit" className="btn btn-primary btn-lg shrink-0" aria-disabled={sending} disabled={sending}>
            {sending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {sending ? "Sending…" : "Request early access"}
          </button>
        </div>
        {errors.email && (
          <p id={`${id}-email-error`} className="t-small mt-2 text-app-orange">
            {errors.email}
          </p>
        )}
      </div>

      {/* Hidden from people and assistive technology; bots that fill every field give themselves away. */}
      <div aria-hidden="true" className="absolute -left-[200vw] size-px overflow-hidden">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-fog">
          <input
            ref={consentField}
            name="consent"
            type="checkbox"
            required
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${id}-consent-error` : undefined}
            className="mt-1 size-5 shrink-0 cursor-pointer accent-[var(--color-teal-400)]"
          />
          <span>
            Email me when Briefnest is available. I can ask to be removed at any time. See the{" "}
            <Link href="/privacy" className="link">
              privacy notes
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p id={`${id}-consent-error`} className="t-small mt-2 text-app-orange">
            {errors.consent}
          </p>
        )}
      </div>

      {status.kind === "failed" && (
        <p id={`${id}-status`} role="alert" className="t-small rounded-xl bg-app-orange/10 px-4 py-3 text-paper shadow-[inset_0_0_0_1px_rgb(254_145_45/0.4)]">
          {status.message}
        </p>
      )}
    </form>
  );
}
