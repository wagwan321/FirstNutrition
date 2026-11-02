// The Coach's built-in answers. A follow-up question is matched to an intent
// (English or Arabic keywords) and answered from the visitor's own plan; some
// intents change the plan (goal, training days, weight, budget, lactose).
// Anything unmatched returns { fallback: true } so the caller can ask the AI
// endpoint or hand the question to a real coach on WhatsApp.
import { PRODUCTS } from '../data/catalog.js'
import { searchProducts } from './search.js'

const norm = (s) => ` ${s.toLowerCase()
  .replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
  .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[?!.,؟،]/g, ' ').replace(/\s+/g, ' ').trim()} `

// Latin words match whole words; Arabic words match anywhere (prefixes like ال/و/ب).
const has = (q, words) => words.some(w => (/[a-z]/.test(w) ? q.includes(` ${w}`) : q.includes(norm(w).trim())))

const W = {
  switchVerb: ['switch', 'change', 'instead', 'want to', 'i want', 'make it', 'go for', 'rather', 'غير', 'حول', 'بدل', 'بدي', 'اريد', 'ابغى', 'بدّي'],
  goalLose: ['cut', 'cutting', 'lose', 'fat loss', 'lean', 'shred', 'burn', 'تنشيف', 'خساره', 'انزل', 'تخسيس', 'حرق'],
  goalGain: ['bulk', 'bulking', 'gain weight', 'gaining', 'put on weight', 'mass', 'تضخيم', 'زياده وزن', 'زيادة الوزن', 'ازيد'],
  goalMuscle: ['build muscle', 'muscle', 'tone', 'عضل', 'بناء'],
  goalPerf: ['perform', 'performance', 'endurance', 'stamina', 'athlete', 'اداء', 'تحمل', 'لياقه'],
  greet: ['hi', 'hello', 'hey', 'salam', 'yo', 'مرحبا', 'اهلا', 'السلام', 'هاي', 'هلا'],
  thanks: ['thanks', 'thank', 'thx', 'cheers', 'شكرا', 'يسلمو', 'مشكور', 'تسلم'],
  meals: ['meal', 'meals', 'food', 'eat', 'eating', 'diet', 'recipe', 'breakfast', 'lunch', 'dinner', 'اكل', 'وجبه', 'وجبات', 'طعام', 'فطور', 'غدا', 'عشا', 'دايت', 'نظام غذائي', 'اكلات'],
  timing: ['when', 'timing', 'what time', 'after', 'before', 'morning', 'night', 'bed', 'how many scoops', 'how much', 'متى', 'وقت', 'بعد', 'قبل', 'الصبح', 'النوم', 'كم سكوب', 'كم مغرفه'],
  protein: ['protein', 'whey', 'scoop', 'scoops', 'shake', 'isolate', 'بروتين', 'واي', 'سكوب', 'مغرفه', 'شيك'],
  creatine: ['creatine', 'كرياتين'],
  pre: ['pre-workout', 'preworkout', 'pre workout', 'c4', 'caffeine', 'energy', 'بري', 'قبل التمرين', 'كافيين', 'طاقه'],
  bcaa: ['bcaa', 'bcaas', 'amino', 'aminos', 'xtend', 'eaa', 'امينو', 'بي سي'],
  gainer: ['gainer', 'gainers', 'mass gainer', 'skinny', 'hard gainer', 'جينر', 'ماس', 'نحيف'],
  burner: ['burner', 'burners', 'fat burner', 'lipo', 'carnitine', 'belly', 'حارق', 'حوارق', 'كرش', 'كارنيتين'],
  calories: ['calorie', 'calories', 'kcal', 'macro', 'macros', 'why', 'tdee', 'carbs', 'fat', 'سعرات', 'سعره', 'ماكروز', 'ليش', 'لماذا', 'كربوهيدرات', 'دهون'],
  water: ['water', 'hydration', 'hydrate', 'ماء', 'مي', 'ترطيب'],
  cheaper: ['cheap', 'cheaper', 'budget', 'expensive', 'afford', 'less money', 'save', 'ارخص', 'رخيص', 'ميزانيه', 'غالي', 'توفير'],
  lactose: ['lactose', 'dairy', 'milk', 'bloat', 'bloating', 'stomach', 'لاكتوز', 'حليب', 'البان', 'انتفاخ', 'معده'],
  vegan: ['vegan', 'plant', 'vegetarian', 'نباتي'],
  safety: ['safe', 'safety', 'side effect', 'side effects', 'kidney', 'liver', 'dangerous', 'harm', 'hair', 'acne', 'pregnan', 'آمن', 'امن', 'اضرار', 'ضرر', 'اعراض', 'كلى', 'كبد', 'خطير', 'حامل', 'شعر', 'حبوب'],
  order: ['order', 'buy', 'delivery', 'deliver', 'cash', 'pay', 'payment', 'shipping', 'اطلب', 'طلب', 'شراء', 'اشتري', 'توصيل', 'دفع', 'كاش'],
  branches: ['branch', 'branches', 'store', 'shop near', 'where are you', 'address', 'location', 'open', 'hours', 'فرع', 'فروع', 'محل', 'وين', 'عنوان', 'دوام', 'موقع'],
  authentic: ['original', 'authentic', 'fake', 'genuine', 'counterfeit', 'real', 'اصلي', 'اصليه', 'تقليد', 'مقلد', 'مضروب'],
}

