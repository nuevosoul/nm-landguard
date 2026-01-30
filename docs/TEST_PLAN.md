# RGDD Test Plan — Edge Case Validation

**Purpose:** Validate report accuracy across challenging NM scenarios  
**Created:** 2026-01-30 (night shift)

---

## Test Categories

### 1. Water Rights Edge Cases

| Test # | Address/Area | Expected Behavior | Notes |
|--------|--------------|-------------------|-------|
| W-01 | Rural Española Valley | OSE wells present, adjudicated water rights | Heavy acequia area |
| W-02 | Edgewood (East Mountains) | Limited groundwater, may need water hauling | Common homesteading area |
| W-03 | Moriarty area | Estancia Basin, special groundwater rules | Critical basin |
| W-04 | Albuquerque West Mesa | No surface water, deep wells only | Urban fringe |
| W-05 | Near Elephant Butte | Rio Grande adjudication area | Complex water rights |

**Sample addresses to test:**
- 123 Acequia Madre, Española NM 87532
- County Rd 42, Edgewood NM 87015
- Old US 66, Moriarty NM 87035

---

### 2. Flood Zone Edge Cases

| Test # | Area | Expected Result | FEMA Panel |
|--------|------|-----------------|------------|
| F-01 | Rio Grande bosque (Albuquerque) | Zone AE (high risk) | Active floodway |
| F-02 | Arroyo crossing (any county) | Zone A or AE | Flash flood risk |
| F-03 | Mesa top (remote) | Zone X (minimal risk) | Likely unmapped |
| F-04 | Pecos River valley | Variable zones | Check effective date |
| F-05 | Santa Fe River corridor | Zone AE | Historic flooding |

**Sample addresses:**
- 2000 Rio Grande Blvd NW, Albuquerque NM 87104
- Any address crossing an arroyo
- Mesa top address in Valencia County

---

### 3. Cultural Resources / NMCRIS

| Test # | Area | Expected Behavior | Notes |
|--------|------|-------------------|-------|
| C-01 | Downtown Santa Fe | Multiple sites, historic district | Highest density |
| C-02 | Near Pueblo land | Sites likely within buffer | Sensitive area |
| C-03 | Chaco region | Archaeological sites | UNESCO area |
| C-04 | Modern subdivision | Likely surveyed, may be clear | Good baseline |
| C-05 | Remote BLM land | Unknown — trigger caution flag | May need survey |

**Sample addresses:**
- 100 E San Francisco St, Santa Fe NM 87501
- Any address within 5 miles of a pueblo
- Remote address in San Juan County

---

### 4. EPA / Environmental Hazards

| Test # | Area | Expected Behavior | Site Type |
|--------|------|-------------------|-----------|
| E-01 | South Valley, Albuquerque | Superfund site nearby | Industrial legacy |
| E-02 | Los Alamos | DOE facilities | Federal site |
| E-03 | Near Sandia Labs | Monitoring wells, some contamination | Federal site |
| E-04 | Former mining areas (Grants) | Uranium legacy | Mining district |
| E-05 | Rural ag land | Likely clear | Baseline |

**Sample addresses:**
- 2000 2nd St SW, Albuquerque NM 87102 (South Valley)
- Any address in Los Alamos County
- Address near Grants, NM

---

### 5. Tribal Land Proximity

| Test # | Area | Expected Behavior | Notes |
|--------|------|-------------------|-------|
| T-01 | Adjacent to Isleta Pueblo | Flag proximity, may affect water/access | Southern ABQ |
| T-02 | Near Zuni Pueblo | Cultural sensitivity flag | Western NM |
| T-03 | Navajo Nation border | Checkerboard ownership possible | Northwest NM |
| T-04 | Near Santa Clara Pueblo | Acequia + tribal considerations | Northern NM |
| T-05 | Urban Albuquerque | May still be near trust land | Sandia Pueblo |

**Sample addresses:**
- Address on NM 47 south of Los Lunas
- Address in McKinley County
- Address near Ohkay Owingeh

---

### 6. Solar / Grid Edge Cases

| Test # | Area | Expected Behavior | Notes |
|--------|------|-------------------|-------|
| S-01 | Remote off-grid | High solar potential, no grid | Viable solar site |
| S-02 | North-facing slope | Reduced solar, flag terrain issue | Topography matters |
| S-03 | Urban with existing panels | May already have solar data | Good validation |
| S-04 | Forested mountain area | Tree shading, lower potential | Accuracy check |

---

### 7. Legal Description (PLSS)

| Test # | Scenario | Expected Behavior |
|--------|----------|-------------------|
| P-01 | Standard rural parcel | Returns Township/Range/Section |
| P-02 | Spanish land grant area | May have special description |
| P-03 | Urban platted lot | Lot/Block/Subdivision |
| P-04 | Irregular boundary | Should still geocode |

---

## Automated Test Suite

### Happy Path Tests
1. Standard residential address in Albuquerque → All APIs respond
2. Rural address in Rio Arriba County → OSE wells + water rights present
3. Commercial address in Santa Fe → Full report generates

### Error Handling Tests
1. Invalid address → Graceful error message
2. Address outside NM → Reject with message
3. PO Box → Reject or flag
4. Incomplete address → Autocomplete helps

### Performance Tests
1. Full report generation < 60 seconds
2. Individual API timeout handling
3. Partial failure recovery (some APIs fail, report still generates)

---

## Test Execution Checklist

### Pre-Launch (Soft Launch)

- [ ] Run 1 address from each category above
- [ ] Verify PDF generation completes
- [ ] Check data accuracy against known sources
- [ ] Confirm Stripe payment flow works
- [ ] Test on mobile device

### Post-Launch Monitoring

- [ ] Monitor error rates in Supabase logs
- [ ] Track average generation time
- [ ] Customer feedback on accuracy
- [ ] Compare against Phase 1 ESA (if customer gets both)

---

## Known Limitations (Document for Users)

1. **Water rights** — OSE data may not include pending applications or informal agreements
2. **Cultural resources** — NMCRIS is not exhaustive; some sites are confidential
3. **Tribal land** — Trust land boundaries may not be precisely mapped
4. **Flood zones** — FEMA maps may be outdated; check effective date
5. **This is not a Phase 1 ESA** — No site visit, no professional certification

---

## Sample Properties to Test First

**Easy baseline:**
```
4000 Central Ave SE, Albuquerque NM 87108
```

**Rural with water complexity:**
```
County Rd 84, Velarde NM 87582
```

**Near tribal land:**
```
NM-47, Isleta NM 87022
```

**Potential EPA issues:**
```
2000 Broadway Blvd SE, Albuquerque NM 87102
```

**Remote mesa (minimal data):**
```
County Rd B26, Mountainair NM 87036
```

---

*Run these before accepting real customer payments. Document any failures and iterate.*
