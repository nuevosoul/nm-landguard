# RGDD — Go-To-Market Strategy

**Product:** Rio Grande Due Diligence  
**Price:** $499/report  
**Market:** New Mexico rural land buyers, developers, investors  
**Created:** 2026-01-30 (night shift)

---

## Executive Summary

RGDD fills a gap between expensive Phase 1 ESAs ($2,000–$5,000+) and blind land purchases. It's instant, NM-specific, and priced for individuals — not just commercial developers.

**Target:** 10-25 reports/month = $5K-$12.5K passive income within 90 days.

---

## 1. Competitive Landscape

### Direct Competitors (Desktop Due Diligence)

| Competitor | Price | Turnaround | NM-Specific | Notes |
|------------|-------|------------|-------------|-------|
| **PropertyShark** | $99–$200/mo subscription | Instant | No | Urban-focused, weak on rural NM |
| **LandGlide** | $10–$20/mo | Instant | Limited | Parcel data only, no regulatory |
| **Regrid** | $200–$500/report | Hours | Some | Commercial API, not consumer-facing |
| **Phase 1 ESA** | $2,000–$5,000 | 2-4 weeks | N/A | Professional site visit, overkill for land purchase |

### Indirect Competitors

- **Title companies** — Focus on ownership, not environmental/regulatory
- **Real estate agents** — May provide basic info, not comprehensive
- **DIY research** — Possible but time-consuming (8-20 hours)

### RGDD Positioning

**Unique Value:**
1. **NM-specific** — Tuned for OSE water rights, acequia systems, tribal land proximity, NMCRIS cultural resources
2. **Instant** — Live API queries, results in minutes
3. **Affordable** — $499 vs $2K+ for Phase 1 ESA
4. **Consumer-friendly** — Designed for individuals, not just commercial developers

**Competitive Moat:**
- 14 integrated data sources (OSE, FEMA, EPA, NMCRIS, USDA, BIA, Google Solar/Places)
- NM-specific regulatory knowledge (water rights are complex here)
- PDF deliverable suitable for lender/investor presentations

---

## 2. Pricing Validation

### $499 Price Point Analysis

**Cost to deliver:** ~$2-5 (API calls, Supabase compute)  
**Gross margin:** 98%+

**Reference points:**
- Phase 1 ESA: $2,000–$5,000 (professional inspection)
- Phase 2 ESA: $5,000–$20,000+ (soil sampling)
- Appraisal: $300–$600
- Survey: $300–$1,500
- Title search: $75–$250

**$499 is the sweet spot:**
- Expensive enough to signal quality
- Cheap enough for individuals buying $50K-$500K parcels
- 10x cheaper than Phase 1 ESA
- Worth it to avoid a $50K mistake (bad water rights, flood zone, cultural site)

**Price sensitivity test:**
- Start at $499
- If conversion is low, test $349 or $399
- If conversion is high, test $599 or $749

---

## 3. Target Customer Segments

### Primary: Rural Land Buyers (60% of volume)

**Profile:**
- Buying 1-40 acre parcels for homestead, retirement, investment
- Price range: $30K–$300K
- Tech-savvy enough to find us online
- DIY mindset but wants professional validation

**Pain points:**
- "Is there water?" (OSE well records, water rights)
- "Can I build here?" (flood zone, cultural resources)
- "What's nearby?" (EPA sites, solar potential)

**Channels:**
- Google Ads: "New Mexico land for sale" + "due diligence"
- Facebook/Instagram: NM land groups, homesteading communities
- LandWatch, Land.com, Zillow land listings (partnership/ads)
- NM-specific subreddits, forums

### Secondary: Real Estate Investors (25% of volume)

**Profile:**
- Buying multiple parcels for speculation or development
- Price range: $100K–$1M+
- Volume buyers, need quick screening

**Pain points:**
- Speed — screening dozens of parcels
- Deal flow — finding problems before LOI
- Risk mitigation — protecting capital

**Channels:**
- BiggerPockets forums
- Commercial real estate groups
- Direct outreach to land investors
- Volume discounts (5-pack, 10-pack)

### Tertiary: Developers & Professionals (15% of volume)

**Profile:**
- Small developers doing residential/commercial projects
- Attorneys, title companies, lenders
- Need preliminary screening before Phase 1 ESA

**Pain points:**
- Pre-qualification — screen sites before committing to Phase 1
- Documentation — professional report for files
- Speed — fast preliminary assessment

**Channels:**
- NMBA (New Mexico Bankers Association)
- NMCAR (NM Commercial Association of Realtors)
- Title company partnerships
- White-label/API access (future)

---

## 4. Launch Plan

### Phase 1: Soft Launch (Days 1-14)

**Goal:** Validate product-market fit with real customers

**Actions:**
- [ ] Deploy Stripe (Mateo to add secrets)
- [ ] Run 5-10 test reports on known properties
- [ ] Share in 3-5 NM land Facebook groups (personal, not spammy)
- [ ] Post in r/NewMexico, r/homestead, r/RealEstateInvesting
- [ ] Collect feedback, fix bugs

