// ---------------------------------------------------------------------------
// Shop configuration — EDIT THIS ONE FILE to change the WhatsApp number.
// ---------------------------------------------------------------------------
// `whatsappNumber` must be in FULL INTERNATIONAL FORMAT, digits only:
//   - no leading "+", no "00", no spaces, no dashes.
//   - e.g. a Lebanese number +961 3 123 456  ->  '9613123456'
// `whatsappDisplay` is only shown to humans (fallback text), format it nicely.
// ---------------------------------------------------------------------------
export const SHOP = {
  name: 'First Nutrition',

  // TEMP: testing with a Kuwaiti number — swap for the store's real WhatsApp
  // business number before launch.
  whatsappNumber: '96566858980',     // digits only, intl format
  whatsappDisplay: '+965 66858980',  // human-readable version

  // Delivery areas offered at order time (shared by checkout + product modal).
  areas: [
    'Beirut', 'Mount Lebanon', 'Saida', 'Tripoli',
    'Zahle', 'Jounieh', 'Tyre', 'Byblos', 'Other',
  ],
}
