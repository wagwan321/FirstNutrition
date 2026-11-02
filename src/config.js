// ---------------------------------------------------------------------------
// Shop configuration — one block per country. EDIT THIS FILE to change
// WhatsApp numbers, delivery areas, branches or the Lebanon price conversion.
// ---------------------------------------------------------------------------
// `whatsapp` must be FULL INTERNATIONAL FORMAT, digits only (no "+", no "00",
// no spaces), e.g. Jordan +962 79 123 4567 -> '962791234567'.
// ---------------------------------------------------------------------------

export const SHOP = {
  name: 'First Nutrition',
  email: 'info@firstnutrition.com',
  instagram: 'https://www.instagram.com/firstnutritionlebanon/',
  facebook: 'https://www.facebook.com/firstnutritionlebanon/',
  certifications: ['ISO 9001', 'ISO 22000', 'ISO 45001'],
}

export const COUNTRIES = {
  jo: {
    code: 'jo',
    name: 'Jordan',
    currency: 'JOD',
    // Catalog prices are the store's real Jordan prices (JOD).
    rate: 1,
    // TODO(owner): replace with the Jordan WhatsApp business number.
    whatsapp: '96566858980',
    whatsappDisplay: '+965 66858980',
    phone: '+962 6 5678232',
    hq: 'Amman – Al Abdali, Al Fareed Complex · P.O. Box 927807, Amman 11190',
    areas: ['Amman', 'Zarqa', 'Irbid', 'Aqaba', 'Salt', 'Madaba', 'Jerash', 'Mafraq', 'Karak', 'Other'],
    // `hours: null` hides the opening-hours line until the owners provide it.
    branches: [
      { city: 'Abdali, Amman', address: 'Al Fareed Complex, Al Abdali — head office', phone: '+962 6 5678232', hours: null, confirmed: true },
      // TODO(owner): confirm the exact address, phone and hours of these branches.
      { city: 'Sweifieh, Amman', address: 'Sweifieh, Amman', phone: '+962 6 5678232', hours: null, confirmed: false },
      { city: 'Rabieh, Amman', address: 'Rabieh, Amman', phone: '+962 6 5678232', hours: null, confirmed: false },
    ],
  },
  lb: {
    code: 'lb',
    name: 'Lebanon',
    currency: 'USD',
    // TODO(owner): Lebanon prices are ESTIMATED from Jordan prices (JOD × rate,
    // rounded). Replace `rate` or add real USD prices to the catalog.
    rate: 1.41,
    // TODO(owner): replace with the Lebanon WhatsApp business number.
    whatsapp: '96566858980',
    whatsappDisplay: '+965 66858980',
    phone: '+961 1 745 136',
    hq: 'Hamra · Achrafieh · Saida · Tripoli',
    areas: ['Beirut', 'Mount Lebanon', 'Saida', 'Tripoli', 'Zahle', 'Jounieh', 'Tyre', 'Byblos', 'Other'],
    branches: [
      { city: 'Hamra, Beirut', address: 'Sidani St., facing Socrat Restaurant', phone: '+961 1 745 136', hours: 'Mon–Sat · 9:00 – 20:00', confirmed: false },
      { city: 'Achrafieh, Beirut', address: 'Adeeb Ishac St., next to Byblos Bank', phone: '+961 1 334 224', hours: 'Mon–Sat · 9:00 – 20:00', confirmed: false },
      { city: 'Saida', address: 'Eastern Road Highway Main St., facing Saida Mall', phone: '+961 7 733 888', hours: 'Mon–Sat · 9:00 – 20:00', confirmed: false },
      { city: 'Tripoli', address: 'Next to Al Nini Hospital, facing Audi Company', phone: '+961 6 447 575', hours: 'Mon–Sat · 9:00 – 20:00', confirmed: false },
    ],
  },
}

export const DEFAULT_COUNTRY = 'jo'
