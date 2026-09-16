"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AccessLevel,
  AIContent,
  Booking,
  ConsentSettings,
  CustodianApplication,
  DescriptionSource,
  Experience,
  Notification,
  NotificationKind,
  Product,
  ProductOrder,
  ProfileOverrides,
  Role,
  Transaction,
  VaultRecord,
} from "@/types";
import { seedExperiences } from "@/data/experiences";
import { CURRENT_CUSTODIAN_ID, custodians } from "@/data/custodians";
import { craftMotif, products as seedProducts } from "@/data/products";
import { practiceOption } from "@/data/practices";
import {
  createSeedAIContents,
  createSeedNotifications,
  createSeedTransactions,
  seedVaultRecords,
} from "@/data/seed";
import { applyAccessLevel, canUseAI, isBookable, isDiscoverable, RESPECT_PLEDGES, type ConsentCore } from "@/lib/consent";
import { COMMUNITY_SHARE, payoutFor } from "@/lib/economics";
import { seatsTaken } from "@/lib/availability";
import { composeDraft } from "@/lib/ai";
import { slugify, uid } from "@/lib/utils";

export interface BookingRequest {
  experienceId: string;
  date: string;
  time: string;
  guests: number;
  acceptedPledges: string[];
}

export interface ExperienceInput {
  title: string;
  practice: string;
  summary: string;
  description: string;
  descriptionSource: DescriptionSource;
  district: string;
  location: string;
  languages: string[];
  durationMinutes: number;
  price: number;
  days: number[];
  time: string;
  consent: ConsentCore;
}

export interface ProductInput {
  name: string;
  craft: string;
  price: number;
  materials: string[];
  story: string;
  stock: number;
}

type Failure = { ok: false; reason: string };

interface KalaverseData {
  role: Role;
  experiences: Experience[];
  products: Product[];
  bookings: Booking[];
  orders: ProductOrder[];
  transactions: Transaction[];
  nextBookingSeq: number;
  nextOrderSeq: number;
  aiContents: AIContent[];
  aiEnabled: boolean;
  savedExperienceIds: string[];
  notifications: Notification[];
  profile: ProfileOverrides;
  vaultRecords: VaultRecord[];
  application: CustodianApplication | null;
  /** Set when something leaves public discovery, so the visitor view can explain the gap once. */
  withheldNotice: { at: string; seen: boolean } | null;
  communityShareAdded: number;
}

interface KalaverseActions {
  setRole: (role: Role) => void;
  toggleSaved: (experienceId: string) => void;
  bookExperience: (request: BookingRequest) => { ok: true; booking: Booking } | Failure;
  orderProduct: (productId: string, quantity: number) => { ok: true; order: ProductOrder } | Failure;
  createProduct: (input: ProductInput) => Product;
  createExperience: (input: ExperienceInput, publish: boolean) => Experience;
  updateExperience: (id: string, input: ExperienceInput, publish: boolean) => void;
  setExperienceStatus: (id: string, status: Experience["status"]) => void;
  setAccessLevel: (id: string, level: AccessLevel) => void;
  updateConsent: (id: string, consent: ConsentCore) => void;
  setAIEnabled: (enabled: boolean) => void;
  setExperienceAI: (id: string, enabled: boolean) => void;
  generateAIDraft: (experienceId: string) => AIContent | null;
  decideAI: (contentId: string, decision: "approved" | "rejected" | "edited", text?: string) => void;
  reopenAIDecision: (contentId: string) => void;
  addVaultRecord: (label: string, kind: VaultRecord["kind"], keepers: string) => void;
  markNotificationsRead: () => void;
  updateProfile: (patch: ProfileOverrides) => void;
  submitApplication: (input: Omit<CustodianApplication, "id" | "status" | "submittedAt">) => void;
  advanceApplication: () => void;
  clearApplication: () => void;
  markWithheldSeen: () => void;
  resetDemo: () => void;
}

export type KalaverseState = KalaverseData & KalaverseActions;

