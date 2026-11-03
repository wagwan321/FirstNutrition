// Everyday foods for the calorie tracker, with values per 100 g (kcal, protein,
// carbs, fat) from standard nutrition tables, rounded. Regional dishes use
// typical restaurant / home portions, so they are estimates. `g` is the usual
// portion in grams and `portion` names it; `units` maps other measures to grams.
// Names after the first are aliases the text parser understands.

const F = (id, en, ar, kcal, p, c, f, g, portion, portionAr, units = {}) => ({
  id, en: en.split('|'), ar: ar.split('|'), per100: { kcal, p, c, f }, g, portion, portionAr, units,
})

export const FOODS = [
  // ---- protein ----
  F('egg', 'egg|eggs|boiled egg|fried egg', 'بيض|بيضة|بيضات|بيضه|بيض مسلوق|بيض مقلي', 143, 12.6, 0.7, 9.5, 50, '1 egg', 'بيضة'),
  F('omelette', 'omelette|omelet', 'عجة|اومليت|أومليت', 158, 10.8, 0.8, 12.5, 120, '2-egg omelette', 'عجة بيضتين'),
  F('chicken', 'chicken breast|chicken|grilled chicken|chicken fillet', 'صدر دجاج|دجاج|جاج|فراخ|دجاج مشوي', 165, 31, 0, 3.6, 150, '150 g', '150 غ', { plate: 200 }),
  F('chicken-thigh', 'chicken thigh|thigh', 'فخذ دجاج|ورك دجاج', 209, 26, 0, 10.9, 150, '150 g', '150 غ'),
  F('steak', 'steak|beef|beef steak', 'ستيك|لحم بقري|لحمة|لحم', 250, 26, 0, 15, 150, '150 g', '150 غ'),
  F('kofta', 'kofta|kafta|kebab|minced beef|ground beef', 'كفتة|كفته|كباب|لحمة مفرومة', 254, 25, 2, 16, 100, '1 skewer', 'سيخ'),
  F('lamb', 'lamb|mutton', 'خروف|لحم غنم|غنم', 294, 25, 0, 21, 150, '150 g', '150 غ'),
  F('tawook', 'shish tawook|tawook', 'شيش طاووق|طاووق|شيش', 160, 26, 3, 5, 150, '1 skewer', 'سيخ'),
  F('tuna', 'tuna|tuna can|canned tuna', 'تونة|تونا', 116, 26, 0, 1, 120, '1 can', 'علبة', { can: 120 }),
  F('salmon', 'salmon', 'سلمون|سالمون', 206, 22, 0, 12, 150, '150 g', '150 غ'),
  F('fish', 'fish|white fish|hammour', 'سمك|هامور', 128, 26, 0, 2.7, 150, '150 g', '150 غ'),
  F('shrimp', 'shrimp|prawns', 'جمبري|روبيان|قريدس', 99, 24, 0.2, 0.3, 100, '100 g', '100 غ'),
  F('turkey', 'turkey|turkey slices', 'حبش|تيركي|ديك رومي', 104, 17, 4, 2, 50, '3 slices', '3 شرائح', { slice: 17 }),
  F('halloumi', 'halloumi', 'حلوم|حلومي', 321, 22, 2.2, 25, 30, '1 slice', 'شريحة', { slice: 30 }),
  F('akkawi', 'akkawi|akkawi cheese|white cheese|feta|cheese', 'عكاوي|جبنة عكاوي|جبنة بيضاء|فيتا|جبنة|جبنه', 270, 18, 3, 21, 30, '1 slice', 'شريحة', { slice: 30 }),
  F('labneh', 'labneh|labne|labna', 'لبنة|لبنه', 160, 8, 5, 12, 40, '2 tbsp', 'ملعقتان', { tbsp: 20 }),
  F('cottage', 'cottage cheese', 'جبنة قريش|كوتج|جبنة كوتج', 98, 11, 3.4, 4.3, 200, '1 cup', 'كوب', { cup: 210 }),
  F('greek-yogurt', 'greek yogurt|greek yoghurt|skyr', 'لبن يوناني|زبادي يوناني', 73, 10, 3.9, 1.9, 200, '1 tub', 'علبة', { cup: 245 }),
  F('yogurt', 'yogurt|yoghurt|laban', 'لبن|زبادي|رايب', 61, 3.5, 4.7, 3.3, 245, '1 cup', 'كوب', { cup: 245 }),
  F('milk', 'milk|whole milk', 'حليب|حليب كامل', 61, 3.2, 4.8, 3.3, 250, '1 glass', 'كوب', { cup: 250, glass: 250 }),
  F('milk-skim', 'skim milk|low fat milk|light milk', 'حليب خالي الدسم|حليب لايت', 34, 3.4, 5, 0.1, 250, '1 glass', 'كوب', { cup: 250, glass: 250 }),
  F('whey', 'whey|protein shake|protein|shake|scoop|gold standard|nitro tech|iso 100|isolate', 'واي|بروتين|شيك بروتين|سكوب|مغرفة بروتين', 400, 80, 10, 5, 30, '1 scoop', 'مغرفة', { scoop: 30 }),
  F('gainer', 'mass gainer|gainer|serious mass', 'جينر|ماس جينر', 380, 15, 75, 2, 167, '1 serving', 'حصة', { scoop: 84 }),
  F('protein-bar', 'protein bar', 'بروتين بار|لوح بروتين', 367, 33, 37, 12, 60, '1 bar', 'لوح'),

  // ---- carbs ----
  F('rice', 'rice|white rice|cooked rice', 'رز|ارز|أرز|رز ابيض', 130, 2.7, 28, 0.3, 158, '1 cup', 'كوب', { cup: 158, plate: 300, bowl: 200 }),
  F('brown-rice', 'brown rice', 'رز بني|ارز بني', 123, 2.7, 25.6, 1, 158, '1 cup', 'كوب', { cup: 158, plate: 300 }),
  F('pasta', 'pasta|spaghetti|macaroni|noodles', 'معكرونة|معكرونه|مكرونة|باستا|سباغيتي', 158, 5.8, 31, 0.9, 140, '1 cup', 'كوب', { cup: 140, plate: 280, bowl: 200 }),
  F('pita', 'pita|arabic bread|khubz|bread|loaf|pita bread', 'خبز|خبز عربي|كماج|رغيف|خبزة', 275, 9, 56, 1.2, 60, '1 loaf', 'رغيف', { loaf: 60 }),
  F('toast', 'toast|white bread|slice of bread|sandwich bread', 'توست|خبز توست|خبز ابيض', 265, 9, 49, 3.2, 28, '1 slice', 'شريحة', { slice: 28 }),
  F('brown-bread', 'brown bread|whole wheat bread|whole grain bread', 'خبز اسمر|خبز أسمر|خبز قمح كامل|خبز نخالة', 247, 13, 41, 3.4, 32, '1 slice', 'شريحة', { slice: 32 }),
  F('oats', 'oats|oatmeal|porridge', 'شوفان|شوفان مطبوخ', 389, 16.9, 66, 6.9, 40, '½ cup dry', 'نصف كوب', { cup: 80 }),
  F('potato', 'potato|boiled potato|baked potato|potatoes', 'بطاطا|بطاطس|بطاطا مسلوقة', 87, 1.9, 20, 0.1, 170, '1 medium', 'حبة متوسطة'),
  F('sweet-potato', 'sweet potato', 'بطاطا حلوة|بطاطا حلوه', 90, 2, 21, 0.2, 150, '1 medium', 'حبة متوسطة'),
  F('fries', 'fries|french fries|chips', 'بطاطا مقلية|بطاطس مقلية|فرنش فرايز', 312, 3.4, 41, 15, 117, '1 medium', 'حصة وسط'),
  F('cornflakes', 'cornflakes|cereal|corn flakes', 'كورن فليكس|حبوب افطار', 357, 7.5, 84, 0.4, 30, '1 bowl', 'زبدية'),
  F('granola', 'granola|muesli', 'جرانولا|غرانولا|موسلي', 471, 10, 64, 20, 50, '½ cup', 'نصف كوب'),
  F('bulgur', 'bulgur|burghul', 'برغل', 83, 3.1, 18.6, 0.2, 182, '1 cup', 'كوب', { cup: 182 }),
  F('couscous', 'couscous', 'كسكس|كسكسي', 112, 3.8, 23, 0.2, 157, '1 cup', 'كوب', { cup: 157 }),

  // ---- fruit & veg ----
  F('banana', 'banana|bananas', 'موز|موزة|موزه', 89, 1.1, 23, 0.3, 118, '1 banana', 'موزة'),
  F('apple', 'apple|apples', 'تفاح|تفاحة|تفاحه', 52, 0.3, 14, 0.2, 182, '1 apple', 'تفاحة'),
  F('orange', 'orange|oranges', 'برتقال|برتقالة|برتقاله', 47, 0.9, 12, 0.1, 130, '1 orange', 'برتقالة'),
  F('dates', 'date|dates', 'تمر|تمرة|تمرات|تمور', 277, 1.8, 75, 0.2, 20, '1 date', 'تمرة'),
  F('grapes', 'grapes', 'عنب', 69, 0.7, 18, 0.2, 150, '1 cup', 'كوب', { cup: 150 }),
  F('watermelon', 'watermelon', 'بطيخ|بطيخة', 30, 0.6, 7.6, 0.2, 280, '1 slice', 'شريحة', { slice: 280 }),
  F('strawberries', 'strawberries|strawberry', 'فراولة|فراوله', 32, 0.7, 7.7, 0.3, 150, '1 cup', 'كوب', { cup: 150 }),
  F('salad', 'salad|green salad|vegetables|veggies', 'سلطة|سلطه|خضار|سلطة خضراء', 20, 1.5, 3.5, 0.2, 150, '1 bowl', 'زبدية', { bowl: 150, plate: 200 }),
  F('cucumber', 'cucumber|cucumbers', 'خيار|خيارة', 15, 0.7, 3.6, 0.1, 200, '1 cucumber', 'خيارة'),
  F('tomato', 'tomato|tomatoes', 'بندورة|طماطم|بندوره', 18, 0.9, 3.9, 0.2, 120, '1 tomato', 'حبة'),
  F('avocado', 'avocado', 'افوكادو|أفوكادو', 160, 2, 8.5, 14.7, 100, '½ avocado', 'نصف حبة'),

  // ---- fats & nuts ----
  F('olive-oil', 'olive oil|oil', 'زيت زيتون|زيت', 884, 0, 0, 100, 14, '1 tbsp', 'ملعقة', { tbsp: 14, tsp: 5 }),
  F('butter', 'butter', 'زبدة|زبده', 717, 0.9, 0.1, 81, 14, '1 tbsp', 'ملعقة', { tbsp: 14, tsp: 5 }),
  F('peanut-butter', 'peanut butter', 'زبدة فول سوداني|زبدة الفول السوداني', 588, 25, 20, 50, 16, '1 tbsp', 'ملعقة', { tbsp: 16 }),
  F('almonds', 'almonds|almond', 'لوز', 579, 21, 22, 50, 28, '1 handful', 'حفنة', { handful: 28 }),
  F('nuts', 'nuts|mixed nuts|cashews|walnuts|pistachios', 'مكسرات|كاجو|جوز|فستق|فستق حلبي', 607, 20, 21, 54, 30, '1 handful', 'حفنة', { handful: 30 }),
  F('tahini', 'tahini|tahina', 'طحينة|طحينه|طحين', 595, 17, 21, 54, 15, '1 tbsp', 'ملعقة', { tbsp: 15 }),

  // ---- regional dishes ----
  F('hummus', 'hummus|houmous|humus', 'حمص|حمّص|صحن حمص', 166, 7.9, 14.3, 9.6, 100, '1 small plate', 'صحن صغير', { plate: 150, tbsp: 15 }),
  F('falafel', 'falafel|falafels', 'فلافل|طعمية|فلافلة', 333, 13.3, 31.8, 17.8, 17, '1 piece', 'حبة'),
  F('falafel-sandwich', 'falafel sandwich|falafel wrap', 'سندويش فلافل|ساندويش فلافل|ساندويشة فلافل', 240, 7, 33, 9, 250, '1 sandwich', 'ساندويش'),
  F('foul', 'foul|ful|ful medames|fava beans', 'فول|فول مدمس|صحن فول', 130, 7, 16, 4, 250, '1 bowl', 'صحن', { plate: 250, bowl: 250 }),
  F('shawarma-chicken', 'chicken shawarma|shawarma chicken|shawarma', 'شاورما دجاج|شاورما جاج|شاورما|شورما', 183, 11.7, 15, 8.3, 300, '1 sandwich', 'ساندويش'),
  F('shawarma-meat', 'meat shawarma|beef shawarma|shawarma meat', 'شاورما لحمة|شاورما لحم', 200, 10, 15, 11, 300, '1 sandwich', 'ساندويش'),
  F('shawarma-plate', 'shawarma plate|shawarma meal|arabic shawarma', 'صحن شاورما|وجبة شاورما|شاورما عربي', 180, 10, 15, 9, 500, '1 plate', 'صحن'),
  F('manakish', "manakish|manaeesh|zaatar manakish|man'oushe|zaatar", 'مناقيش|منقوشة|منقوشة زعتر|مناقيش زعتر|زعتر', 300, 7, 40, 12, 150, '1 piece', 'منقوشة'),
  F('manakish-cheese', 'cheese manakish|manakish cheese|cheese pie', 'منقوشة جبنة|مناقيش جبنة|فطيرة جبنة', 367, 14, 38, 18, 150, '1 piece', 'منقوشة'),
  F('mansaf', 'mansaf', 'منسف', 200, 10, 18, 10, 450, '1 plate', 'صحن'),
  F('maqluba', 'maqluba|maqloubeh|makloubeh', 'مقلوبة|مقلوبه', 163, 7, 20, 6, 400, '1 plate', 'صحن'),
  F('mujaddara', 'mujaddara|mjadra', 'مجدرة|مجدره|مجدّرة', 133, 5, 20, 3.5, 300, '1 plate', 'صحن'),
  F('kabsa', 'kabsa|mandi|biryani', 'كبسة|كبسه|مندي|برياني', 155, 9, 18, 5, 450, '1 plate', 'صحن'),
  F('tabbouleh', 'tabbouleh|tabouli', 'تبولة|تبوله', 90, 2, 10, 5, 150, '1 bowl', 'زبدية'),
  F('fattoush', 'fattoush', 'فتوش', 90, 1.7, 9, 5.5, 200, '1 bowl', 'زبدية'),
  F('warak-enab', 'grape leaves|vine leaves|warak enab|dolma', 'ورق عنب|ورق دوالي|يبرق', 133, 2.5, 17, 6, 30, '1 roll', 'حبة'),
  F('kibbeh', 'kibbeh|kubba', 'كبة|كبه', 317, 12, 25, 19, 60, '1 piece', 'حبة'),
  F('lentil-soup', 'lentil soup|soup', 'شوربة عدس|شوربه عدس|شوربة', 70, 4, 10, 1.5, 250, '1 bowl', 'زبدية', { bowl: 250 }),
  F('knafeh', 'knafeh|kunafa|kanafeh', 'كنافة|كنافه|كنافة نابلسية', 380, 7, 40, 21, 130, '1 piece', 'قطعة'),
  F('baklava', 'baklava', 'بقلاوة|بقلاوه', 428, 6.7, 37, 29, 30, '1 piece', 'قطعة'),
  F('basbousa', 'basbousa|harissa cake|namoura', 'هريسة|بسبوسة|نمورة', 350, 4.5, 55, 13, 60, '1 piece', 'قطعة'),

  // ---- fast food & snacks ----
  F('burger', 'burger|hamburger|cheeseburger|big mac|whopper', 'برغر|برجر|همبرغر|تشيز برغر', 220, 12, 18, 11, 250, '1 burger', 'برغر'),
  F('pizza', 'pizza|pizza slice', 'بيتزا|بيتزا شريحة', 266, 11, 33, 10, 107, '1 slice', 'شريحة', { slice: 107 }),
  F('fried-chicken', 'fried chicken|broasted|broast', 'دجاج مقلي|بروستد|بروست', 260, 20, 10, 15, 150, '1 piece', 'قطعة'),
  F('nuggets', 'nuggets|chicken nuggets', 'ناغتس|ناجتس', 296, 15, 18, 18, 16, '1 nugget', 'قطعة'),
  F('chocolate', 'chocolate|chocolate bar|snickers|kitkat', 'شوكولاتة|شوكولا|شوكلاته|سنيكرز|كيت كات', 535, 7.6, 59, 30, 45, '1 bar', 'لوح'),
  F('crisps', 'crisps|potato chips|chips bag', 'شيبس|بطاطا شيبس|تشيبس', 536, 7, 53, 35, 40, '1 bag', 'كيس'),
  F('cookies', 'cookies|cookie|biscuits', 'بسكويت|كوكيز|كعك', 480, 5, 65, 22, 15, '1 cookie', 'حبة'),
  F('croissant', 'croissant', 'كرواسون|كرواسان', 406, 8, 46, 21, 60, '1 croissant', 'حبة'),
  F('cake', 'cake|cake slice', 'كيك|كيكة|كاتو', 370, 4, 53, 16, 80, '1 slice', 'قطعة', { slice: 80 }),
  F('ice-cream', 'ice cream|gelato', 'بوظة|بوظه|ايس كريم|آيس كريم', 207, 3.5, 24, 11, 70, '1 scoop', 'كرة', { scoop: 70 }),
  F('donut', 'donut|doughnut', 'دونات|دونت', 452, 5, 51, 25, 60, '1 donut', 'حبة'),

  // ---- drinks ----
  F('soda', 'soda|coke|cola|pepsi|soft drink|fizzy drink|sprite', 'كولا|بيبسي|كوكا|مشروب غازي|غازية|سبرايت|ميرندا', 42, 0, 10.6, 0, 330, '1 can', 'علبة', { can: 330, glass: 250 }),
  F('juice', 'orange juice|juice|fresh juice', 'عصير|عصير برتقال|عصير طبيعي', 45, 0.7, 10.4, 0.2, 250, '1 glass', 'كوب', { glass: 250, cup: 250 }),
  F('coffee', 'coffee|black coffee|espresso|americano|arabic coffee|turkish coffee', 'قهوة|قهوه|اسبريسو|امريكانو|قهوة عربية|قهوة تركية', 2, 0.1, 0, 0, 240, '1 cup', 'فنجان', { cup: 240 }),
  F('latte', 'latte|cappuccino|flat white|nescafe', 'لاتيه|لاتي|كابتشينو|نسكافيه', 54, 3, 4.6, 3, 350, '1 cup', 'كوب', { cup: 350 }),
  F('tea', 'tea|tea with sugar', 'شاي|شاي بسكر', 8, 0, 2, 0, 240, '1 cup', 'كاسة', { cup: 240, glass: 240 }),
  F('energy-drink', 'energy drink|red bull|monster', 'مشروب طاقة|ريد بول|مونستر', 45, 0, 11, 0, 250, '1 can', 'علبة', { can: 250 }),
]

export const foodById = (id) => FOODS.find(f => f.id === id)
