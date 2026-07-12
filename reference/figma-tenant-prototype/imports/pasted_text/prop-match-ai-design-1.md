You are a senior product designer. Design a complete, clickable, multi-screen UI prototype for **PropMatch AI**, a broker-free long-term rental marketplace launching in Mansoura, Egypt. Build every screen, state, and flow listed below. Do not omit anything. Do not add features marked OUT OF SCOPE.

## 0. Non-negotiable global rules

1.  **Language & direction: Arabic only, fully right-to-left (RTL).** Every label, button, heading, placeholder, empty state, and error message is in natural Egyptian Arabic (not stiff Modern Standard). Mirror the entire layout for RTL: navigation, back arrows, progress steppers, sliders, and card alignment all flow right-to-left. Use the Arabic glossary in Section 8 for exact wording.
2.  **Numerals:** Use Western Arabic numerals (0–9) for prices, areas, and dates, as Egyptian rental listings do. Prices always show the suffix **ج.م** (e.g., `5000 ج.م / شهريًا`).
3.  **Font:** Use a clean Arabic typeface — **Cairo** or **IBM Plex Sans Arabic** (fallback Tajawal / Noto Sans Arabic). Comfortable line-height for Arabic.
4.  **Visual style — "trust-focused clean":** calm blue/teal primary, plenty of whitespace, soft rounded cards (12–16px radius), gentle shadows, a clear green for "verified/success," amber for "pending," red for "rejected/error." Reassuring and professional, not flashy. Trust cues (verified badges, security notes) are visually prominent.
5.  **Web/Responsive Focus:** Design primarily for modern web browsers (Desktop and Mobile viewports). Target users find rentals on their phones (Facebook/WhatsApp crowd), but landlords and admins will likely use desktop. Ensure responsive layouts (e.g., grid lists on desktop, single column on mobile).
6.  **Unified Account System:** A user has **one account** and can switch between being a Tenant (مستأجر) or Landlord/Owner (مالك) seamlessly. The navigation should reflect the current active context (e.g., a "Switch to Landlord View" toggle in the profile menu).
7.  **Three Roles:** Tenant (مستأجر), Landlord/Owner (مالك) [accessed via the unified account], Admin (مشرف). Show a role-appropriate navigation for each context.
8.  **Deliver a navigable prototype:** primary buttons link to the next screen so the flows below are clickable end-to-end.
9.  **Icons & graphics — no emojis, ever (solid rule).** Never use emoji characters anywhere in the UI, copy, buttons, or empty states. Use **Lucide** icons (`lucide-react`) for all iconography. Where a bespoke mark is needed — brand logo, verified seal, match-score ring, empty-state illustrations — draw clean inline **SVG**. All icons inherit the color palette, use consistent stroke width, and **mirror for RTL** where directional (arrows, chevrons, back buttons point the correct way). Suggested Lucide mappings: verified/trust → `BadgeCheck`, `ShieldCheck`; National ID → `ScanLine`, `CreditCard`; selfie/liveness → `ScanFace`, `Camera`; search/match → `Search`, `Sparkles`; match-score → inline SVG progress ring; legal assistant → `Scale`, `MessageCircle`; contract/PDF → `FileText`, `Download`; payment → `CreditCard`; boost → `TrendingUp`, `Rocket`; property/home → `Home`, `Building2`; bedrooms → `BedDouble`; bathrooms → `Bath`; area → `Ruler`, `Maximize`; furnished → `Sofa`; amenities → `CheckCircle2`; notifications → `Bell`; approve/reject → `Check` / `X`; pending → `Clock`; phone hidden → `Lock`, `PhoneOff`; contact owner → `Phone`; success → `CheckCircle2`; error → `AlertCircle`.

## 1. Screen inventory (build all of these)

**Public / Auth (Unified)**
1.  **Landing page** — hero with the core promise (rent directly from owners, no broker commission, verified listings, AI matching). Sections: how it works (3 steps), why trust us (eKYC verified, AI match, ready lease contract), for tenants vs for owners, CTA to sign up. Trust-forward, calm. Responsive design (hero image beside text on desktop, stacked on mobile).
2.  **Sign up / Log in** — Unified entry. Email, password, phone number. The user creates a single account.