// Protein from everyday food, used to fill the gap the shakes leave.
const FOODS = [
  { label: '150 g chicken breast', g: 46 }, { label: '1 can of tuna', g: 28 }, { label: '200 g Greek yogurt', g: 20 },
  { label: '3 eggs', g: 19 }, { label: '200 g cooked lentils', g: 18 }, { label: '150 g lean beef', g: 39 },
  { label: 'a glass of milk', g: 8 },
]

const GOAL_LABEL = { muscle: 'building muscle', gain: 'gaining weight', lose: 'losing fat', performance: 'performance' }
const DAY_ACTIVITY = (d) => (d <= 2 ? 'light' : d <= 4 ? 'moderate' : d <= 6 ? 'hard' : 'daily')
const BUDGET_STEPS = [50, 100, 160, 9999]

const inStack = (ctx, cats) => ctx.stack.items.filter(i => cats.includes(i.product.category)).map(i => i.product.id)
const ofCategory = (cats, n = 2) => PRODUCTS.filter(p => cats.includes(p.category) && p.available).sort((a, b) => b.bestseller - a.bestseller).slice(0, n).map(p => p.id)

export function answer(question, ctx) {
  const { t, plan, a, stack, region, price, branches } = ctx
  const q = norm(question)

  // ---- plan changes ----
  const days = q.match(/ (\d)\s*(days?|times|x|ايام|يوم|مرات)/)
  if (days && (has(q, ['train', 'gym', 'workout', 'week', 'تمرن', 'تمرين', 'اسبوع', 'جيم']) || has(q, W.switchVerb))) {
    const activity = DAY_ACTIVITY(Number(days[1]))
    return { patch: { activity }, plan: true, text: t('Updated: training {d} days a week. Here are your new numbers.', { d: days[1] }) }
  }
  const kg = q.match(/ (\d{2,3})\s*(kg|kilo|kilos|كيلو|كغ)/)
  if (kg && Number(kg[1]) >= 35 && Number(kg[1]) <= 200) {
    return { patch: { weight: Number(kg[1]) }, plan: true, text: t('Updated your weight to {w} kg. New numbers:', { w: kg[1] }) }
  }
  if (has(q, W.switchVerb)) {
    const goal = has(q, W.goalLose) ? 'lose' : has(q, W.goalGain) ? 'gain' : has(q, W.goalPerf) ? 'performance' : has(q, W.goalMuscle) ? 'muscle' : null
    if (goal && goal !== a.goal) {
      return { patch: { goal }, plan: true, stack: true, text: t('Done. I switched your plan to {goal}.', { goal: t(GOAL_LABEL[goal]) }) }
    }
  }

  // ---- questions ----
  if (has(q, W.lactose)) {
    const patch = a.avoid?.includes('lactose') ? null : { avoid: [...(a.avoid || []), 'lactose'] }
    return {
      patch, stack: !!patch,
      text: t('Go for a whey isolate: it’s filtered to remove almost all the lactose, so it’s much easier on the stomach.') + (patch ? ` ${t('I swapped it into your stack.')}` : ''),
      products: patch ? null : PRODUCTS.filter(p => /isolate|iso 100/i.test(`${p.name} ${p.type}`)).slice(0, 2).map(p => p.id),
    }
  }
  if (has(q, W.vegan)) {
    const ids = PRODUCTS.filter(p => /plant|vegan/i.test(`${p.name} ${p.type}`)).slice(0, 2).map(p => p.id)
    return { text: ids.length ? t('For a plant-based protein, this is what we have:') : t('We don’t have a plant-based protein in stock right now; our team can order one for you.'), products: ids, handoff: !ids.length }
  }
  if (has(q, W.meals)) {
    const shakes = stack.scoops * 24
    let need = Math.max(0, plan.protein - shakes)
    const picks = []
    for (const f of FOODS) { if (need <= 0) break; picks.push(f); need -= f.g }
    return {
      text: t('To reach {p} g of protein a day: {s} from your shakes ({g} g), and the rest from food, for example:', {
        p: plan.protein, g: shakes, s: t(stack.scoops === 1 ? '1 scoop' : '{n} scoops', { n: stack.scoops }),
      }),
      list: picks.map(f => `${t(f.label)} ≈ ${f.g} g`),
      after: t('Spread it over 3–4 meals, and get your {c} g of carbs from rice, oats, bread, potatoes and fruit.', { c: plan.carbs }),
    }
  }
  if (has(q, W.creatine)) {
    return {
      text: t('Take 3–5 g every day, at any time; with a meal is easiest. No loading phase needed, just don’t skip days, and drink plenty of water. It’s one of the most studied supplements and is considered safe for healthy adults; if you have kidney problems, ask your doctor first.'),
      products: inStack(ctx, ['creatine']).length ? null : ofCategory(['creatine'], 1),
    }
  }
  if (has(q, W.pre)) {
    const off = a.avoid?.includes('caffeine')
    return {
      text: t('Take one scoop 20–30 minutes before training, and try half a scoop the first time. Most pre-workouts carry 150–300 mg of caffeine, so skip them within 6 hours of bedtime and don’t add coffee on top.')
        + (off ? ` ${t('You said you avoid caffeine, so I kept them out of your stack.')}` : ''),
      products: off ? null : ofCategory(['preworkout'], 2),
    }
  }
  if (has(q, W.protein) && has(q, W.timing)) {
    return {
      text: t('The daily total ({p} g) matters most. The easy routine: one scoop within two hours after training', { p: plan.protein })
        + (stack.scoops > 1 ? t(', and a second with breakfast or between meals.') : '.'),
    }
  }
  if (has(q, W.bcaa)) {
    return { text: t('BCAAs are optional when you already reach your protein. Sip one scoop in water during training: it helps with taste and hydration on long sessions.'), products: ofCategory(['aminos'], 1) }
  }
  if (has(q, W.gainer)) {
    return {
      text: t('A gainer is for when food alone can’t get you to {k} kcal. Have one serving a day between meals or after training, and split it in two if it feels heavy.', { k: plan.calories }),
      products: ofCategory(['gainers'], 2), suggest: a.goal !== 'gain' ? 'Switch my goal to gaining weight' : null,
    }
  }
  if (has(q, W.burner)) {
    return {
      text: t('The calorie deficit does the work: about {k} kcal a day, protein at {p} g, and 8–10k steps. Burners and carnitine only add a little, and stimulant burners contain caffeine.', { k: plan.calories, p: plan.protein }),
      products: ofCategory(['weight'], 2), suggest: a.goal !== 'lose' ? 'Switch my goal to fat loss' : null,
    }
  }
  if (has(q, W.safety)) {
    return { text: t('For healthy adults, protein, creatine and amino acids at label doses are considered safe. Stimulant pre-workouts and burners aren’t for everyone: skip them if you’re sensitive to caffeine, have heart or blood-pressure issues, are pregnant or under 18. When in doubt, ask your doctor.'), handoff: true }
  }
  if (has(q, W.cheaper)) {
    const lower = [...BUDGET_STEPS].reverse().find(b => b < Math.min(a.budget, stack.month))
    if (lower) return { patch: { budget: lower }, stack: true, text: t('Here’s a leaner stack that stays under {b} a month:', { b: price(lower) }) }
    const cheap = PRODUCTS.filter(p => p.category === 'protein' && p.available).sort((x, y) => x.price - y.price).slice(0, 3).map(p => p.id)
    return { text: t('Your stack is already as lean as it gets. These are our best-value proteins:'), products: cheap }
  }
  if (has(q, W.calories)) {
    const diff = plan.calories - plan.maintenance
    return {
      text: t('Your body burns about {m} kcal a day at your training level. For {goal} we set {k} kcal ({d}). That splits into {p} g protein, {c} g carbs and {f} g fat.', {
        m: plan.maintenance, k: plan.calories, goal: t(GOAL_LABEL[a.goal]), p: plan.protein, c: plan.carbs, f: plan.fat,
        d: diff > 0 ? t('{n} kcal above it', { n: diff }) : diff < 0 ? t('{n} kcal below it', { n: -diff }) : t('the same as it'),
      }),
    }
  }
  if (has(q, W.water)) return { text: t('Aim for about {w} litres a day, more on training days and in the heat, and keep it up while you take creatine.', { w: plan.water }) }
  if (has(q, W.order)) return { text: t('Add your stack to the cart and check out on WhatsApp: we confirm the order, deliver across {c}, and you pay cash on delivery.', { c: t(region.name) }), actions: ['cart', 'order'] }
  if (has(q, W.branches)) return { text: t('We have {n} branches in {c}, with trained staff in every one.', { n: branches, c: t(region.name) }), actions: ['branches'] }
  if (has(q, W.authentic)) return { text: t('Everything we sell comes straight from the brands: we’re their official distributor, and every tub arrives factory sealed.') }
  if (has(q, W.thanks)) return { text: t('Any time. Train hard, and come back before your tub runs out.') }
  if (has(q, W.greet) && q.trim().split(' ').length <= 3) return { text: t('Hey! Ask me anything about your plan, your stack or how to take it.') }
  if (has(q, W.protein)) {
    return { text: t('Aim for {p} g of protein a day. {s} cover {g} g of it; food covers the rest.', { p: plan.protein, g: stack.scoops * 24, s: t(stack.scoops === 1 ? '1 scoop' : '{n} scoops', { n: stack.scoops }) }), suggest: 'Give me meal ideas' }
  }

  // a product question ("do you have nitro tech?", "price of c4")
  const words = q.replace(/ (do|you|have|has|the|a|an|is|are|of|for|any|price|how|much|me|show|عندكم|في|سعر|كم|هل|بكم)(?= )/g, ' ').trim()
  const found = words.length > 1 ? searchProducts(PRODUCTS, words, 3) : []
  if (found.length) return { text: t('Here’s what I found:'), products: found.map(p => p.id) }

  return { fallback: true }
}

// Follow-up suggestions, given the visitor's goal.
export function suggestions(a) {
  const base = ['When should I take my protein?', 'Give me meal ideas', 'Is creatine safe?', 'Show me a cheaper stack', 'Why these calories?']
  const goalSwitch = a.goal === 'lose' ? 'Switch my goal to building muscle' : 'Switch my goal to fat loss'
  return [...base.slice(0, 3), goalSwitch, ...base.slice(3)]
}
