import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-heading text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-heading text-2xl font-semibold">This page does not exist</h1>
      <p className="mt-2 text-secondary">It may have moved, or the product is no longer online.</p>
      <div className="mt-8 flex justify-center gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/products" variant="secondary">Products</ButtonLink>
      </div>
    </div>
  );
}
