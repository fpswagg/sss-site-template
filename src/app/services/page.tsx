import type { Metadata } from "next";
import { getSite } from "@/lib/sss";
import { arrange } from "@/lib/meta";
import { livePromotions, PromotionCard, ServiceCard } from "@/components/cards";
import { AskButton } from "@/components/ask-button";
import { ButtonLink, Empty, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  const site = await getSite();
  const services = arrange(site.services.filter((s) => s.data.active !== false));
  const promotions = arrange(livePromotions(site.promotions));
  return (
    <>
      <PageHeader title="Services" intro="What we do for you, beyond the shop.">
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/contact">Book or ask a quote</ButtonLink>
          {site.assistant ? <AskButton question="I would like to know more about your services: ">Ask the assistant</AskButton> : null}
        </div>
      </PageHeader>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {services.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s.id} record={s} />
            ))}
          </div>
        ) : (
          <Empty>No services listed yet.</Empty>
        )}
      </div>
      {promotions.length ? (
        <Section eyebrow="Offers" title="Current offers">
          <div className="grid gap-4 md:grid-cols-2">
            {promotions.map((p) => (
              <PromotionCard key={p.id} record={p} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  );
}