**Metrics:**
- 3-5 paying customers
- Conversion rate on landing page
- Report quality feedback

### Phase 2: SEO Foundation (Days 15-45)

**Goal:** Build organic search presence

**Actions:**
- [ ] Publish 5-10 blog posts targeting long-tail keywords:
  - "New Mexico water rights explained"
  - "FEMA flood zones in [County] NM"
  - "How to check for cultural resources on NM land"
  - "OSE well records lookup guide"
  - "Buying land near tribal reservations"
- [ ] Local business listings (Google Business, Yelp)
- [ ] Schema markup for local service

**Metrics:**
- First organic traffic within 30 days
- 3-5 keywords ranking in top 20

### Phase 3: Paid Acquisition (Days 30-60)

**Goal:** Scalable customer acquisition

**Actions:**
- [ ] Google Ads campaign: "New Mexico land due diligence"
- [ ] Facebook/Instagram ads targeting NM land interests
- [ ] Retargeting pixels on site
- [ ] A/B test landing page headlines

**Budget:** Start with $500-$1,000/month  
**Target CAC:** <$100 (5:1 LTV:CAC on single purchase)

**Metrics:**
- CAC by channel
- Conversion rate by traffic source
- ROAS (return on ad spend)

### Phase 4: Partnerships (Days 60-90)

**Goal:** Distribution partnerships

**Actions:**
- [ ] Reach out to 5-10 NM real estate agents for referral deals
- [ ] Contact 2-3 title companies for integration/partnership
- [ ] Explore LandWatch/Land.com advertising
- [ ] Consider white-label for attorneys, title companies

**Metrics:**
- 2-3 active referral partners
- 10%+ of volume from partners

---

## 5. Marketing Messages

### Primary Headline
> **Know Before You Buy: New Mexico Land Intelligence**

### Alternative Headlines (A/B test)
- "Don't Buy NM Land Blind — $499 Regulatory Risk Report"
- "Water Rights. Flood Zones. Cultural Sites. One Report."
- "The $499 Insurance Policy for NM Land Buyers"

### Value Propositions (by segment)

**For land buyers:**
> Discover water rights issues, flood zones, and hidden regulatory risks before you close. Instant PDF report, 14 government data sources, NM-specific.

**For investors:**
> Screen parcels in minutes, not days. Professional-grade due diligence at 1/10th the cost of Phase 1 ESA.

**For professionals:**
> Pre-qualification tool for land deals. Document your due diligence with comprehensive regulatory citations.

### Social Proof (to build)
- [ ] Customer testimonials (after first 5-10 sales)
- [ ] "Saved me from buying a flood zone property" stories
- [ ] Case study: problem caught by RGDD

---

## 6. Pricing Tiers (Future)

### Current: Single Report — $499
Everything in one comprehensive PDF.

### Future Options:

**Quick Screen — $199**
- Executive summary only
- Risk flags without deep detail
- Good for screening multiple parcels

**Full Report — $499** (current)
- Complete analysis + PDF deliverable
- All 14 data sources

**Development Package — $999**
- Full report + raw data export
- API access for follow-up queries
- 30-day support

**Volume Packs:**
- 5-pack: $1,999 ($400/each)
- 10-pack: $3,499 ($350/each)

---

## 7. Key Metrics to Track

### Revenue
- MRR (even though single purchase, track monthly)
- Reports sold per month
- Average revenue per report

### Acquisition
- Site visitors
- Conversion rate (visitor → checkout)
- CAC by channel
- Referral source breakdown

### Product
- Report generation success rate
- Average time to generate
- API error rates
- Customer support tickets

### Retention (future)
- Repeat customers
- Referrals generated

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| API rate limits | Cache where allowed, graceful degradation |
| Data accuracy liability | Clear disclaimers, "preliminary desktop review" positioning |
| Stripe fraud | Enable Radar, set up fraud rules |
| Low conversion | A/B test pricing, headlines, social proof |
| Competition | Move fast, build NM-specific depth, customer relationships |

---

## 9. 90-Day Targets

| Metric | Target |
|--------|--------|
| Reports sold | 30-50 |
| Revenue | $15K-$25K |
| CAC | <$100 |
| Conversion rate | 2-4% |
| Organic traffic | 500+ visitors/month |
| Active referral partners | 2-3 |

---

## Next Actions

**Tonight:**
- [x] Write GTM strategy (this document)
- [ ] Create test property list (edge cases)

**Tomorrow (Mateo):**
- [ ] Add Stripe secrets to Supabase
- [ ] Deploy edge functions
- [ ] Run first test transaction

**This Week:**
- [ ] Soft launch in 3-5 Facebook groups
- [ ] First blog post draft
- [ ] Set up Google Analytics / Plausible

---

*Strategy complete. Ship the product, then iterate based on real customer feedback.*
