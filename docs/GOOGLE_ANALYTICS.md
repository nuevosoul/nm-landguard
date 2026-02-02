# Google Analytics Setup for RGDD

## Quick Setup (5 minutes)

### Step 1: Create GA4 Property

1. Go to [analytics.google.com](https://analytics.google.com)
2. Click **Admin** (gear icon)
3. Click **Create Property**
4. Name: `Rio Grande Due Diligence`
5. Timezone: `America/Denver`
6. Currency: `USD`
7. Click **Next**
8. Business details → Select industry and size
9. Choose objectives → Select relevant ones (leads, engagement)
10. Click **Create**

### Step 2: Set Up Web Stream

1. Choose **Web** as platform
2. Enter URL: `https://riograndedd.com` (or your domain)
3. Stream name: `RGDD Web`
4. Click **Create stream**
5. **Copy the Measurement ID** — looks like `G-XXXXXXXXXX`

### Step 3: Add to Lovable

**Option A: Via Lovable Chat**
Tell Lovable:
> "Add Google Analytics 4 with measurement ID G-XXXXXXXXXX to the site. Install in the head of index.html."

**Option B: Manual (if Lovable doesn't auto-handle)**

Edit `index.html` and add this in the `<head>` section:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

---

## Key Events to Track

Set these up in GA4 → Admin → Data Streams → [your stream] → Configure tag settings → Events

### Automatic Events (no code needed)
- `page_view` — every page load
- `scroll` — 90% scroll depth
- `click` — outbound clicks

### Custom Events (add later)

For conversion tracking, add custom events in the app:

```javascript
// Report generated
gtag('event', 'generate_report', {
  'event_category': 'conversion',
  'event_label': address,
  'value': 499
});

// Checkout started
gtag('event', 'begin_checkout', {
  'event_category': 'conversion',
  'value': 499
});

// Payment completed
gtag('event', 'purchase', {
  'event_category': 'conversion',
  'transaction_id': orderId,
  'value': 499,
  'currency': 'USD'
});
```

---

## Conversion Goals

Once data is flowing, set up conversion goals:

1. GA4 → Admin → Conversions
2. Click **New conversion event**
3. Add:
   - `begin_checkout` — user clicked "Buy Report"
   - `purchase` — payment completed
   - `generate_report` — report actually generated

---

## Google Search Console (Bonus)

For SEO tracking:

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix → enter your domain
3. Verify via HTML tag or DNS
4. Link to GA4: GA4 Admin → Product Links → Search Console

---

## Verification

After adding the tracking code:

1. Visit your site
2. In GA4, go to **Reports** → **Realtime**
3. You should see your visit appear within 30 seconds

If not working:
- Check browser console for errors
- Verify measurement ID is correct
- Disable ad blockers temporarily to test

---

## Notes

- GA4 data takes 24-48 hours to fully populate (realtime works immediately)
- For Lovable preview URLs, you may want a separate stream or filter those out
- Consider GDPR cookie consent if targeting EU users (not required for US-only)

---

*Created: 2026-02-01*
