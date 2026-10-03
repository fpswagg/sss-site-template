import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { authEnabled, authProblem, getSession, safeNext } from "@/lib/sss-auth";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

const ERRORS: Record<string, string> = {
  access_denied: "You cancelled the sign-in. Nothing was shared.",
  expired: "The sign-in took too long. Please try again.",
  bad_state: "That sign-in link was not started here. Please try again.",
  invalid_grant: "The sign-in link was already used or has expired. Please try again.",
  invalid_client: "This site's SSS connection is not set up correctly (client id or secret).",
  invalid_scope: "This site asked SSS for an access it does not offer (SSS_OAUTH_SCOPE).",
};

export default async function AccountPage({ searchParams }: Props) {
  // Per visitor, and the sign-in settings are read at request time (never prerendered).
  await connection();
  if (!authEnabled()) notFound();
  const { error, next } = await searchParams;
  const problem = authProblem();
  const session = problem ? null : await getSession();
  const user = session?.user;

  return (
    <>
      <PageHeader title="Account" intro={user ? undefined : "Sign in with your SSS account: no new password to remember."} />
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
        {problem ? (
          <p className="rounded-card border border-border bg-card p-5 text-sm text-secondary">{problem}</p>
        ) : user ? (
          <div className="rounded-card border border-border bg-card p-6">
            <div className="flex items-center gap-4">
              {user.picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.picture} alt="" className="h-14 w-14 shrink-0 rounded-full border border-border object-cover" />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-xl font-bold text-on-accent">
                  {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-heading text-xl font-semibold">{user.name || "SSS member"}</p>
                {user.email ? <p className="truncate text-sm text-secondary">{user.email}</p> : null}
              </div>
            </div>
            {user.business ? (
              <p className="mt-5 text-sm text-secondary">
                Connected business: <span className="text-fg">{user.business.name}</span>
              </p>
            ) : null}
            {user.businesses?.length ? (
              <div className="mt-5 text-sm">
                <p className="text-muted">Your businesses on SSS</p>
                <ul className="mt-1 space-y-1">
                  {user.businesses.map((b) => (
                    <li key={b.id} className="text-fg">
                      {b.name}
                      {b.role ? <span className="text-muted"> · {b.role}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <form action="/auth/sss/sign-out" method="post" className="mt-6">
              <button type="submit" className="rounded-button border border-border-strong px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-elevated">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-card border border-border bg-card p-6">
            {error ? <p className="mb-4 text-sm text-red-500" role="alert">{ERRORS[error] ?? "The sign-in did not work. Please try again."}</p> : null}
            <a
              href={`/auth/sss?next=${encodeURIComponent(safeNext(next))}`}
              className="inline-flex items-center justify-center gap-2 rounded-button bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-[filter] hover:brightness-110"
            >
              Sign in with SSS
            </a>
            <p className="mt-4 text-xs text-muted">
              You will be asked on SSS what this site may see. You can disconnect it at any time in SSS → Settings → Connected apps.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
