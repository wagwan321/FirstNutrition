// First Nutrition Lebanon — catalog data
// Brands & branches are from real research (firstnutrition.com).
// Prices are realistic placeholders in USD (the common pricing currency for
// supplements in Lebanon). Swap these for the store's real prices/inventory.

export const CATEGORIES = [
  { id: 'protein',    name: 'Proteins',          icon: '🥛', blurb: 'Whey, isolate, casein & mass gainers' },
  { id: 'preworkout', name: 'Pre-Workout',       icon: '⚡', blurb: 'Energy, focus & pumps' },
  { id: 'aminos',     name: 'Amino & Recovery',  icon: '🔁', blurb: 'BCAA, EAA, glutamine & creatine' },
  { id: 'burners',    name: 'Fat Burners',       icon: '🔥', blurb: 'Thermogenics & diet support' },
  { id: 'vitamins',   name: 'Vitamins',          icon: '💊', blurb: 'Multivitamins & health' },
  { id: 'bars',       name: 'Bars & Snacks',     icon: '🍫', blurb: 'Protein bars & ready-to-drink' },
]

export const BRANDS = [
  'Optimum Nutrition', 'BSN', 'MuscleTech', 'Universal Nutrition',
  'MusclePharm', 'Cellucor', 'BPI Sports', 'Scivation',
  'Quest Nutrition', 'Gaspari', 'ABB', 'Oh Yeah!',
]

export const BRANCHES = [
  { city: 'Hamra, Beirut',   address: 'Sidani St., facing Socrat Restaurant',                 phone: '+961 1 745 136' },
  { city: 'Achrafieh, Beirut', address: 'Adeeb Ishac St., next to Byblos Bank',               phone: '+961 1 334 224' },
  { city: 'Saida',           address: 'Eastern Road Highway Main St., facing Saida Mall',      phone: '+961 7 733 888' },
  { city: 'Tripoli',         address: 'Next to Al Nini Hospital, facing Audi Company',         phone: '+961 6 447 575' },
]

// helper to build product ids
let _id = 0
const p = (o) => ({ id: ++_id, rating: 5, ...o })

