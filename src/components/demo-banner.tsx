/** Shown only on demo data, so nobody publishes the sample business by mistake. */
export function DemoBanner() {
  return (
    <div className="bg-fg px-4 py-2 text-center text-xs text-bg">
      Demo data — set <code className="font-semibold">SSS_STORE_SLUG</code> in <code className="font-semibold">.env.local</code> to show your SSS business.
    </div>
  );
}
