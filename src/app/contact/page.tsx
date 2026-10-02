import type { Metadata } from "next";
import { getSite } from "@/lib/sss";
import { whatsappLink } from "@/lib/format";
import { ContactForm } from "@/components/contact-form";
import { AskButton } from "@/components/ask-button";
import { ButtonLink, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Contact" };

type Props = { searchParams: Promise<{ about?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { about } = await searchParams;
  const site = await getSite();
  const { business, showcase } = site;
  const wa = whatsappLink(business);
  const place = [business.address, business.city, business.country].filter(Boolean).join(", ");
  return (
    <>
      <PageHeader title="Contact" intro="Write, call or chat: we answer quickly." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          {showcase.contactFormEnabled ? (
            <ContactForm subject={typeof about === "string" ? about.slice(0, 120) : undefined} />
          ) : (
            <p className="text-secondary">Reach us with the details on the right.</p>
          )}
        </div>
        <aside className="space-y-4">
          {site.assistant ? (
            <div className="rounded-card border border-border bg-card p-5">
              <p className="font-semibold">Need an answer now?</p>
              <p className="mt-1 text-sm text-secondary">Our AI assistant knows our products, prices and hours.</p>
              <div className="mt-4">
                <AskButton>Chat with {site.assistant.name}</AskButton>
              </div>
            </div>
          ) : null}
          <div className="space-y-3 rounded-card border border-border bg-card p-5 text-sm">
            {business.phone ? <p><span className="text-muted">Phone</span><br /><a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="text-fg">{business.phone}</a></p> : null}
            {business.email ? <p><span className="text-muted">Email</span><br /><a href={`mailto:${business.email}`} className="text-fg">{business.email}</a></p> : null}
            {place ? <p><span className="text-muted">Address</span><br />{place}</p> : null}
            {showcase.design.hours.length ? (
              <div>
                <span className="text-muted">Hours</span>
                {showcase.design.hours.map((h, i) => (
                  <p key={i} className="flex justify-between gap-3"><span>{h.days}</span><span>{h.time}</span></p>
                ))}
              </div>
            ) : null}
            {wa ? <ButtonLink href={wa} external className="mt-2 w-full">WhatsApp us</ButtonLink> : null}
          </div>
        </aside>
      </div>
    </>
  );
}