export const PRODUCTS = [
  p({ name: 'Gold Standard 100% Whey', brand: 'Optimum Nutrition', category: 'protein',
      price: 62, oldPrice: 72, tag: 'Best Seller', mark: 'GS',
      flavors: ['Double Rich Chocolate', 'Vanilla Ice Cream', 'Cookies & Cream', 'Strawberry'],
      desc: '24g of premium whey protein per serving to support muscle recovery and growth. The world\'s best-selling whey, trusted by athletes for over 30 years.',
      size: '2.27 kg (5 lb)', servings: 74 }),
  p({ name: 'Nitro-Tech Whey Gold', brand: 'MuscleTech', category: 'protein',
      price: 58, oldPrice: null, tag: 'New', mark: 'NT',
      flavors: ['Double Chocolate', 'French Vanilla', 'Cookies & Cream'],
      desc: 'Ultra-clean whey protein peptides & isolate delivering 24g protein and 5.5g BCAAs per scoop for lean muscle and strength.',
      size: '2.2 kg (5 lb)', servings: 70 }),
  p({ name: 'Syntha-6 Protein Matrix', brand: 'BSN', category: 'protein',
      price: 49, oldPrice: 55, tag: null, mark: 'S6',
      flavors: ['Chocolate Milkshake', 'Vanilla Ice Cream', 'Strawberry Milkshake'],
      desc: 'Sustained-release protein blend with 22g protein and a legendary taste. Perfect as a between-meal shake or dessert replacement.',
      size: '2.27 kg (5 lb)', servings: 48 }),
  p({ name: 'Serious Mass Gainer', brand: 'Optimum Nutrition', category: 'protein',
      price: 54, oldPrice: null, tag: null, mark: 'SM',
      flavors: ['Chocolate', 'Vanilla', 'Banana'],
      desc: 'High-calorie weight gainer with 1,250 calories and 50g protein per serving. Ideal for hardgainers looking to add size.',
      size: '5.44 kg (12 lb)', servings: 16 }),
  p({ name: 'C4 Original Pre-Workout', brand: 'Cellucor', category: 'preworkout',
      price: 34, oldPrice: 39, tag: 'Best Seller', mark: 'C4',
      flavors: ['Fruit Punch', 'Icy Blue Razz', 'Watermelon', 'Cherry Limeade'],
      desc: 'Explosive energy, heightened focus and skin-tearing pumps. America\'s #1 selling pre-workout with CarnoSyn beta-alanine.',
      size: '390 g', servings: 60 }),
  p({ name: 'N.O.-XPLODE Pre-Workout', brand: 'BSN', category: 'preworkout',
      price: 38, oldPrice: null, tag: null, mark: 'NO',
      flavors: ['Grape', 'Fruit Punch', 'Green Apple'],
      desc: 'Legendary pre-workout igniter formulated to deliver more energy, endurance, strength and performance.',
      size: '555 g', servings: 30 }),
  p({ name: 'Pre JYM Pre-Workout', brand: 'BPI Sports', category: 'preworkout',
      price: 42, oldPrice: 48, tag: null, mark: 'PJ',
      flavors: ['Rainbow Sherbet', 'Black Cherry', 'Pineapple Strawberry'],
      desc: 'Fully-dosed, transparent pre-workout with 13 active ingredients including citrulline malate and beta-alanine.',
      size: '500 g', servings: 20 }),
  p({ name: 'Xtend BCAA', brand: 'Scivation', category: 'aminos',
      price: 32, oldPrice: 37, tag: 'Best Seller', mark: 'XT',
      flavors: ['Blue Raspberry', 'Mango Madness', 'Watermelon Explosion', 'Lemon Lime'],
      desc: '7g of BCAAs in the clinically studied 2:1:1 ratio plus electrolytes for intra-workout hydration and recovery.',
      size: '420 g', servings: 30 }),
  p({ name: 'Micronized Creatine Powder', brand: 'Optimum Nutrition', category: 'aminos',
      price: 26, oldPrice: null, tag: null, mark: 'CR',
      flavors: ['Unflavored'],
      desc: '5g of pure micronized Creatine Monohydrate per serving to support strength, power and lean muscle mass.',
      size: '634 g', servings: 120 }),
  p({ name: 'Glutamine Powder', brand: 'MusclePharm', category: 'aminos',
      price: 24, oldPrice: 28, tag: null, mark: 'GL',
      flavors: ['Unflavored'],
      desc: '5g of L-Glutamine to support muscle recovery, reduce soreness and promote a healthy immune system.',
      size: '300 g', servings: 60 }),
  p({ name: 'Hydroxycut Hardcore Elite', brand: 'MuscleTech', category: 'burners',
      price: 36, oldPrice: 42, tag: 'Best Seller', mark: 'HX',
      flavors: ['Capsules'],
      desc: 'Advanced thermogenic with C. canephora robusta for weight loss, plus caffeine for energy and enhanced focus.',
      size: '100 capsules', servings: 50 }),
  p({ name: 'Animal Cuts Fat Burner', brand: 'Universal Nutrition', category: 'burners',
      price: 39, oldPrice: null, tag: null, mark: 'AC',
      flavors: ['Packs'],
      desc: 'The complete cutting stack — thermogenic, metabolic, diuretic and nootropic complexes in one comprehensive pack.',
      size: '42 packs', servings: 42 }),
  p({ name: 'CLA Core Series', brand: 'MusclePharm', category: 'burners',
      price: 22, oldPrice: 26, tag: null, mark: 'CL',
      flavors: ['Softgels'],
      desc: 'Conjugated Linoleic Acid from safflower oil to support a lean physique when combined with diet and exercise.',
      size: '90 softgels', servings: 45 }),
  p({ name: 'Opti-Men Multivitamin', brand: 'Optimum Nutrition', category: 'vitamins',
      price: 29, oldPrice: null, tag: null, mark: 'OM',
      flavors: ['Tablets'],
      desc: 'Complete daily multivitamin for active men with 75+ active ingredients including amino acids and phytonutrients.',
      size: '150 tablets', servings: 50 }),
  p({ name: 'Fish Oil Omega-3', brand: 'Optimum Nutrition', category: 'vitamins',
      price: 19, oldPrice: 24, tag: null, mark: 'FO',
      flavors: ['Softgels'],
      desc: 'Enteric-coated omega-3 fish oil providing EPA and DHA to support heart, joint and brain health.',
      size: '200 softgels', servings: 100 }),
  p({ name: 'ZMA Recovery Support', brand: 'Universal Nutrition', category: 'vitamins',
      price: 21, oldPrice: null, tag: null, mark: 'ZM',
      flavors: ['Capsules'],
      desc: 'Zinc, Magnesium & Vitamin B6 to support recovery, sleep quality and healthy testosterone levels.',
      size: '90 capsules', servings: 30 }),
  p({ name: 'Quest Protein Bar (Box of 12)', brand: 'Quest Nutrition', category: 'bars',
      price: 28, oldPrice: 32, tag: 'Best Seller', mark: 'QB',
      flavors: ['Chocolate Chip Cookie Dough', 'Cookies & Cream', 'Birthday Cake'],
      desc: '21g protein, 1g sugar and high fibre in a deliciously chewy bar. The clean snack that fits any macro plan.',
      size: '12 × 60 g', servings: 12 }),
  p({ name: 'Oh Yeah! ONE Bar (Box of 12)', brand: 'Oh Yeah!', category: 'bars',
      price: 27, oldPrice: null, tag: null, mark: 'OY',
      flavors: ['Chocolate Chip Cookie Dough', 'Salted Caramel', 'Brownie'],
      desc: '20g protein and just 1g sugar with an indulgent, bakery-style taste. Guilt-free snacking done right.',
      size: '12 × 60 g', servings: 12 }),
  p({ name: 'ABB Pure Pro 50 RTD (Case of 12)', brand: 'ABB', category: 'bars',
      price: 44, oldPrice: 49, tag: null, mark: 'PP',
      flavors: ['Chocolate', 'Vanilla'],
      desc: 'Ready-to-drink shake with 50g of protein per bottle. Grab-and-go nutrition for busy training days.',
      size: '12 × 500 ml', servings: 12 }),
  p({ name: 'SuperPump Aggression', brand: 'Gaspari', category: 'preworkout',
      price: 40, oldPrice: null, tag: 'New', mark: 'SP',
      flavors: ['Refreshing Orange', 'Fruit Punch', 'Blueberry Lemonade'],
      desc: 'Next-generation pre-workout engineered for relentless energy, laser focus and sustained performance.',
      size: '450 g', servings: 25 }),
]

// Assign a real product photo to each item, round-robin within its category
// so visually-similar products don't repeat side by side. Swap these files in
// public/images/products/ (same names) to change the pictures.
const CAT_IMG = {
  protein:    ['tub1', 'jar1', 'tubshaker', 'jar2'],
  preworkout: ['preworkout', 'powder', 'jar1'],
  aminos:     ['jar2', 'powder', 'tub1'],
  burners:    ['capsules', 'jar2', 'powder'],
  vitamins:   ['capsules', 'powder'],
  bars:       ['bar2', 'tubshaker'],
}
const _catSeen = {}
PRODUCTS.forEach(pr => {
  const pool = CAT_IMG[pr.category] || ['tub1']
  const i = (_catSeen[pr.category] = (_catSeen[pr.category] ?? -1) + 1)
  pr.img = `/images/products/${pool[i % pool.length]}.jpg`
})

export const money = (n) => `$${n.toFixed(2)}`
