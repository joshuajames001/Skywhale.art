# Monetization Audit: Stripe to Lemon Squeezy Migration

> **HISTORICAL DOCUMENT.** Stripe byl nahrazen Gumroad integrací (GF-7, 2026-03-07).
> Edge Functions `create-checkout` a `stripe-webhook` byly odstraněny.
> Aktuální platební systém: `gumroad-webhook` Edge Function.
> Viz `CLAUDE.md` sekce "Energy Economy" pro aktuální tiers.

**Date:** 2026-02-17
**Scope:** Backend, Frontend, and Webhooks

## 1. Executive Summary
The current monetization system uses **Stripe Checkout** for both one-time purchases ("Packages" & "Donations") and recurring subscriptions.
- **Frontend**: Hardcoded product list in `EnergyStore.tsx`.
- **Backend**: `create-checkout` Edge Function maps IDs to Stripe logic.
- **Fulfillment**: `stripe-webhook` Edge Function handles `checkout.session.completed` and `invoice.payment_succeeded` to securely update the database.

**Migration Complexity:** **Medium**. The logic is well-structured but relies on specific Stripe metadata fields (`user_id`, `energy_amount`) that must be replicated in Lemon Squeezy's "Custom Data".

---

## 2. Product Inventory (Source of Truth)

### One-Time Packages (Energy Packs)
| ID | Name | Price (CZK) | Energy |
| :--- | :--- | :--- | :--- |
| `starter` | Zvědavec | 199 Kč | 1,000 |
| `writer` | Spisovatel | 499 Kč | 3,000 |
| `master_wordsmith` | Mistr Slova | 1,099 Kč | 7,500 |

### Subscriptions (Recurring)
| Tier ID | Name | Monthly (CZK) | Yearly (CZK) | Monthly Energy |
| :--- | :--- | :--- | :--- | :--- |
| `sub_start` | Start | 259 Kč | 3,108 Kč | 1,600 |
| `sub_advanced` | Pokročilý | 599 Kč | 7,188 Kč | 4,000 |
| `sub_expert` | Expert | 1,199 Kč | 13,189 Kč | 9,000 |
| `sub_master` | Mistr | 2,499 Kč | 24,990 Kč | 21,000 |

### Donations
| ID | Name | Price (CZK) | Bonus Energy |
| :--- | :--- | :--- | :--- |
| `donate_coffee` | Káva | 79 Kč | 100 |
| `donate_lunch` | Oběd | 199 Kč | 250 |
| `donate_treasure` | Poklad | 499 Kč | 600 |
| `donate_custom` | Custom | Variable | 5 per 1 Kč |

---

## 3. Data Flow Analysis

### Phase 1: Initiation (`create-checkout`)
- **Location:** `supabase/functions/create-checkout/index.ts`
- **Input:** `packageId`, `userId`.
- **Logic:**
    - Verifies Supabase Auth token.
    - Matches `packageId` to internal `PACKAGES` constant (Backend is Source of Truth for price).
    - Creates Stripe Session with **Metadata**:
        - `user_id`: Essential for fulfillment.
        - `energy_amount`: The amount to grant (calculated backend-side).
        - `package_id`: Used for analytics and subscription tiering.

### Phase 2: Fulfillment (`stripe-webhook`)
- **Location:** `supabase/functions/stripe-webhook/index.ts`
- **Events Handled:**
    1.  **`checkout.session.completed`** (Initial payments):
        - Grants Energy via RPC `add_energy`.
        - Updates Profile (if Subscription): Sets `subscription_status`, `next_energy_grant`.
        - Logs Transaction.
    2.  **`invoice.payment_succeeded`** (Renewals):
        - Grants Energy via RPC `add_energy`.
        - Logs Transaction.
- **Side Effects:**
    - **Achievements**: Checks recharge count to unlock badges ('first_recharge', 'energy_magnate') and referral rewards.

---

## 4. Migration Plan (Lemon Squeezy)

### Key Differences & Gaps
1.  **Webhooks**: Lemon Squeezy uses `order_created` and `subscription_payment_success`. The payload structure is different.
2.  **Metadata**: We must use LS "Custom Data" to pass `user_id` and `energy_amount`.
3.  **Variant IDs**: We must map our internal IDs (`starter`, `sub_start`) to Lemon Squeezy **Variant IDs**.

### Action Items
1.  **Create Products in LS**: Recreate all packages and subscriptions in the Lemon Squeezy dashboard.
2.  **Map IDs**: Create a mapping file `config/lemon-squeezy.ts` mapping internal IDs to LS Variant IDs.
3.  **Update `create-checkout`**: Replace Stripe SDK with Lemon Squeezy API call (`https://api.lemonsqueezy.com/v1/checkouts`).
4.  **Rewrite Webhook**: Create `supabase/functions/ls-webhook` to parse the new payload format and call the *existing* logic (Energy Grant + Achievements).
