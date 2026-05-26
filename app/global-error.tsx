"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-24">
          <h1 className="text-2xl font-semibold">Something went wrong.</h1>
          <p className="mt-4 text-neutral-600">
            We&rsquo;ve been notified and are looking into it. Please try again in a moment.
          </p>
        </main>
      </body>
    </html>
  );
}