**Account Dashboard & Context Switching**
3.  **Main User Dashboard** — The central hub after login. Displays user profile summary, verification status (eKYC), and clear paths: "البحث عن عقار" (Search for a property - Tenant flow) and "إدارة عقاراتي" (Manage my properties - Landlord flow).

**User Onboarding — eKYC (Required for listing properties, optional but encouraged for searching)**
4.  **Step 1 – National ID front** upload (camera/upload, live guidance frame).
5.  **Step 2 – National ID back** upload.
6.  **Step 3 – Selfie / liveness check** (face-in-oval capture).
7.  **Processing state** — "verifying your identity" spinner.
8.  **Success** — "Identity Verified" with a green verified badge; show the extracted Full Name + masked National ID (only last 4 digits visible) for confirmation.
9.  **Failure / retry** — poor image quality message; show attempts remaining (max 3); after 3 fails, a "locked, contact support" state.
10. **Ownership disclaimer** — a persistent, honest notice (see glossary): *identity is verified, but property ownership is self-declared by the owner.* Show it during onboarding and on every listing.

**Tenant Context Flow (البحث عن عقار)**
11. **Tenant home / browse** — search bar, featured/approved listings as grid cards (desktop) or list (mobile). Cards show photo, price ج.م/شهريًا, neighborhood text, bedrooms/area, verified-owner badge, boosted tag where applicable.
12. **Smart Matching requirement form** — the AI matchmaker input: budget range (slider), preferred neighborhood (free text — no map), property type, number of bedrooms, furnished or not, lifestyle/preferences (free text, e.g., "quiet area near the university"), manual commute note. Big "Find my match" CTA.
13. **Match results** — property cards each showing a **Match Score %** (a ring or bar, e.g., "تطابق 87%"), sorted by score. Show a **free-quota indicator** ("3 free matches left" → counts down). Include a fast **loading/skeleton** state.
14. **Quota exhausted state** — when free matchmaker queries run out, block further matching and open the **payment modal** to buy more matches.
15. **Property detail (tenant view)** — Large photo gallery (carousel or grid), full details, amenities, match score, verified-owner badge, ownership disclaimer, and a **gated "Contact owner" area**: the owner's phone is hidden ("رقم الهاتف مخفي حتى تأكيد التطابق") until connection is made.
16. **Legal support chatbot** — a chat screen interface (floating widget or dedicated page). The assistant only answers Egyptian tenancy-law / rental questions. Show example prompts ("ما هي مدة الإخطار قبل إنهاء العقد؟"). Include the **graceful off-topic decline** state.

**Contract Generation**
17. **Contract generator form** — dynamic form accessible from matched properties: landlord name, tenant name, both National IDs (pre-filled if eKYC verified), monthly rent (ج.م), start date, end date, full address (free text), and a rich-text **"additional agreed clauses"** area.
18. **Contract preview + export** — a formatted standard Egyptian lease template rendered on screen with a prominent **"تحميل العقد PDF"** button. Sign offline is implied.

**Landlord Context Flow (إدارة عقاراتي)**
19. **Landlord dashboard** — "my properties" list (grid/table) with status chips: **قيد المراجعة (pending)**, **تمت الموافقة (approved)**, **مرفوض (rejected)**. Show inquiries/matched tenants count per property, and a listing-quota banner ("first listing free").
20. **Add / Edit property form** (complex): manual address & neighborhood text entry (no map/GPS), property type, bedrooms, bathrooms, area (م²), floor, furnished toggle, monthly rent (ج.م), amenities (multi-select chips), photo upload (drag & drop area for web). The **Description** textarea has a **"تحسين الوصف" (Form Optimizer)** button beside it, marked with a Lucide `Sparkles` icon → tapping shows a before/after of AI-improved marketing copy. Show the optimizer's **free-use counter** (e.g., "2 free uses left") and its exhausted state.
21. **Publish & pay** — on submitting a listing: **first listing is free**; 2nd+ listing opens the **payment modal** (pay-per-listing). After submit, status becomes **قيد المراجعة**.
22. **Boost listing** — a screen/CTA to pay to rank a property higher in matches; boosted listings show a "مميّز" tag. Opens the payment modal.
23. **Payment modal (Paymob)** — a reusable modal styled as a **Paymob** checkout (card fields). Contexts: (a) pay-per-listing, (b) boost listing, (c) tenant matchmaker refill. Include **success** and **failure** states. **No points, no wallet — direct EGP payment only.**
24. **Landlord inquiries / matched tenants** — list of interested, ID-verified tenants for a specific property; entry point to the contract generator.

