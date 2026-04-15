// Demo Mode — pre-populated inspections for Flippa screenshots
// Run this in the browser console after logging in, or wire to an admin button

export const DEMO_INSPECTIONS = [
  {
    property_address: '142 Maple Grove Drive, Austin, TX 78701',
    client_name: 'Michael & Sarah Thompson',
    client_email: 'thompsonfamily@email.com',
    inspection_date: '2026-04-08',
    status: 'completed',
    propertyType: '1990s Suburban Colonial',
    rooms: [
      {
        name: 'Roofing System',
        items: [
          { name: 'Roof covering material & condition', condition: 'fair', notes: 'Asphalt shingles showing granule loss. Estimated 3–5 years of serviceable life remaining.', narrative: 'The asphalt shingle roof covering is in fair condition with moderate granule loss visible across the south-facing slope. Shingles are approaching the end of their effective service life and the inspector recommends budgeting for replacement within the next 3 to 5 years. Flashing at all penetrations appears intact with no active leaks observed at time of inspection.' },
          { name: 'Gutters & downspouts', condition: 'fair', notes: 'Debris accumulation in gutters. Minor separation at rear downspout.' },
          { name: 'Chimney cap & crown', condition: 'good', notes: '' },
          { name: 'Flashing at roof penetrations', condition: 'good', notes: '' },
          { name: 'Soffit & fascia condition', condition: 'good', notes: '' },
        ],
      },
      {
        name: 'Electrical System',
        items: [
          { name: 'Main service panel — amperage', condition: 'good', notes: '200A main panel, properly labeled.' },
          { name: 'GFCI protection — kitchen', condition: 'good', notes: '' },
          { name: 'GFCI protection — bathrooms', condition: 'good', notes: '' },
          { name: 'Smoke detector locations & function', condition: 'fair', notes: 'Smoke detector missing in upstairs hallway. Recommend installation.' },
          { name: 'Carbon monoxide detectors', condition: 'poor', notes: 'No CO detectors present. Required within 10 feet of sleeping areas.', narrative: 'The electrical system is served by a 200-amp main panel in good working order with all circuits properly labeled. GFCI protection is confirmed at kitchen and bathroom locations. However, the inspector notes the absence of carbon monoxide detectors throughout the home, which is required by current safety standards within 10 feet of all sleeping areas. Installation of CO detectors is strongly recommended prior to occupancy.' },
        ],
      },
      {
        name: 'HVAC — Heating',
        items: [
          { name: 'Furnace / boiler age & condition', condition: 'fair', notes: 'Gas furnace approximate age 14 years. Manufacturer life expectancy 15–20 years.', narrative: 'The gas forced-air furnace is estimated to be approximately 14 years of age, approaching the mid-point of its anticipated service life of 15 to 20 years. The system operated as expected at time of inspection with no unusual sounds or odors detected. The heat exchanger is not visually compromised at accessible locations. The inspector recommends annual professional servicing and budgeting for replacement within the next 5 to 7 years.' },
          { name: 'Filter condition & access', condition: 'poor', notes: '1-inch filter heavily loaded with debris. Replace immediately.' },
          { name: 'System operation — heating confirmed', condition: 'good', notes: '' },
          { name: 'Thermostat operation', condition: 'good', notes: '' },
        ],
      },
      {
        name: 'Kitchen',
        items: [
          { name: 'Cabinets — hardware & structure', condition: 'good', notes: '' },
          { name: 'Sink — supply & drain operation', condition: 'good', notes: '' },
          { name: 'Dishwasher — operation & high-loop drain', condition: 'good', notes: '' },
          { name: 'Range / cooktop — burner operation', condition: 'good', notes: '' },
          { name: 'Garbage disposal', condition: 'fair', notes: 'Disposal operational but slow — likely worn impellers.' },
          { name: 'GFCI outlets at countertop', condition: 'good', notes: '' },
        ],
      },
    ],
  },
  {
    property_address: '2847 Fixer Upper Lane, Nashville, TN 37201',
    client_name: 'Jordan & Casey Rivera',
    client_email: 'riveras@homebuyers.com',
    inspection_date: '2026-04-05',
    status: 'completed',
    propertyType: '1962 Ranch Fixer-Upper',
    rooms: [
      {
        name: 'Foundation & Crawlspace',
        items: [
          { name: 'Foundation wall material & condition', condition: 'fair', notes: 'Hairline cracks in block foundation — monitor annually.', narrative: 'The foundation consists of concrete masonry block construction with multiple hairline cracks observed along the north and west walls. The cracks are consistent with typical settlement patterns and do not exhibit signs of active movement at time of inspection. The inspector recommends annual monitoring and sealing of visible cracks to prevent moisture infiltration. A structural engineer consultation is advisable if cracks widen in subsequent years.' },
          { name: 'Evidence of water intrusion or staining', condition: 'poor', notes: 'Efflorescence and rust staining on block walls. Recommend waterproofing.' },
          { name: 'Vapor barrier condition', condition: 'poor', notes: 'Vapor barrier torn and displaced. Should be replaced.' },
          { name: 'Sump pump (if present)', condition: 'na', notes: '' },
        ],
      },
      {
        name: 'Electrical System',
        items: [
          { name: 'Main service panel — amperage', condition: 'poor', notes: 'Federal Pacific Stab-Lok panel — known fire hazard. Replacement strongly recommended.', narrative: 'The electrical service panel is a Federal Pacific Electric Stab-Lok brand, which has been documented in industry literature as having a higher-than-average rate of breaker failure to trip under overload conditions, creating a potential fire hazard. The inspector strongly recommends replacement of this panel by a licensed electrician as a priority repair. This finding should be disclosed to all parties and evaluated for insurance implications.' },
          { name: 'Aluminum branch circuit wiring', condition: 'fair', notes: 'Aluminum wiring present at 15A circuits. Requires COPALUM connections or replacement.' },
          { name: 'GFCI protection — kitchen', condition: 'poor', notes: 'No GFCI protection in kitchen. Required by current code.' },
          { name: 'GFCI protection — bathrooms', condition: 'poor', notes: 'No GFCI protection in bathroom. Required by current code.' },
        ],
      },
      {
        name: 'Plumbing System',
        items: [
          { name: 'Water supply material (copper/PEX/galvanized)', condition: 'fair', notes: 'Galvanized steel supply lines showing rust discoloration at fixtures. Replacement recommended.' },
          { name: 'Water heater age & condition', condition: 'poor', notes: 'Water heater 18 years old. At or past end of service life. Replace promptly.', narrative: 'The domestic water heater is estimated to be 18 years of age, which significantly exceeds the standard service life of 8 to 12 years for tank-style water heaters. Evidence of rust at the base of the unit and at the cold supply connection indicate advanced deterioration. The inspector recommends prompt replacement to prevent unexpected failure and potential water damage.' },
          { name: 'Evidence of active leaks', condition: 'fair', notes: 'Minor drip at kitchen supply shut-off valve. Repair needed.' },
        ],
      },
      {
        name: 'Roofing System',
        items: [
          { name: 'Roof covering material & condition', condition: 'poor', notes: 'Multiple missing shingles at ridge. Exposed decking visible. Immediate repair required.', narrative: 'The asphalt shingle roof covering is in poor condition with multiple shingles missing along the ridge line, exposing the underlying roof deck to weather. Active water infiltration is likely occurring during precipitation events. The inspector considers this an urgent repair item. A licensed roofing contractor should evaluate and repair the damaged sections immediately, with full replacement likely required given the overall deteriorated state of the roofing system.' },
          { name: 'Flashing at chimneys & walls', condition: 'poor', notes: 'Step flashing at chimney loose and pulling away.' },
          { name: 'Gutters & downspouts', condition: 'fair', notes: 'Gutters sagging and pulling from fascia at front elevation.' },
        ],
      },
    ],
  },
  {
    property_address: '918 Victorian Heights Blvd, Savannah, GA 31401',
    client_name: 'Alexandra Pemberton',
    client_email: 'alex.pemberton@gmail.com',
    inspection_date: '2026-04-02',
    status: 'completed',
    propertyType: '1905 Victorian',
    rooms: [
      {
        name: 'Exterior',
        items: [
          { name: 'Wall cladding & siding', condition: 'fair', notes: 'Original wood clapboard siding. Peeling paint at east and north elevations. Requires scraping and repainting.', narrative: 'The original wood clapboard siding characteristic of Victorian-era construction is intact but in fair condition, exhibiting peeling and flaking paint at the east and north elevations where sun exposure is reduced and moisture tends to accumulate. The underlying wood appears sound at accessible inspection points with no active rot noted. The inspector recommends a complete exterior scrape-and-repaint project using a primer appropriate for aged wood substrates to protect the siding and prevent deterioration.' },
          { name: 'Deck or porch structure', condition: 'fair', notes: 'Front porch — several floor boards soft. Verify structural framing below.' },
          { name: 'Deck railings & guards', condition: 'poor', notes: 'Porch railing loose and does not meet current 36" height requirement.' },
        ],
      },
      {
        name: 'Electrical System',
        items: [
          { name: 'Visible wiring type & condition', condition: 'poor', notes: 'Original knob-and-tube wiring in attic and basement. Not rated for modern loads or insulation contact.', narrative: 'Original knob-and-tube wiring is present in the attic and basement areas. This wiring system predates modern electrical codes and is not rated for contact with insulation, which presents a fire risk if insulation is added or has already been placed in contact with the conductors. Many insurance carriers will not insure properties with active knob-and-tube wiring. The inspector recommends a full electrical evaluation by a licensed electrician with attention to complete system replacement.' },
          { name: 'Main service panel — amperage', condition: 'fair', notes: '60A service — undersized for modern household loads. Upgrade recommended.' },
        ],
      },
      {
        name: 'HVAC — Heating',
        items: [
          { name: 'Heating system type & fuel source', condition: 'fair', notes: 'Radiator steam heat system, approximate age 35 years. Functional but aging.' },
          { name: 'HVAC — Cooling', condition: 'na', notes: 'No central cooling. Window units only.' },
          { name: 'System operation — heating confirmed', condition: 'good', notes: 'Radiators throughout heat to temperature. No air locks at time of inspection.' },
        ],
      },
      {
        name: 'Attic & Insulation',
        items: [
          { name: 'Roof framing — rafters & sheathing', condition: 'fair', notes: 'Hand-hewn rafters in original condition. No active deterioration noted.' },
          { name: 'Insulation type & depth (R-value)', condition: 'poor', notes: 'Minimal insulation present — approximately R-5 equivalent. Far below recommended R-38 for this climate.', narrative: 'The attic insulation is severely deficient, with an estimated R-value of approximately R-5 across most of the attic floor area. Current energy code for this climate zone recommends R-38 or greater. The absence of adequate insulation results in significant heating and cooling losses and contributes to elevated utility costs. The inspector recommends addition of blown-in cellulose or fiberglass insulation to achieve code-minimum levels, noting that knob-and-tube wiring concerns must be addressed prior to adding any insulation.' },
        ],
      },
    ],
  },
  {
    property_address: '4421 Modern Oaks Court, Denver, CO 80202',
    client_name: 'Tyler & Megan Hartwell',
    client_email: 'hartwells@newconstruction.com',
    inspection_date: '2026-03-28',
    status: 'completed',
    propertyType: '2022 Modern Contemporary',
    rooms: [
      {
        name: 'Roofing System',
        items: [
          { name: 'Roof covering material & condition', condition: 'good', notes: 'Architectural shingles, 2022. Like-new condition.' },
          { name: 'Flashing at roof penetrations', condition: 'good', notes: '' },
          { name: 'Gutters & downspouts', condition: 'good', notes: 'Seamless aluminum gutters with leaf guards.' },
          { name: 'Roof ventilation', condition: 'good', notes: '' },
        ],
      },
      {
        name: 'Electrical System',
        items: [
          { name: 'Main service panel — amperage', condition: 'good', notes: '200A main panel with space for expansion. EV charger circuit pre-wired.' },
          { name: 'AFCI breaker protection', condition: 'good', notes: 'AFCI protection on all bedroom and living area circuits per code.' },
          { name: 'GFCI protection — kitchen', condition: 'good', notes: '' },
          { name: 'GFCI protection — bathrooms', condition: 'good', notes: '' },
          { name: 'GFCI protection — garage & exterior', condition: 'good', notes: '' },
          { name: 'Smoke detector locations & function', condition: 'good', notes: 'Hardwired interconnected smoke detectors with battery backup.' },
          { name: 'Carbon monoxide detectors', condition: 'good', notes: 'Combination smoke/CO detectors on each level.' },
        ],
      },
      {
        name: 'Plumbing System',
        items: [
          { name: 'Water supply material (copper/PEX/galvanized)', condition: 'good', notes: 'PEX-A throughout. Properly supported and insulated.' },
          { name: 'Water heater age & condition', condition: 'good', notes: 'Tankless gas water heater, 2022. Excellent condition.' },
          { name: 'Water pressure', condition: 'good', notes: 'Water pressure 68 psi — within ideal range.' },
          { name: 'Evidence of active leaks', condition: 'good', notes: 'No evidence of leaks at time of inspection.' },
        ],
      },
      {
        name: 'HVAC — Heating',
        items: [
          { name: 'Furnace / boiler age & condition', condition: 'good', notes: 'High-efficiency gas furnace, 96% AFUE, 2022.' },
          { name: 'System operation — heating confirmed', condition: 'good', notes: '' },
          { name: 'Filter condition & access', condition: 'good', notes: 'Media filter in good condition. 6-month filter noted.' },
        ],
      },
      {
        name: 'Kitchen',
        items: [
          { name: 'Cabinets — hardware & structure', condition: 'good', notes: 'Soft-close hinges and drawers. Cabinet boxes level and secure.' },
          { name: 'Countertops — condition & seams', condition: 'good', notes: 'Quartz countertops in excellent condition.' },
          { name: 'Dishwasher — operation & high-loop drain', condition: 'good', notes: '' },
          { name: 'Range / cooktop — burner operation', condition: 'good', notes: 'Induction cooktop — all zones responsive.' },
          { name: 'GFCI outlets at countertop', condition: 'good', notes: '' },
        ],
      },
    ],
  },
  {
    property_address: '77 Harbor View Drive, Unit 4B, Seattle, WA 98101',
    client_name: 'Priya & Rajan Mehta',
    client_email: 'mehtafamily@outlook.com',
    inspection_date: '2026-03-24',
    status: 'completed',
    propertyType: 'Urban Condo / Top Floor',
    rooms: [
      {
        name: 'Exterior',
        items: [
          { name: 'Deck or porch structure', condition: 'good', notes: 'Private balcony — concrete deck in good condition.' },
          { name: 'Deck railings & guards', condition: 'good', notes: 'Glass panel railing at balcony — secure and at code height.' },
          { name: 'Wall cladding & siding', condition: 'good', notes: 'Fiber cement siding on building exterior — common area, well maintained.' },
        ],
      },
      {
        name: 'Roofing System',
        items: [
          { name: 'Roof covering material & condition', condition: 'good', notes: 'TPO membrane roof — common area. Recent HOA documentation indicates 2021 replacement.' },
          { name: 'Evidence of water leaks or staining', condition: 'fair', notes: 'Minor water stain at bedroom ceiling — possible historical leak. No active moisture detected.', narrative: 'A minor water stain is observed at the northeast corner of the master bedroom ceiling. At the time of inspection, no active moisture is detected using a moisture meter. The stain is consistent with a historical roof or flashing leak that has since been remediated. The inspector recommends monitoring this area during the next rain event and obtaining documentation from the HOA confirming any prior roof repairs at this location.' },
        ],
      },
      {
        name: 'Electrical System',
        items: [
          { name: 'Main service panel — amperage', condition: 'good', notes: '100A sub-panel for unit. Properly labeled and in good condition.' },
          { name: 'GFCI protection — kitchen', condition: 'good', notes: '' },
          { name: 'GFCI protection — bathrooms', condition: 'good', notes: '' },
          { name: 'Smoke detector locations & function', condition: 'good', notes: 'Building-integrated smoke detection system — hardwired.' },
        ],
      },
      {
        name: 'Kitchen',
        items: [
          { name: 'Cabinets — hardware & structure', condition: 'good', notes: '' },
          { name: 'Dishwasher — operation & high-loop drain', condition: 'good', notes: '' },
          { name: 'Range / cooktop — burner operation', condition: 'good', notes: '' },
          { name: 'Sink — supply & drain operation', condition: 'fair', notes: 'Slow drain at kitchen sink — likely accumulation. Snake drain.' },
        ],
      },
      {
        name: 'Primary Bathroom',
        items: [
          { name: 'Toilet — flush & fill operation', condition: 'good', notes: '' },
          { name: 'Shower — caulking & grout condition', condition: 'fair', notes: 'Grout at shower floor showing darkening. Re-grout and seal recommended.' },
          { name: 'Exhaust fan — operation & termination', condition: 'good', notes: '' },
          { name: 'GFCI outlet', condition: 'good', notes: '' },
        ],
      },
    ],
  },
]
