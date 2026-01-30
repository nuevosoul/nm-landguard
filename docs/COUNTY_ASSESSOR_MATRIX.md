# New Mexico County Assessor Integration Matrix

> **Last Updated:** January 2025  
> **Purpose:** Track county assessor data accessibility for RGDD property lookups

## Executive Summary

New Mexico has **33 counties** with varying levels of digital infrastructure for property data access. This matrix documents:
- Online parcel search availability
- GIS portal access
- API/data download options
- Integration status with RGDD platform

### Integration Tiers

| Tier | Description | Counties |
|------|-------------|----------|
| **Tier 1** | Full API/GIS integration available | Bernalillo, Santa Fe, Doña Ana |
| **Tier 2** | Online search + GIS portal | Sandoval, Lea, San Juan, Eddy, Chaves |
| **Tier 3** | Basic online search | ~15 counties |
| **Tier 4** | Phone/in-person only | ~10 rural counties |

---

## Priority Counties (High Volume)

### 1. Bernalillo County
- **Population:** ~680,000 (largest)
- **Assessor Website:** https://www.bernco.gov/assessor/
- **GIS Portal:** https://www.bernco.gov/planning/maps-gis/
- **Online Parcel Search:** ✅ Full functionality
- **API Available:** ✅ ArcGIS REST services
- **Data Download:** ✅ Shapefile downloads available
- **Integration Status:** ✅ **INTEGRATED** via property-lookup edge function
- **Notes:** Best data availability in state. Uses Tyler Technologies iasWorld.

### 2. Santa Fe County
- **Population:** ~155,000
- **Assessor Website:** https://www.santafecountynm.gov/assessor
- **GIS Portal:** https://gis.santafecountynm.gov/
- **Online Parcel Search:** ✅ Full functionality
- **API Available:** ✅ ArcGIS REST services
- **Data Download:** ✅ Limited
- **Integration Status:** 🔄 **PARTIAL** - GIS layer available
- **Notes:** Good online system. Historic properties require SHPO coordination.

### 3. Doña Ana County
- **Population:** ~220,000
- **Assessor Website:** https://www.donaanacounty.org/assessor
- **GIS Portal:** https://gis.donaanacounty.org/
- **Online Parcel Search:** ✅ Full functionality
- **API Available:** ✅ ArcGIS REST services
- **Data Download:** ✅ Available
- **Integration Status:** 🔄 **PARTIAL** - GIS layer available
- **Notes:** Second largest metro area (Las Cruces). Good digital infrastructure.

### 4. Sandoval County
- **Population:** ~150,000
- **Assessor Website:** https://www.sandovalcountynm.gov/assessor/
- **GIS Portal:** https://sandovalgis.com/
- **Online Parcel Search:** ✅ Available
- **API Available:** ⚠️ Limited
- **Data Download:** ⚠️ Request required
- **Integration Status:** 🔄 **PLANNED**
- **Notes:** Rio Rancho metro area. Growing data infrastructure.

### 5. Rio Arriba County
- **Population:** ~40,000
- **Assessor Website:** https://www.rio-arriba.org/departments/assessor.html
- **GIS Portal:** ⚠️ Limited
- **Online Parcel Search:** ⚠️ Basic
- **API Available:** ❌ None
- **Data Download:** ❌ In-person request
- **Integration Status:** ❌ **NOT AVAILABLE**
- **Notes:** Rural county. Many acequia water rights complications. Tribal lands (Ohkay Owingeh, Santa Clara, etc.)

### 6. Taos County
- **Population:** ~35,000
- **Assessor Website:** https://taoscounty.org/assessor/
- **GIS Portal:** ⚠️ Limited via RGIS
- **Online Parcel Search:** ⚠️ Basic
- **API Available:** ❌ None
- **Data Download:** ❌ In-person request
- **Integration Status:** ❌ **NOT AVAILABLE**
- **Notes:** Tourism/resort area. Many historic properties. Taos Pueblo considerations.

---

## All 33 NM Counties

