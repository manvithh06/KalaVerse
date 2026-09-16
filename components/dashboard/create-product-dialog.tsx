"use client";

import { useState, type ReactNode } from "react";
import { useKalaverse } from "@/store/kalaverse";
import { useUI } from "@/store/ui";
import { CRAFT_OPTIONS } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

const EMPTY = { name: "", craft: CRAFT_OPTIONS[0].value, price: "", materials: "", story: "", stock: "3" };

export function CreateProductDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createProduct = useKalaverse((s) => s.createProduct);
  const toast = useUI((s) => s.toast);

  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  function submit() {
    const next: Record<string, string> = {};
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (form.name.trim().length < 3) next.name = "Give the piece a name of at least 3 characters.";
    if (!Number.isFinite(price) || price < 100) next.price = "Set a price of at least ₹100.";
    if (form.story.trim().length < 20) next.story = "Tell buyers a little about how it is made (20 characters or more).";
    if (!Number.isInteger(stock) || stock < 1 || stock > 99) next.stock = "Enter how many pieces you can make, from 1 to 99.";
    setErrors(next);
    if (Object.keys(next).length) return;
    const product = createProduct({
      name: form.name,
      craft: form.craft,
      price,
      materials: form.materials.split(",").map((m) => m.trim()).filter(Boolean),
      story: form.story,
      stock,
    });
    toast({ title: "Product listed", body: `${product.name} is in Crafts, sold directly by you.`, tone: "open" });
    setForm(EMPTY);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setErrors({});
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent tone="light" className="max-w-xl">
        <DialogTitle>Create product</DialogTitle>
        <DialogDescription>List a piece you make. Buyers purchase it directly from you, and 95% of the price is yours.</DialogDescription>
        <form
          noValidate
          className="mt-6 grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field id="product-name" label="Name" error={errors.name}>
            <Input id="product-name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} placeholder="Carved crown ornament" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="product-craft" label="Craft">
              <Select id="product-craft" value={form.craft} onChange={(e) => set("craft", e.target.value)}>
                {CRAFT_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.value}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="product-price" label="Price (₹)" error={errors.price}>
              <Input id="product-price" inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={Boolean(errors.price)} placeholder="1200" />
            </Field>
          </div>
          <Field id="product-materials" label="Materials" hint="Separate materials with commas." optional>
            <Input id="product-materials" value={form.materials} onChange={(e) => set("materials", e.target.value)} placeholder="Carved wood, mirror pieces" />
          </Field>
          <Field id="product-story" label="The story of the piece" error={errors.story}>
            <Textarea id="product-story" value={form.story} onChange={(e) => set("story", e.target.value)} aria-invalid={Boolean(errors.story)} placeholder="Where it is made, by whom, and how long it takes." />
          </Field>
          <Field id="product-stock" label="Pieces available" error={errors.stock} className="sm:max-w-[12rem]">
            <Input id="product-stock" inputMode="numeric" value={form.stock} onChange={(e) => set("stock", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={Boolean(errors.stock)} />
          </Field>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost-ink" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="ink" caps>
              List product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