**Admin Flow**
25. **Admin dashboard** — a live review queue (data table layout suitable for web) with a **real-time notification bell** (badge count). Two streams: new user eKYC registrations needing manual review, and new property submissions (**قيد المراجعة**). New items appear with a subtle "just now" highlight.
26. **Admin property review** — full property details with **"موافقة" (Approve)** / **"رفض" (Reject)** actions. Note in the UI that only approved listings become visible to tenants.
27. **Admin user verification review** — review user's eKYC result (extracted name, masked ID, selfie/ID match confidence) with approve/reject.

**Shared**
28. **Profile & Settings** — manage unified account details, view eKYC status, toggle between Tenant/Landlord views if applicable.
29. **Global states** — design reusable **empty**, **loading/skeleton**, **error**, and **success** states. Include a global **notification bell** component and consistent **verified badge** and **match-score** components.

## 2. Feature behaviors to make visible in the UI

-   **Freemium quotas everywhere:** tenant matchmaker = limited free queries then pay; landlord = first listing free + limited free Form Optimizer uses; legal chatbot = free; contract generation = free. Always show remaining free usage as a small chip/counter.
-   **Match Score:** every matched property shows a percentage with a visual (ring/bar).
-   **Verified vs ownership:** show a green "مالك موثّق الهوية" (identity-verified owner) badge, paired with the honest ownership disclaimer. Never imply the deed/ownership is verified by the platform.
-   **Privacy:** National ID numbers are masked in the UI (last 4 digits only). Owner phone numbers are hidden until a match/connection is confirmed.
-   **Unified Account:** The UI must clearly indicate the user's current context (Tenant vs. Landlord) while demonstrating they share the same underlying profile and eKYC status.

## 3. OUT OF SCOPE — do NOT design these
-   No maps, GPS, pins, or commute-time calculators. Addresses are plain text only.
-   No in-app scheduling, calendar, or viewing-booking system.
-   No points, coins, wallet, or bundle economy. Payments are direct EGP via Paymob only.
-   No rent collection, escrow, deposits, or "buy now pay later."
-   No mandatory title-deed or utility-bill ownership verification uploads for listings. Identity (eKYC) only.
-   No conversational/AI contract drafting — the contract is form-to-PDF only.
-   No direct in-app messaging between users (tenant/landlord chat).

## 4. Tone of the Arabic copy
Warm, plain, trustworthy Egyptian Arabic. Short. Reassure on safety and "no broker, no commission." Avoid jargon.

## 5. Color & component notes
-   Primary: calm blue/teal. Success/verified: green. Pending: amber. Error/rejected: red. Neutral backgrounds: white / very light gray.
-   Cards with soft shadow, rounded corners, clear hierarchy. Buttons: solid primary, generous tap targets.
-   Badges: pill-shaped. Match score: circular progress. Status chips: colored pills matching the state colors above.

## 6. Screen flow (link these for the clickable prototype)
-   User logs in → Main Dashboard → Selects "Search" (Tenant View) OR "Manage Properties" (Landlord View).
-   Tenant View: Browse → Smart Matching → Match results → Property detail → Legal chatbot / Contract generator → Contract PDF. Insert the quota paywall → Paymob modal on the matchmaker.
-   Landlord View: Dashboard → (Prompted for eKYC if not done) eKYC wizard → Add property (+ Form Optimizer) → Publish (first free / Paymob for next) → Inquiries → Contract generator. Include Boost → Paymob.
-   Admin View: Log in → Admin dashboard (live queue) → Property review (approve/reject) + User verification review.