| County | Population | Online Search | GIS Portal | API | Integration |
|--------|------------|---------------|------------|-----|-------------|
| Bernalillo | 680,000 | ✅ | ✅ | ✅ | ✅ Active |
| Catron | 3,500 | ❌ | ❌ | ❌ | ❌ |
| Chaves | 65,000 | ✅ | ⚠️ | ❌ | 🔄 Planned |
| Cibola | 27,000 | ⚠️ | ❌ | ❌ | ❌ |
| Colfax | 12,000 | ⚠️ | ❌ | ❌ | ❌ |
| Curry | 50,000 | ✅ | ⚠️ | ❌ | 🔄 Planned |
| De Baca | 1,800 | ❌ | ❌ | ❌ | ❌ |
| Doña Ana | 220,000 | ✅ | ✅ | ✅ | 🔄 Partial |
| Eddy | 60,000 | ✅ | ✅ | ⚠️ | 🔄 Planned |
| Grant | 27,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Guadalupe | 4,300 | ❌ | ❌ | ❌ | ❌ |
| Harding | 650 | ❌ | ❌ | ❌ | ❌ |
| Hidalgo | 4,200 | ❌ | ❌ | ❌ | ❌ |
| Lea | 75,000 | ✅ | ✅ | ⚠️ | 🔄 Planned |
| Lincoln | 20,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Los Alamos | 19,000 | ✅ | ✅ | ⚠️ | 🔄 Planned |
| Luna | 24,000 | ⚠️ | ❌ | ❌ | ❌ |
| McKinley | 72,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Mora | 4,500 | ❌ | ❌ | ❌ | ❌ |
| Otero | 67,000 | ✅ | ⚠️ | ❌ | 🔄 Planned |
| Quay | 8,000 | ❌ | ❌ | ❌ | ❌ |
| Rio Arriba | 40,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Roosevelt | 19,000 | ⚠️ | ❌ | ❌ | ❌ |
| San Juan | 125,000 | ✅ | ✅ | ⚠️ | 🔄 Planned |
| San Miguel | 28,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Sandoval | 150,000 | ✅ | ✅ | ⚠️ | 🔄 Planned |
| Santa Fe | 155,000 | ✅ | ✅ | ✅ | 🔄 Partial |
| Sierra | 11,000 | ❌ | ❌ | ❌ | ❌ |
| Socorro | 16,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Taos | 35,000 | ⚠️ | ⚠️ | ❌ | ❌ |
| Torrance | 16,000 | ⚠️ | ❌ | ❌ | ❌ |
| Union | 4,000 | ❌ | ❌ | ❌ | ❌ |
| Valencia | 77,000 | ✅ | ⚠️ | ❌ | 🔄 Planned |

**Legend:**
- ✅ = Available/Integrated
- ⚠️ = Limited/Basic
- ❌ = Not Available
- 🔄 = In Progress/Planned

---

## Statewide Resources

### NM RGIS (Resource Geographic Information System)
- **URL:** https://rgis.unm.edu/
- **Description:** UNM-hosted statewide GIS data clearinghouse
- **Parcel Data:** ✅ Available for many counties (varies by county participation)
- **API:** ✅ ArcGIS REST services
- **Integration Status:** ✅ Used as fallback for non-integrated counties

### NM Taxation & Revenue
- **URL:** https://www.tax.newmexico.gov/
- **Description:** Statewide property tax records
- **Direct Parcel Data:** ❌ Not available (aggregated only)

### BLM PLSS (Public Land Survey System)
- **URL:** https://navigator.blm.gov/
- **Description:** Legal descriptions, township/range/section
- **API:** ✅ Integrated via geocoding.ts
- **Integration Status:** ✅ Active - provides legal descriptions statewide

---

## Integration Technical Notes

### Current Architecture
```
property-lookup (Supabase Edge Function)
├── Geocode address → get lat/lng
├── Determine county from coordinates
├── Query county-specific endpoint:
│   ├── Bernalillo: BCPA ArcGIS REST
│   ├── Santa Fe: SF County ArcGIS
│   ├── Doña Ana: DAC ArcGIS
│   └── Fallback: RGIS statewide layer
└── Return normalized property data
```

### Data Normalization
All county data is normalized to this structure:
```typescript
interface PropertyData {
  owner: string;
  ownerAddress: string;
  siteAddress: string;
  legalDescription: string;
  parcelId: string;
  acreage: number;
  landValue: number;
  improvementValue: number;
  totalValue: number;
  taxableValue: number;
  propertyClass: string;
  taxYear: string;
  county: string;
  source: string;
  parcelGeometry?: GeoJSON;
}
```

---

## Roadmap

### Phase 1 (Current)
- ✅ Bernalillo County full integration
- 🔄 Santa Fe County GIS integration
- 🔄 Doña Ana County GIS integration

### Phase 2 (Q2 2025)
- Sandoval County integration
- Valencia County integration
- San Juan County integration
- Lea County integration (oil & gas focus)

### Phase 3 (Q3 2025)
- Remaining Tier 2 counties
- RGIS fallback improvements

### Phase 4 (Q4 2025)
- Statewide coverage via RGIS
- Manual lookup queue for Tier 4 counties

---

## Contact Information for Manual Lookups

For counties without online access, RGDD staff can request data directly:

| County | Phone | Email | Hours |
|--------|-------|-------|-------|
| Catron | (575) 533-6423 | assessor@catroncounty.net | M-F 8-5 |
| De Baca | (575) 355-2601 | — | M-F 8-5 |
| Guadalupe | (575) 472-3791 | — | M-F 8-5 |
| Harding | (575) 673-2922 | — | M-Th 8-5 |
| Hidalgo | (575) 542-9213 | — | M-F 8-5 |
| Mora | (575) 387-2448 | — | M-F 8-5 |
| Quay | (575) 461-2112 | — | M-F 8-5 |
| Sierra | (575) 894-6215 | — | M-F 8-5 |
| Union | (575) 374-9491 | — | M-F 8-5 |

---

## Notes & Caveats

1. **Tribal Lands:** Federal trust lands (reservations, pueblos) are NOT in county assessor records. These require BIA or tribal government contacts.

2. **State Lands:** NM State Land Office properties may have limited assessor data. Check SLO records separately.

3. **Data Currency:** County assessor data updates vary from real-time to annual. Always check "last updated" timestamps.

4. **Acequia Rights:** Water rights (especially acequia) are NOT in assessor records. Requires OSE WATERS database lookup.

5. **Split Estates:** Mineral rights may be severed from surface rights. Assessor data typically reflects surface only.
