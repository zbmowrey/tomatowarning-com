---
type: island-props-contract
feature: "Tomato Warning Phase 1 Branding Site"
status: pending-review
created: "2026-02-26"
updated: "2026-02-26"
author: frontend-eng
reviewed-by: [backend-eng]
pending-review: [quality-skeptic]
revision: 3
---

# Island Props Contract: Preact Interactive Islands

This document defines the props contracts for all Preact form islands, the lib utility interfaces, and how they compose. It serves as the integration boundary between Astro page authors (backend-eng) and the Preact island implementations (frontend-eng).

**Context:** This is a fully static Astro 5.x site — there is no traditional backend API. All form islands communicate with an external email platform via `lib/submit.ts`. Props are passed from Astro pages at build time.

---

## Resolved Design Decisions Cross-Reference

The spec defines 9 resolved design decisions non-negotiable for implementation. The following affect form islands directly:

| Decision | Requirement | Enforced by |
|----------|-------------|-------------|
| #6 | Do NOT fire analytics events on already-subscribed signups | All islands: `fireConversionEvent` called only on `"success"` status |
| #7 | Consumer `zipCode` is optional | `showZipCode?: boolean` defaults `true`; `validateZipCode` passes on empty string |
| #8 | Press inquiry via CF Worker/mailto, NOT email platform | `PressInquiryForm` does not call `submitToEmailPlatform`; uses its own submission path |

---

## Shared Types

These types are used across all form islands and lib utilities. They live in `src/config/forms.ts` (re-exported as needed).

```typescript
// Status lifecycle for any form submission
type SubmissionStatus = "idle" | "submitting" | "success" | "already_subscribed" | "error";

// Analytics event names — exhaustive union, no string fallthrough
type AnalyticsEventName = "consumer_signup" | "retailer_signup" | "nonprofit_signup";

// Returned by submitToEmailPlatform and used to drive form state
interface SubmissionResult {
  status: SubmissionStatus;
  message: string; // Human-readable message to display (success, already-subscribed, or error)
}
```

---

## Form Island Props

### 1. `ConsumerSignupForm.tsx`

Used on the homepage (`index.astro`) and all product pages (`products/[slug].astro`).

```typescript
interface ConsumerSignupFormProps {
  formEndpoint: string;             // Email platform API endpoint URL (FORM_ENDPOINT from forms.ts)
  listId: string;                   // Consumer list ID (consumerFormConfig.listId from forms.ts)
  analyticsEvent: "consumer_signup"; // Literal type — prevents misconfiguration
  successMessage: string;           // Displayed in FormSuccess on successful signup
  alreadySubscribedMessage: string; // Displayed when email already on list — NO analytics fired
  noscriptFallbackUrl: string;      // Link to email platform's hosted consumer signup page
  sourceContext?: string;           // Product slug for analytics (e.g., "ef-3-squall-line"), or "homepage"
  showZipCode?: boolean;            // Show optional zip code field. Default: true
  privacyPolicyUrl: string;         // Must be "/privacy/" — passed explicitly for clarity
}
```

