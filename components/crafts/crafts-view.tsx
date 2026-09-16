"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Check, LoaderCircle, Minus, Package, Plus, TriangleAlert } from "lucide-react";
import type { Product, ProductOrder } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCustodian, useHydrated } from "@/store/hooks";
import { CRAFT_OPTIONS } from "@/data/products";
import { PRODUCT_PHOTOS } from "@/data/photos";
import { payoutFor } from "@/lib/economics";
import { CulturalPlate } from "@/components/cultural/plates";
import { EmptyState } from "@/components/cultural/states";
import { PayoutFlow } from "@/components/economics/payout-flow";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils";

function useSold() {
  const orders = useKalaverse((s) => s.orders);
  return useMemo(() => {
    const sold: Record<string, number> = {};
    for (const o of orders) sold[o.productId] = (sold[o.productId] ?? 0) + o.quantity;
    return sold;
  }, [orders]);
}

function ProductCard({ product, left, onBuy }: { product: Product; left: number; onBuy: () => void }) {
  const maker = useCustodian(product.custodianId);
  return (
    <article className="flex flex-col bg-night-2">
      <CulturalPlate motif={product.motif} photo={PRODUCT_PHOTOS[product.id]}className="aspect-[4/3]" />
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.84rem] text-gold-light">{product.craft}</p>
        <h3 className="mt-2 font-titling text-[1.25rem] uppercase leading-tight">{product.name}</h3>
        <p className="mt-3 text-[0.92rem] text-ivory-dim">
          Created by{" "}
          {maker ? (
            <Link href={`/custodians/${maker.id}`} className="text-ivory underline decoration-gold/50 underline-offset-4 hover:decoration-gold-light">
              {maker.name}
            </Link>
          ) : (
            "a custodian"
          )}
        </p>
        <p className="mt-4 font-serif text-[1.02rem] leading-relaxed text-ivory-dim">{product.story}</p>
        {product.materials.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Materials">
            {product.materials.map((m) => (
              <li key={m} className="rounded-full border border-ivory/12 px-2.5 py-1 text-[0.76rem] text-ivory-dim">
                {m}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 flex items-center gap-2 text-[0.86rem]">
          <BadgeCheck className="size-4 text-open" aria-hidden />
          {product.authenticity === "custodian_made" ? "Made by the custodian" : "Endorsed by the maker's community"}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <span className="t-num text-[1.7rem]">{formatINR(product.price)}</span>
          <span className="text-[0.84rem] text-ash">{left > 0 ? `${left} left` : "Sold out"}</span>
        </div>
        <Button caps className="mt-5 w-full" disabled={left <= 0} onClick={onBuy}>
          Buy directly from the maker
        </Button>
      </div>
    </article>
  );
}

function PurchaseDialog({ product, left, onClose }: { product: Product | null; left: number; onClose: () => void }) {
  const maker = useCustodian(product?.custodianId ?? "");
  const orderProduct = useKalaverse((s) => s.orderProduct);
  const [quantity, setQuantity] = useState(1);
  const [order, setOrder] = useState<ProductOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const q = Math.max(1, Math.min(quantity, Math.max(1, left)));
  const payout = product ? payoutFor(product.price * q, "product") : null;

  async function place() {
    if (!product) return;
    setError(null);
    setPlacing(true);
    await new Promise((r) => window.setTimeout(r, 900));
    const result = orderProduct(product.id, q);
    setPlacing(false);
    if (result.ok) setOrder(result.order);
    else setError(result.reason);
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(open) => !open && onClose()}>
      {product && payout && (
        <DialogContent className="max-w-2xl overflow-hidden p-0 sm:p-0">
          {order ? (
            <div className="flex flex-col items-center p-8 text-center sm:p-10">
              <span className="grid size-16 place-items-center rounded-full border border-open/50 bg-open/10 text-open">
                <Check className="size-8" strokeWidth={2.6} aria-hidden />
              </span>
              <DialogTitle className="mt-6 pr-0">Order sent to the maker</DialogTitle>
              <DialogDescription>
                {maker?.name} will confirm and ship {order.quantity === 1 ? "your piece" : `your ${order.quantity} pieces`} directly.
              </DialogDescription>
              <p className="mt-6 text-[0.86rem] text-ash">Order ID</p>
              <p className="text-[1.8rem] font-semibold tracking-tight text-gold-light">{order.id}</p>
              <p className="mt-4 text-[1.05rem]">
                {formatINR(order.custodianNet)} <span className="text-ivory-dim">→ {maker?.name}</span>
              </p>
              <Button className="mt-8" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-[220px_minmax(0,1fr)]">
              <CulturalPlate motif={product.motif} photo={PRODUCT_PHOTOS[product.id]}className="h-44 sm:h-full" />
              <div className="p-6 sm:p-8">
                <DialogTitle className="text-[1.45rem]">{product.name}</DialogTitle>
                <DialogDescription>
                  Made by {maker?.name} in {product.origin}. {product.makingTime}.
                </DialogDescription>
                <div className="mt-6 flex items-center justify-between gap-4 rounded-[4px] border border-ivory/12 p-3">
                  <span className="text-[0.92rem]">Quantity</span>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" aria-label="One fewer" disabled={q <= 1} onClick={() => setQuantity(q - 1)}>
                      <Minus aria-hidden />
                    </Button>
                    <output aria-live="polite" className="w-6 text-center text-[1.15rem] font-semibold">
                      {q}
                    </output>
                    <Button variant="outline" size="icon" aria-label="One more" disabled={q >= left} onClick={() => setQuantity(q + 1)}>
                      <Plus aria-hidden />
                    </Button>
                  </div>
                </div>
                <PayoutFlow gross={payout.gross} platformFee={payout.platformFee} custodianNet={payout.custodianNet} className="mt-6" />
                {error && (
                  <p role="alert" className="mt-4 flex gap-2 rounded-[4px] border border-protected/40 bg-protected/10 p-3 text-[0.9rem]">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-protected" aria-hidden />
                    {error}
                  </p>
                )}
                <Button caps size="lg" className="mt-6 w-full" disabled={placing || left <= 0} onClick={place}>
                  {placing ? (
                    <>
                      <LoaderCircle className="animate-spin" aria-hidden />
                      Sending order
                    </>
                  ) : (
                    "Buy directly from the maker"
                  )}
                </Button>
                <p className="mt-3 text-center text-[0.8rem] text-ash">Prototype: no payment is taken.</p>
              </div>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}

export function CraftsView() {
  const hydrated = useHydrated();
  const products = useKalaverse((s) => s.products);
  const sold = useSold();
  const [craft, setCraft] = useState("");
  const [active, setActive] = useState<Product | null>(null);
  const filtered = craft ? products.filter((p) => p.craft === craft) : products;
  const leftFor = (p: Product) => Math.max(0, p.stock - (sold[p.id] ?? 0));

  return (
    <div className="bg-night text-ivory">
      <header className="page-gutter mx-auto max-w-[1440px] pb-10 pt-28 lg:pt-36">
        <h1 className="font-titling text-[clamp(2.6rem,6.2vw,5.8rem)] uppercase leading-[0.94]">
          Bought from
          <br />
          the maker.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.05rem] leading-relaxed text-ivory-dim">
          A small collection of pieces made by custodians. There is no warehouse and no middleman: each order goes to the person who made it.
        </p>
      </header>

      <div className="page-gutter mx-auto max-w-[1440px] pb-28">
        <div role="group" aria-label="Filter by craft" className="flex flex-wrap gap-2">
          <Chip tone="dark" selected={craft === ""} onClick={() => setCraft("")}>
            All crafts
          </Chip>
          {CRAFT_OPTIONS.map((c) => (
            <Chip key={c.value} tone="dark" selected={craft === c.value} onClick={() => setCraft(c.value)}>
              {c.value}
            </Chip>
          ))}
        </div>

        <div className="mt-10">
          {!hydrated ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" role="status" aria-label="Loading crafts">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-[560px]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Package className="size-6" aria-hidden />}
              title="No products in this craft yet"
              body="Makers list pieces when they have them. Try another craft."
              action={
                <Button variant="outline" onClick={() => setCraft("")}>
                  Show all crafts
                </Button>
              }
              className="border border-dashed border-ivory/10"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} left={leftFor(p)} onBuy={() => setActive(p)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <PurchaseDialog key={active?.id ?? "none"} product={active} left={active ? leftFor(active) : 0} onClose={() => setActive(null)} />
    </div>
  );
}