function createInitialState(): KalaverseData {
  const now = new Date();
  return {
    role: "visitor",
    experiences: seedExperiences,
    products: seedProducts,
    bookings: [],
    orders: [],
    transactions: createSeedTransactions(now),
    nextBookingSeq: 1042,
    nextOrderSeq: 420,
    aiContents: createSeedAIContents(now),
    aiEnabled: true,
    savedExperienceIds: [],
    notifications: createSeedNotifications(now),
    profile: {},
    vaultRecords: seedVaultRecords,
    application: null,
    withheldNotice: null,
    communityShareAdded: 0,
  };
}

function note(kind: NotificationKind, title: string, body: string): Notification {
  return { id: uid("note"), kind, title, body, createdAt: new Date().toISOString(), read: false };
}

/** When a practice leaves protection, media stays off and AI stays off until the custodian turns them on. */
function releasedConsent(consent: ConsentSettings, level: AccessLevel): ConsentSettings {
  const next = applyAccessLevel(consent, level);
  if (consent.accessLevel === "protected" && level !== "protected") {
    return { ...next, participation: "guided", eligibility: "everyone", maxGroup: next.maxGroup || 10 };
  }
  return next;
}

export const useKalaverse = create<KalaverseState>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setRole: (role) => set({ role }),

      toggleSaved: (experienceId) =>
        set((s) => ({
          savedExperienceIds: s.savedExperienceIds.includes(experienceId)
            ? s.savedExperienceIds.filter((id) => id !== experienceId)
            : [...s.savedExperienceIds, experienceId],
        })),

      bookExperience: (request) => {
        const s = get();
        const experience = s.experiences.find((e) => e.id === request.experienceId);
        if (!experience) return { ok: false, reason: "This experience is no longer listed." };
        if (!isBookable(experience)) {
          return { ok: false, reason: "The custodian has protected this practice. It cannot be booked." };
        }
        if (RESPECT_PLEDGES.some((p) => !request.acceptedPledges.includes(p.id))) {
          return { ok: false, reason: "Accept each of the custodian's terms before booking." };
        }
        const capacity = experience.consent.maxGroup;
        if (request.guests < 1 || request.guests > capacity) {
          return { ok: false, reason: `The custodian allows up to ${capacity} people per session.` };
        }
        const left = capacity - seatsTaken(experience, request.date, s.bookings);
        if (request.guests > left) {
          return {
            ok: false,
            reason:
              left > 0
                ? `Only ${left} places remain in this session. Choose fewer guests or another date.`
                : "This session is full. Choose another date.",
          };
        }

        const now = new Date();
        const payout = payoutFor(experience.price * request.guests, "experience");
        const booking: Booking = {
          id: `CST-${now.getFullYear()}-${s.nextBookingSeq}`,
          experienceId: experience.id,
          experienceTitle: experience.title,
          custodianId: experience.custodianId,
          date: request.date,
          time: request.time,
          guests: request.guests,
          termsVersion: experience.consent.termsVersion,
          agreedAt: now.toISOString(),
          status: "confirmed",
          ...payout,
        };
        const transaction: Transaction = {
          id: uid("txn-live"),
          kind: "experience",
          label: experience.title,
          custodianId: experience.custodianId,
          date: now.toISOString(),
          reference: booking.id,
          ...payout,
        };
        const isMine = experience.custodianId === CURRENT_CUSTODIAN_ID;
        set({
          bookings: [booking, ...s.bookings],
          transactions: [transaction, ...s.transactions],
          nextBookingSeq: s.nextBookingSeq + 1,
          experiences: s.experiences.map((e) => (e.id === experience.id ? { ...e, bookingsCount: e.bookingsCount + 1 } : e)),
          communityShareAdded: s.communityShareAdded + (isMine ? Math.round(payout.custodianNet * COMMUNITY_SHARE) : 0),
          notifications: isMine
            ? [
                note(
                  "booking",
                  `New booking ${booking.id}`,
                  `${request.guests} ${request.guests === 1 ? "visitor" : "visitors"} accepted your version ${booking.termsVersion} terms for ${experience.title}.`,
                ),
                ...s.notifications,
              ]
            : s.notifications,
        });
        return { ok: true, booking };
      },

      orderProduct: (productId, quantity) => {
        const s = get();
        const product = s.products.find((p) => p.id === productId);
        if (!product) return { ok: false, reason: "This piece is no longer available." };
        const sold = s.orders.filter((o) => o.productId === productId).reduce((sum, o) => sum + o.quantity, 0);
        const left = product.stock - sold;
        if (left <= 0) return { ok: false, reason: "The maker has no more of this piece right now." };
        if (quantity < 1 || quantity > left) {
          return { ok: false, reason: `The maker has ${left} ${left === 1 ? "piece" : "pieces"} left.` };
        }
        const now = new Date();
        const payout = payoutFor(product.price * quantity, "product");
        const order: ProductOrder = {
          id: `ORD-${now.getFullYear()}-${s.nextOrderSeq}`,
          productId,
          productName: product.name,
          custodianId: product.custodianId,
          quantity,
          createdAt: now.toISOString(),
          ...payout,
        };
        const isMine = product.custodianId === CURRENT_CUSTODIAN_ID;
        set({
          orders: [order, ...s.orders],
          nextOrderSeq: s.nextOrderSeq + 1,
          transactions: [
            {
              id: uid("txn-live"),
              kind: "product",
              label: product.name,
              custodianId: product.custodianId,
              date: now.toISOString(),
              reference: order.id,
              ...payout,
            },
            ...s.transactions,
          ],
          notifications: isMine
            ? [note("order", `New order ${order.id}`, `${quantity} × ${product.name}, bought directly from you.`), ...s.notifications]
            : s.notifications,
        });
        return { ok: true, order };
      },

      createProduct: (input) => {
        const product: Product = {
          id: `${slugify(input.name) || "product"}-${Date.now().toString(36)}`,
          name: input.name.trim(),
          craft: input.craft,
          custodianId: CURRENT_CUSTODIAN_ID,
          price: input.price,
          materials: input.materials,
          story: input.story.trim(),
          origin: "Udupi",
          makingTime: "Made to order by the custodian",
          authenticity: "custodian_made",
          stock: input.stock,
          motif: craftMotif(input.craft),
        };
        set((s) => ({
          products: [product, ...s.products],
          notifications: [note("order", "Product listed", `${product.name} is listed in Crafts as made by you.`), ...s.notifications],
        }));
        return product;
      },

      createExperience: (input, publish) => {
        const now = new Date().toISOString();
        const option = practiceOption(input.practice);
        const consent = releasedConsent({ ...input.consent, termsVersion: 1, updatedAt: now }, input.consent.accessLevel);
        const experience: Experience = {
          id: `${slugify(input.title) || "experience"}-${Date.now().toString(36)}`,
          title: input.title.trim(),
          practice: input.practice,
          category: option.category,
          format: option.format,
          craft: option.craft,
          custodianId: CURRENT_CUSTODIAN_ID,
          location: input.location,
          district: input.district,
          summary: input.summary.trim(),
          description: input.description.trim(),
          descriptionSource: input.descriptionSource,
          itinerary: [],
          learnBefore: [],
          durationMinutes: input.durationMinutes,
          price: consent.accessLevel === "protected" ? 0 : input.price,
          languages: input.languages,
          schedule: { days: input.days, time: input.time },
          consent,
          status: publish ? "published" : "draft",
          motif: option.motif,
          createdAt: now,
          bookingsCount: 0,
          userCreated: true,
        };
        const isProtected = consent.accessLevel === "protected";
        set((s) => ({
          experiences: [experience, ...s.experiences],
          withheldNotice: publish && isProtected ? { at: now, seen: false } : s.withheldNotice,
          notifications: publish
            ? [
                isProtected
                  ? note("protection", "Sealed in your Protected Vault", `${experience.title} is recorded as protected. It is not listed, bookable or described by AI.`)
                  : note("consent", "Published with your terms", `${experience.title} is live under version 1 of your terms.`),
                ...s.notifications,
              ]
            : s.notifications,
        }));
        return experience;
      },

      updateExperience: (id, input, publish) => {
        set((s) => {
          const current = s.experiences.find((e) => e.id === id);
          if (!current) return {};
          const option = practiceOption(input.practice);
          const now = new Date().toISOString();
          const consent = releasedConsent(
            { ...input.consent, termsVersion: current.consent.termsVersion + 1, updatedAt: now },
            input.consent.accessLevel,
          );
          const updated: Experience = {
            ...current,
            title: input.title.trim(),
            practice: input.practice,
            category: option.category,
            format: option.format,
            craft: option.craft,
            motif: current.userCreated ? option.motif : current.motif,
            summary: input.summary.trim(),
            description: input.description.trim(),
            descriptionSource: input.descriptionSource,
            district: input.district,
            location: input.location,
            languages: input.languages,
            durationMinutes: input.durationMinutes,
            price: input.price,
            schedule: { days: input.days, time: input.time },
            consent,
            status: publish ? "published" : current.status,
          };
          const withdrawn = isDiscoverable(current) && !isDiscoverable(updated);
          return {
            experiences: s.experiences.map((e) => (e.id === id ? updated : e)),
            withheldNotice: withdrawn ? { at: now, seen: false } : s.withheldNotice,
            notifications: [
              note("consent", publish && current.status === "draft" ? "Published with your terms" : "Experience updated", `${updated.title} now follows version ${consent.termsVersion} of your terms.`),
              ...s.notifications,
            ],
          };
        });
      },

      setExperienceStatus: (id, status) =>
        set((s) => {
          const current = s.experiences.find((e) => e.id === id);
          if (!current || current.status === status) return {};
          const updated = { ...current, status };
          const withdrawn = isDiscoverable(current) && !isDiscoverable(updated);
          return {
            experiences: s.experiences.map((e) => (e.id === id ? updated : e)),
            withheldNotice: withdrawn ? { at: new Date().toISOString(), seen: false } : s.withheldNotice,
            notifications:
              status === "published"
                ? [note("consent", "Published with your terms", `${current.title} is live under version ${current.consent.termsVersion} of your terms.`), ...s.notifications]
                : s.notifications,
          };
        }),

      setAccessLevel: (id, level) => {
        set((s) => {
          const current = s.experiences.find((e) => e.id === id);
          if (!current || current.consent.accessLevel === level) return {};
          const now = new Date().toISOString();
          const consent = { ...releasedConsent(current.consent, level), termsVersion: current.consent.termsVersion + 1, updatedAt: now };
          const updated = { ...current, consent };
          const withdrawn = isDiscoverable(current) && !isDiscoverable(updated);
          const released = current.consent.accessLevel === "protected" && level !== "protected";
          return {
            experiences: s.experiences.map((e) => (e.id === id ? updated : e)),
            withheldNotice: withdrawn ? { at: now, seen: false } : s.withheldNotice,
            notifications: [
              level === "protected"
                ? note("protection", "Moved into protection", `${current.title} was removed from public discovery, booking and AI.`)
                : released
                  ? note("consent", "Released from protection", `${current.title} is now ${level}. Media and AI stay off until you turn them on.`)
                  : note("consent", `Access changed to ${level}`, `${current.title} now follows version ${consent.termsVersion} of your terms.`),
              ...s.notifications,
            ],
          };
        });
      },

      updateConsent: (id, input) => {
        set((s) => {
          const current = s.experiences.find((e) => e.id === id);
          if (!current) return {};
          const now = new Date().toISOString();
          const consent = releasedConsent({ ...input, termsVersion: current.consent.termsVersion + 1, updatedAt: now }, input.accessLevel);
          const updated = { ...current, consent };
          const withdrawn = isDiscoverable(current) && !isDiscoverable(updated);
          return {
            experiences: s.experiences.map((e) => (e.id === id ? updated : e)),
            withheldNotice: withdrawn ? { at: now, seen: false } : s.withheldNotice,
            notifications: [
              note("consent", `Terms saved as version ${consent.termsVersion}`, `Visitors to ${current.title} will accept these terms before booking.`),
              ...s.notifications,
            ],
          };
        });
      },

      setAIEnabled: (enabled) => set({ aiEnabled: enabled }),

      setExperienceAI: (id, enabled) =>
        set((s) => ({
          experiences: s.experiences.map((e) =>
            e.id === id && e.consent.accessLevel !== "protected" ? { ...e, consent: { ...e.consent, aiAssist: enabled } } : e,
          ),
        })),

      generateAIDraft: (experienceId) => {
        const s = get();
        const experience = s.experiences.find((e) => e.id === experienceId);
        if (!experience || !s.aiEnabled || !canUseAI(experience)) return null;
        const custodian = custodians.find((c) => c.id === experience.custodianId);
        const content: AIContent = {
          id: uid("ai"),
          experienceId,
          draft: composeDraft({
            title: experience.title,
            practice: experience.practice,
            format: experience.format,
            custodianName: s.profile.name ?? custodian?.name ?? "the custodian",
            district: experience.district,
            location: experience.location,
            summary: experience.summary,
            durationMinutes: experience.durationMinutes,
            languages: experience.languages,
            consent: experience.consent,
          }),
          status: "draft",
          generatedAt: new Date().toISOString(),
          grounded: true,
        };
        set({
          aiContents: [content, ...s.aiContents.filter((c) => !(c.experienceId === experienceId && c.status === "draft"))],
        });
        return content;
      },

      decideAI: (contentId, decision, text) => {
        set((s) => {
          const content = s.aiContents.find((c) => c.id === contentId);
          if (!content) return {};
          const experience = s.experiences.find((e) => e.id === content.experienceId);
          // Rule 3 holds even for drafts created before protection.
          if (decision !== "rejected" && (!experience || experience.consent.accessLevel === "protected")) return {};
          const now = new Date().toISOString();
          const finalText = decision === "edited" ? (text ?? content.draft).trim() : content.draft;
          return {
            aiContents: s.aiContents.map((c) =>
              c.id === contentId ? { ...c, status: decision, decidedAt: now, finalText: decision === "rejected" ? undefined : finalText } : c,
            ),
            experiences:
              decision === "rejected"
                ? s.experiences
                : s.experiences.map((e) =>
                    e.id === content.experienceId
                      ? { ...e, description: finalText, descriptionSource: decision === "edited" ? "ai_edited" : "ai_approved" }
                      : e,
                  ),
          };
        });
      },

      reopenAIDecision: (contentId) =>
        set((s) => ({
          aiContents: s.aiContents.map((c) => (c.id === contentId ? { ...c, status: "draft", decidedAt: undefined, finalText: undefined } : c)),
        })),

      addVaultRecord: (label, kind, keepers) =>
        set((s) => ({
          vaultRecords: [
            { id: uid("vault"), label: label.trim(), kind, keepers: keepers.trim(), sealedAt: new Date().toISOString() },
            ...s.vaultRecords,
          ],
          notifications: [
            note("protection", "Sealed record added", `"${label.trim()}" is registered as protected. Its contents are not stored.`),
            ...s.notifications,
          ],
        })),

      markNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => (n.read ? n : { ...n, read: true })) })),

      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      submitApplication: (input) =>
        set({ application: { ...input, id: uid("app"), status: "pending", submittedAt: new Date().toISOString() } }),

      advanceApplication: () =>
        set((s) => {
          if (!s.application || s.application.status === "verified") return {};
          return {
            application: { ...s.application, status: s.application.status === "pending" ? "under_review" : "verified" },
          };
        }),

      clearApplication: () => set({ application: null }),

      markWithheldSeen: () =>
        set((s) => (s.withheldNotice && !s.withheldNotice.seen ? { withheldNotice: { ...s.withheldNotice, seen: true } } : {})),

      resetDemo: () => set(createInitialState()),
    }),
    {
      name: "kalaverse-demo",
      version: 2,
      // No localStorage on the server, and some browsers block it. Fall back to a no-op store
      // so the persist API always exists and the demo still runs (without saving) in both cases.
      storage: createJSONStorage(() => {
        const noop = { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        if (typeof window === "undefined") return noop;
        try {
          window.localStorage.setItem("kalaverse-probe", "1");
          window.localStorage.removeItem("kalaverse-probe");
          return window.localStorage;
        } catch {
          return noop;
        }
      }),
      skipHydration: true,
      partialize: (s): KalaverseData => ({
        role: s.role,
        experiences: s.experiences,
        products: s.products,
        bookings: s.bookings,
        orders: s.orders,
        transactions: s.transactions,
        nextBookingSeq: s.nextBookingSeq,
        nextOrderSeq: s.nextOrderSeq,
        aiContents: s.aiContents,
        aiEnabled: s.aiEnabled,
        savedExperienceIds: s.savedExperienceIds,
        notifications: s.notifications,
        profile: s.profile,
        vaultRecords: s.vaultRecords,
        application: s.application,
        withheldNotice: s.withheldNotice,
        communityShareAdded: s.communityShareAdded,
      }),
      migrate: () => createInitialState() as KalaverseState,
    },
  ),
);