## 7. Output
Produce a polished, navigable prototype covering all 29 screens/states above, fully Arabic and RTL, designed for Web (responsive desktop & mobile layouts), in the trust-focused clean style. Keep components consistent and reusable across screens. Ensure the unified account concept is visually clear.

## 8. Egyptian-Arabic microcopy glossary (use these exact terms)

-   Brand / tagline: **PropMatch AI** — «أجر بيتك أو اسكن مباشرة. بدون سمسار، وبدون عمولة.»
-   No broker commission: **بدون عمولة سمسار**
-   Verified identity / verified owner: **هوية موثّقة** / **مستخدم موثّق الهوية**
-   Ownership disclaimer: **«يتم التحقق من هوية المستخدم فقط، أما ملكية العقار فيُقرّ بها المُعلن على مسؤوليته.»**
-   Tenant / Owner / Admin: **مستأجر** / **مالك** / **مشرف**
-   Switch to Landlord/Tenant: **التبديل لحساب المالك** / **التبديل لحساب المستأجر**
-   Search for property / Manage my properties: **البحث عن عقار** / **إدارة عقاراتي**
-   Sign up / Log in: **إنشاء حساب** / **تسجيل الدخول**
-   National ID / card: **الرقم القومي** / **بطاقة الرقم القومي**
-   ID front / back: **وجه البطاقة الأمامي** / **وجه البطاقة الخلفي**
-   Selfie liveness: **صورة شخصية للتحقق (تحقق حي)**
-   Attempts remaining: **المحاولات المتبقية**
-   Add property / listing: **إضافة عقار** / **إعلان**
-   Property status: **قيد المراجعة** / **تمت الموافقة** / **مرفوض**
-   Rent / per month / area / furnished: **الإيجار** / **شهريًا** / **المساحة (م²)** / **مفروش**
-   Bedrooms / bathrooms / amenities / description: **غرف النوم** / **الحمّامات** / **المميزات** / **الوصف**
-   Optimize description button: **تحسين الوصف بالذكاء الاصطناعي** (Lucide `Sparkles` icon, no emoji) — helper: «حوّل وصفك إلى نص تسويقي احترافي.»
-   Free uses left: **الاستخدامات المجانية المتبقية**
-   Smart matching: **المطابقة الذكية** — CTA: **ابحث عن سكنك**
-   Budget / lifestyle / preferences: **الميزانية** / **نمط الحياة** / **التفضيلات**
-   Match score: **نسبة التطابق** (e.g., «تطابق 87%»)
-   Free matches left: **محاولات المطابقة المجانية المتبقية**
-   Quota exhausted: **«انتهت محاولاتك المجانية»** — CTA: **احصل على محاولات إضافية**
-   Contact owner / phone hidden: **تواصل مع المالك** / **«رقم الهاتف مخفي لحماية الخصوصية»**
-   Legal assistant: **المساعد القانوني الذكي** — off-topic decline: «أنا هنا لمساعدتك في أسئلة الإيجار والقانون العقاري في مصر فقط.»
-   Contract / lease: **إنشاء عقد إيجار** / **عقد الإيجار**
-   Additional agreed clauses: **بنود إضافية متفق عليها**
-   Download PDF: **تحميل العقد PDF**
-   Boost / boosted: **تمييز الإعلان** / **إعلان مميّز**
-   First listing free: **«أول إعلان ليك مجانًا!»**
-   Pay-per-listing / payment: **رسوم إضافة إعلان** / **الدفع**
-   Pay via Paymob: **ادفع بأمان عبر Paymob** — success: **«تم الدفع بنجاح»** / failure: **«فشلت عملية الدفع، يرجى المحاولة مرة أخرى»**
-   Approve / Reject (admin): **موافقة** / **رفض**
-   New review needed / just now: **طلب جديد بحاجة لمراجعة** / **الآن**