**Behavior notes:**
- When `sourceContext` is present: `product_variety` is set to `sourceContext` in the `consumer_signup` analytics event
- When `sourceContext` is absent (homepage): `product_variety` is OMITTED entirely from the analytics props object — not `undefined`, not empty string
- `showZipCode` defaults to `true` if omitted; zip validated only if non-empty (resolved decision #7)
- On `already_subscribed` response: show `alreadySubscribedMessage`, do NOT fire analytics event (resolved decision #6)

---

### 2. `RetailerSignupForm.tsx`

Used on the retailer CTA page (`retailers.astro`).

```typescript
interface RetailerSignupFormProps {
  formEndpoint: string;              // Email platform API endpoint URL (FORM_ENDPOINT from forms.ts)
  listId: string;                    // Retailer list ID (retailerFormConfig.listId from forms.ts)
  analyticsEvent: "retailer_signup"; // Literal type
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;       // Link to email platform's hosted retailer signup page
  sourceContext: string;             // Required. Always "retailers" for this form
  privacyPolicyUrl: string;          // "/privacy/"
}
```

**Fields rendered by this island:**
- `email` (required)
- `name` (required)
- `storeName` (required)
- `location` (required — city, state)
- `role` dropdown: `"Store Owner" | "Category Manager" | "Buyer" | "Other"`
  - When `"Other"` is selected, renders a free-text `roleOther` input (required, conditional)
- `message` (optional, max 500 characters)

**Behavior notes:**
- `roleOther` is conditionally required: include its `validateRequired` rule in the `validateForm` rules map ONLY when `role === "Other"`. See `validateForm` conditional validation pattern below.

---

### 3. `NonprofitSignupForm.tsx`

Used on the fundraisers CTA page (`fundraisers.astro`).

```typescript
interface NonprofitSignupFormProps {
  formEndpoint: string;               // Email platform API endpoint URL (FORM_ENDPOINT from forms.ts)
  listId: string;                     // Nonprofit list ID (nonprofitFormConfig.listId from forms.ts)
  analyticsEvent: "nonprofit_signup"; // Literal type
  successMessage: string;
  alreadySubscribedMessage: string;
  noscriptFallbackUrl: string;        // Link to email platform's hosted nonprofit signup page
  sourceContext: string;              // Required. Always "fundraisers" for this form
  privacyPolicyUrl: string;           // "/privacy/"
}
```

**Fields rendered by this island:**
- `email` (required)
- `contactName` (required)
- `orgName` (required)
- `orgType` dropdown: `"Youth Sports" | "Nonprofit 501(c)(3)" | "School" | "Church/Religious" | "Community Group" | "Other"`
  - When `"Other"` is selected, renders a free-text `orgTypeOther` input (required, conditional)
- `location` (required — city, state)
- `campaignSize` (optional — no validation, free text)

**Behavior notes:**
- `orgTypeOther` is conditionally required: include its `validateRequired` rule in the `validateForm` rules map ONLY when `orgType === "Other"`. Same dynamic rules pattern as `roleOther` in `RetailerSignupForm`.

---

### 4. `FooterSignupForm.tsx`

Used in `Footer.astro`. Compact combined form that routes to the correct list.

```typescript
interface FooterSignupFormProps {
  formEndpoint: string;              // Single endpoint URL for all lists (FORM_ENDPOINT from forms.ts)
  consumerListId: string;            // Routes here when audienceType = "Consumer"
  retailerListId: string;            // Routes here when audienceType = "Retailer"
  nonprofitListId: string;           // Routes here when audienceType = "Nonprofit/Organization"
  successMessage: string;            // Displayed in FormSuccess on successful signup (same for all audiences)
  alreadySubscribedMessage: string;  // Displayed when email already on list — NO analytics fired
  noscriptFallbackUrl: string;       // Link to email platform's generic hosted signup page
  privacyPolicyUrl: string;          // "/privacy/"
}
```

**Fields rendered by this island:**
- `email` (required)
- `audienceType` dropdown: `"Consumer" | "Retailer" | "Nonprofit/Organization"`

**Behavior notes:**
- Fires the matching analytics event (`consumer_signup`, `retailer_signup`, or `nonprofit_signup`) based on selected `audienceType`
- `source_page` analytics prop is auto-captured from `window.location.href`
- No `sourceContext` prop — footer is a catch-all signup, not page-specific
- **`product_variety` omission:** When `audienceType` is "Consumer", `fireConversionEvent("consumer_signup", { source_page })` is called WITHOUT `product_variety`. The property is omitted entirely (not `undefined`, not empty string). This matches the data model: "Null if from footer or non-product page."

---

### 5. `PressInquiryForm.tsx`

Used on the press page (`press.astro`). Does NOT use the email platform.

```typescript
interface PressInquiryFormProps {
  submitEndpoint?: string;   // CF Worker endpoint (e.g., "/api/press-inquiry"). When provided: POST JSON and show inline confirmation.
  fallbackMailto: string;    // Mailto URI (e.g., "mailto:press@tomatowarning.com"). Always required.
  successMessage: string;    // Displayed in FormSuccess after successful CF Worker POST
  privacyPolicyUrl: string;  // "/privacy/"
}
```

**Fields rendered by this island:**
- `name` (required)
- `email` (required)
- `outlet` (optional — publication or media outlet name)
- `message` (required, min 10 chars, max 2000 chars)

**Behavior notes:**
- When `submitEndpoint` is provided: renders a `<form>`, POSTs JSON to the CF Worker, displays inline `FormSuccess` or `FormError` (resolved decision #8)
- When `submitEndpoint` is omitted: renders a mailto link instead of a form — no inline confirmation (different UX path, made explicit by prop split)
- Does NOT use `submitToEmailPlatform` — press inquiries bypass the email platform (resolved decision #8)
- Does NOT fire any analytics event (press inquiries are not conversions)
- CF Worker (`functions/api/press-inquiry.ts`) forwards to press contact email
- `<noscript>` fallback always uses `fallbackMailto` as an `<a href>` link

---

## Lib Utility Interfaces

### `src/lib/submit.ts`

The ONLY file in the codebase aware of the email platform's API format. All form islands call this — never fetch directly.

```typescript
interface EmailSubmissionPayload {
  email: string;
  listId: string;
  fields?: Record<string, string>;  // Additional fields (name, storeName, etc.)
  signupSource: string;             // Auto-captured: window.location.href at submission time
  utmParams?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  };
}

// Primary export: submit email signup to the configured platform
function submitToEmailPlatform(
  endpoint: string,
  payload: EmailSubmissionPayload
): Promise<SubmissionResult>;

// Internal behavior:
// - Auto-captures signupSource from window.location.href
// - Auto-captures utmParams from URL search params at call time
// - Maps HTTP response to SubmissionResult.status:
//   - 2xx new signup → "success"
//   - 2xx already on list (platform-specific response) → "already_subscribed"
//   - Network error / 4xx / 5xx → "error"
```

---

### `src/lib/analytics.ts`

Thin wrapper around `window.plausible`. Gracefully no-ops if Plausible is blocked by ad blockers.

```typescript
// Fire a named conversion event with properties
function fireConversionEvent(
  eventName: AnalyticsEventName,
  props: { source_page: string; product_variety?: string }
): void;
// Implementation: window.plausible?.(eventName, { props })
// Never throws. No-ops silently if window.plausible is undefined.

// Parse UTM parameters from the current URL
function getUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
};
// Reads from window.location.search at call time.
```

**Critical rule:** `fireConversionEvent` is called ONLY on `SubmissionStatus === "success"`. Never on `"already_subscribed"` or `"error"`.

---

### `src/lib/validation.ts`

Pure functions — no side effects, no imports, fully unit-testable.

```typescript
// Returns null if valid, or an error message string if invalid
function validateEmail(email: string): string | null;
// Example error: "Please enter a valid email address."

function validateRequired(value: string, fieldName: string): string | null;
// Trims before check. Example error: "Name is required."

function validateZipCode(zip: string): string | null;
// Optional field — empty string passes. Only validates if non-empty.
// Pattern: exactly 5 digits. Example error: "Please enter a 5-digit zip code."

function validateMaxLength(value: string, max: number, fieldName: string): string | null;
// Example error: "Message must be 500 characters or fewer."

function validateMinLength(value: string, min: number, fieldName: string): string | null;
// Example error: "Message must be at least 10 characters."

// Validate a whole form at once. Returns map of fieldName → errorMessage.
// Empty record {} means no errors (form is valid).
type ValidationRule = {
  validator: (value: string) => string | null;
};
function validateForm(
  data: Record<string, string>,
  rules: Record<string, ValidationRule[]>
): Record<string, string>;
```

**Conditional validation pattern:** For fields that are only required based on another field's value (e.g., `roleOther` required only when `role === "Other"`; `orgTypeOther` required only when `orgType === "Other"`), the calling form component MUST construct the `rules` map dynamically based on current field values before calling `validateForm`. Do not include a conditional field's rules when its condition is not met.

```typescript
// Example: RetailerSignupForm constructing rules conditionally
const rules: Record<string, ValidationRule[]> = {
  email: [{ validator: validateEmail }],
  name: [{ validator: (v) => validateRequired(v, "Name") }],
  role: [{ validator: (v) => validateRequired(v, "Role") }],
  ...(formData.role === "Other"
    ? { roleOther: [{ validator: (v) => validateRequired(v, "Role description") }] }
    : {}),
};
const errors = validateForm(formData, rules);
```

---

## Form Primitive Props (Internal Components)

These are internal to Phase 3. Astro pages never reference these directly — only the form islands use them.

### `FormField.tsx`

```typescript
interface FormFieldProps {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  value: string;
  onInput: (value: string) => void;
  error?: string | null;              // When non-null: triggers aria-invalid="true" and aria-describedby="${name}-error"
  options?: { value: string; label: string }[]; // Required when type="select"
  maxLength?: number;                 // For textarea character limit display; sets maxlength attribute
  minLength?: number;                 // For minimum length validation hint (e.g., press message: 10)
  inputMode?: "email" | "text" | "numeric"; // Sets inputmode attribute
  autoComplete?: string;             // Sets autocomplete attribute (e.g., "email", "name", "postal-code")
}
```

**ARIA behavior (WCAG 2.1 AA — all mandatory):**
- Error element ID convention: `${name}-error` (e.g., prop `name="email"` → error `id="email-error"`)
- When `error` is non-null: input/select/textarea renders `aria-invalid="true"` AND `aria-describedby="${name}-error"`
- When `required` is true: input/select/textarea renders both `required` and `aria-required="true"`
- When `error` is null or undefined: omit `aria-invalid` and `aria-describedby` entirely (do not set to `"false"` or `""`)

### `FormSuccess.tsx`

```typescript
interface FormSuccessProps {
  message: string;
}
// Renders with role="status" aria-live="polite"
// Receives focus on mount via useEffect + ref.focus()
```

### `FormError.tsx`

```typescript
interface FormErrorProps {
  message: string;
  onRetry: () => void; // Resets form status back to "idle"
}
// Renders with role="alert" aria-live="assertive"
```

---

## Usage Examples

### Astro page wiring (product page)

```astro
---
import ConsumerSignupForm from "@/components/forms/ConsumerSignupForm";
import { FORM_ENDPOINT, consumerFormConfig } from "@/config/forms";

const { slug } = Astro.params;
---

<ConsumerSignupForm
  client:visible
  formEndpoint={FORM_ENDPOINT}
  listId={consumerFormConfig.listId}
  analyticsEvent="consumer_signup"
  successMessage={consumerFormConfig.successMessage}
  alreadySubscribedMessage={consumerFormConfig.alreadySubscribedMessage}
  noscriptFallbackUrl={consumerFormConfig.noscriptFallbackUrl}
  sourceContext={slug}
  showZipCode={true}
  privacyPolicyUrl="/privacy/"
/>
```

### Astro page wiring (footer)

```astro
---
import FooterSignupForm from "@/components/forms/FooterSignupForm";
import {
  FORM_ENDPOINT,
  consumerFormConfig,
  retailerFormConfig,
  nonprofitFormConfig,
} from "@/config/forms";
---

<FooterSignupForm
  client:visible
  formEndpoint={FORM_ENDPOINT}
  consumerListId={consumerFormConfig.listId}
  retailerListId={retailerFormConfig.listId}
  nonprofitListId={nonprofitFormConfig.listId}
  successMessage="You're on the list!"
  alreadySubscribedMessage="You're already signed up."
  noscriptFallbackUrl={consumerFormConfig.noscriptFallbackUrl}
  privacyPolicyUrl="/privacy/"
/>
```

### Astro page wiring (press page)

```astro
---
import PressInquiryForm from "@/components/forms/PressInquiryForm";
---

<PressInquiryForm
  client:visible
  submitEndpoint="/api/press-inquiry"
  fallbackMailto="mailto:press@tomatowarning.com"
  successMessage="Thanks for reaching out. We'll respond within 2 business days."
  privacyPolicyUrl="/privacy/"
/>
```

---

## Resolved Decisions

1. **Props shape: flat props** — Individual props (not `FormConfig` wrapper object) for all form islands. `src/config/forms.ts` exports `FORM_ENDPOINT` plus named config objects (`consumerFormConfig`, `retailerFormConfig`, `nonprofitFormConfig`) each containing `listId`, `analyticsEvent`, `successMessage`, `alreadySubscribedMessage`, and `noscriptFallbackUrl`.

2. **Single endpoint** — Email platform uses one API endpoint URL for all lists. `listId` differentiates them.

3. **Press inquiry: CF Worker + explicit `fallbackMailto` prop** — `PressInquiryForm` has `submitEndpoint?: string` and `fallbackMailto: string`. When `submitEndpoint` is provided, renders a form with inline confirmation. When omitted, renders a mailto link. Two UX paths made explicit by prop split rather than implicit string prefix detection.

4. **`already_subscribed` detection** — HTTP 200 + response body field. `submit.ts` uses a configurable response parser; public interface does not change when platform is confirmed.

5. **`noscriptFallbackUrl` prop** — All four email signup form islands receive it. Islands never hardcode external URLs. `PressInquiryForm` uses `fallbackMailto` for its noscript link.

6. **`product_variety` omission** — For footer and homepage consumer signups, `product_variety` is omitted entirely from the `fireConversionEvent` props object — not `undefined`, not empty string. Only passed when `sourceContext` is present (product pages).

---

## Constraints & Non-Negotiables

- Submit button MUST be disabled while `status === "submitting"` (double-fire prevention)
- `fireConversionEvent` MUST NOT be called on `"already_subscribed"` or `"error"` status (resolved decision #6)
- `product_variety` MUST be omitted (not empty, not undefined) for non-product-page consumer signups
- Every email signup form island MUST include a `<noscript>` fallback using the `noscriptFallbackUrl` prop — never hardcode a URL inside the island
- `PressInquiryForm` `<noscript>` fallback uses the `fallbackMailto` prop as an `<a href>` link
- Every form island MUST render a privacy policy link (via `PrivacyLink.astro` or inline)
- All inputs MUST have associated `<label>` elements — no `aria-label` only (WCAG 2.1 AA)
- When `required` is true: input/select/textarea MUST render both `required` and `aria-required="true"`
- When `error` is non-null: input/select/textarea MUST render `aria-invalid="true"` and `aria-describedby="${name}-error"`
- Error elements MUST use ID convention `${name}-error`
- Focus MUST move to first invalid field on failed validation
- Focus MUST move to `FormSuccess` message on successful submission
