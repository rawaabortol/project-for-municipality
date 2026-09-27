import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export const CATEGORIES_MAP: Record<string, { en: string; ar: string }> = {
  'Food Safety': { en: 'Food Safety', ar: 'سلامة الغذاء' },
  'Suspected Food Poisoning': { en: 'Suspected Food Poisoning', ar: 'اشتباه تسمم غذائي' },
  'Water Contamination': { en: 'Water Contamination', ar: 'تلوث شبكة المياه' },
  'Unsafe Drinking Water': { en: 'Unsafe Drinking Water', ar: 'مياه شرب غير صالحة' },
  'Sewage Problem': { en: 'Sewage Problem', ar: 'طفح مياه الصرف الصحي' },
  'Garbage Accumulation': { en: 'Garbage Accumulation', ar: 'تراكم وتكدس النفايات' },
  'Air Pollution': { en: 'Air Pollution', ar: 'تلوث الهواء والانبعاثات' },
  'Mosquito Infestation': { en: 'Mosquito Infestation', ar: 'انتشار وبؤر البعوض' },
  'Rodent/Pest Problem': { en: 'Rodent/Pest Problem', ar: 'انتشار القوارض والجرذان' },
  'Suspected Disease/Outbreak': { en: 'Suspected Disease/Outbreak', ar: 'اشتباه تفشي وبائي' },
  'Environmental Hazard': { en: 'Environmental Hazard', ar: 'مخاطر بيئية وصناعية' },
  'Other': { en: 'Other', ar: 'أخرى' }
};

export const DISTRICTS_MAP: Record<string, { en: string; ar: string }> = {
  'Al-Tal': { en: 'Al-Tal', ar: 'التل' },
  'Al-Mina': { en: 'Al-Mina', ar: 'الميناء' },
  'Bab Al-Tabbaneh': { en: 'Bab Al-Tabbaneh', ar: 'باب التبانة' },
  'Jabal Mohsen': { en: 'Jabal Mohsen', ar: 'جبل محسن' },
  'Abu Samra': { en: 'Abu Samra', ar: 'أبي سمراء' },
  'Al-Qobbeh': { en: 'Al-Qobbeh', ar: 'القبة' },
  'Dam w Farez': { en: 'Dam w Farez', ar: 'ضم وفرز' },
  'Beddawi': { en: 'Beddawi', ar: 'البداوي' },
  'Zahrieh': { en: 'Zahrieh', ar: 'الزاهرية' },
  'Maarad': { en: 'Maarad', ar: 'المعرض' },
  'Mina Port': { en: 'Mina Port', ar: 'مرفأ الميناء' },
  'Haddadine': { en: 'Haddadine', ar: 'الحدادين' },
  'Swayqa': { en: 'Swayqa', ar: 'السويقة' },
  'Azmi Street': { en: 'Azmi Street', ar: 'شارع عزمي' },
  'Bab Al-Ramel': { en: 'Bab Al-Ramel', ar: 'باب الرمل' },
  'Tripoli': { en: 'Tripoli', ar: 'طرابلس' },
  'City-Wide Tripoli': { en: 'City-Wide Tripoli', ar: 'كافة مناطق طرابلس' }
};

export const STATUS_MAP: Record<string, { en: string; ar: string }> = {
  'SUBMITTED': { en: 'Submitted', ar: 'تم التقديم' },
  'UNDER_REVIEW': { en: 'Under Review', ar: 'قيد التدقيق' },
  'VERIFIED': { en: 'Verified', ar: 'تم التحقق' },
  'IN_INVESTIGATION': { en: 'In Investigation', ar: 'قيد التحقيق الميداني' },
  'RESOLVED': { en: 'Resolved', ar: 'تمت المعالجة' },
  'CLOSED': { en: 'Closed', ar: 'مغلق نهائياً' },
  'REJECTED': { en: 'Rejected', ar: 'مرفوض' }
};

export const RISK_MAP: Record<string, { en: string; ar: string }> = {
  'CRITICAL': { en: 'CRITICAL', ar: 'حرج جداً' },
  'HIGH': { en: 'HIGH', ar: 'مرتفع' },
  'MEDIUM': { en: 'MEDIUM', ar: 'متوسط' },
  'LOW': { en: 'LOW', ar: 'منخفض' }
};

export const SEVERITY_MAP: Record<string, { en: string; ar: string }> = {
  'CRITICAL': { en: 'Critical Hazard', ar: 'خطر حرج وداهم' },
  'HIGH': { en: 'High Severity', ar: 'خطورة مرتفعة' },
  'MEDIUM': { en: 'Moderate', ar: 'متوسط الخطورة' },
  'LOW': { en: 'Low Concern', ar: 'محدود الخطورة' }
};

export const TITLES_DICTIONARY: Record<string, { en: string; ar: string }> = {
  'Brown contaminated tap water with foul petroleum smell': {
    en: 'Brown contaminated tap water with foul petroleum smell',
    ar: 'مياه صنبور ملوثة بنية اللون برائحة كيميائية ونفطية'
  },
  'Gallon refill kiosk dispensing cloudy, bacterially suspected water': {
    en: 'Gallon refill kiosk dispensing cloudy, bacterially suspected water',
    ar: 'كشك تعبئة غالونات يوزع مياهاً عكرة مشتبه بتلوثها بكتيرياً'
  },
  'Underground municipal water pipe breached by adjacent sewage line': {
    en: 'Underground municipal water pipe breached by adjacent sewage line',
    ar: 'تداخل خط مياه الشرب الرئيسي مع مجرور صرف صحي مجاور'
  },
  'Cluster of 7 pediatric jaundice & hepatitis A cases in Syria Street': {
    en: 'Cluster of 7 pediatric jaundice & hepatitis A cases in Syria Street',
    ar: 'تفشي 7 حالات يرقان والتهاب كبد وبائي (أ) بين الأطفال في شارع سوريا'
  },
  'Sewage collector overflowing into vegetable souk near Abu Ali bridge': {
    en: 'Sewage collector overflowing into vegetable souk near Abu Ali bridge',
    ar: 'طفح مياه الصرف الصحي في سوق الخضار بالقرب من جسر أبو علي'
  },
  'Multiple patrons poisoned after eating shawarma at central fast-food shop': {
    en: 'Multiple patrons poisoned after eating shawarma at central fast-food shop',
    ar: 'تسمم جماعي لعدة رواد بعد تناول الشاورما في مطعم بساحة التل'
  },
  'Raw meat display without refrigeration during 8-hour blackout': {
    en: 'Raw meat display without refrigeration during 8-hour blackout',
    ar: 'عرض لحوم نيئة دون تبريد أثناء انقطاع الكهرباء لمدة 8 ساعات'
  },
  'Unlicensed street pastry cart with visible mold and fly swarms': {
    en: 'Unlicensed street pastry cart with visible mold and fly swarms',
    ar: 'عربة حلوى متجولة غير مرخصة تعرض منتجات تالفة ومكشوفة للذباب'
  },
  'Oily chemical slick and dead fish washed ashore near port dock': {
    en: 'Oily chemical slick and dead fish washed ashore near port dock',
    ar: 'بقعة زيوت كيميائية ونفوق كميات من الأسماك قرب رصيف الميناء'
  },
  'Direct raw sewage pipe discharging onto public Corniche rocks': {
    en: 'Direct raw sewage pipe discharging onto public Corniche rocks',
    ar: 'أنبوب صرف صحي يصب مياهاً مبتذلة مباشرة على صخور الكورنيش العام'
  },
  'Massive uncollected fish market refuse rotting in the heat': {
    en: 'Massive uncollected fish market refuse rotting in the heat',
    ar: 'تراكم مخلفات سوق السمك المتعفنة بفعل حرارة الشمس'
  },
  'Wild burning of electronic cables and garbage piles near schools': {
    en: 'Wild burning of electronic cables and garbage piles near schools',
    ar: 'حرق عشوائي لإطارات وأسلاك بلاستيكية سامة قرب المدارس'
  },
  'Heavy Norway rat infestation spreading into ground-floor apartments': {
    en: 'Heavy Norway rat infestation spreading into ground-floor apartments',
    ar: 'انتشار كثيف للجرذان والقوارض داخل الأبنية السكنية السفلية'
  },
  'Abandoned excavation pit filled with stagnant rainwater and Culex mosquitoes': {
    en: 'Abandoned excavation pit filled with stagnant rainwater and Culex mosquitoes',
    ar: 'حفرة بناء مهجورة تحولت لبؤرة مياه آسنة وتكاثر حشرات البعوض'
  },
  'Sewer backflow flooding basement bakery and grocery storage': {
    en: 'Sewer backflow flooding basement bakery and grocery storage',
    ar: 'ارتداد مياه المجاري وغمر مستودعات أفران ومواد غذائية'
  }
};

export const DESCRIPTIONS_DICTIONARY: Record<string, { en: string; ar: string }> = {
  'Residents in 4 adjacent residential buildings in Syria Street noticed turbid brown tap water with a foul chemical smell. 12 children developed acute vomiting and diarrhea.': {
    en: 'Residents in 4 adjacent residential buildings in Syria Street noticed turbid brown tap water with a foul chemical smell. 12 children developed acute vomiting and diarrhea.',
    ar: 'لاحظ سكان 4 أبنية سكنية متجاورة في شارع سوريا مياهاً بنية عكرة برائحة كيميائية كريهة تخرج من الصنابير. أصيب 12 طفلاً بقيء وإسهال حاد.'
  },
  'Neighborhood water filtration dispensary filter has ruptured; customers report abdominal cramps and nausea after drinking filtered gallons.': {
    en: 'Neighborhood water filtration dispensary filter has ruptured; customers report abdominal cramps and nausea after drinking filtered gallons.',
    ar: 'تلف في فلاتر محطة تكرير وتوزيع المياه في الحي؛ أبلغ الزبائن عن مغص معوي حاد وغثيان بعد شرب الغالونات المعبأة.'
  },
  'Visible seepage where a broken 6-inch sewage pipe leaks into an unpressurized freshwater main pipe.': {
    en: 'Visible seepage where a broken 6-inch sewage pipe leaks into an unpressurized freshwater main pipe.',
    ar: 'تسرب واضح ومباشر من خط صرف صحي مكسور قطر 6 إنش يصب في أنبوب مياه الشرب الرئيسي غير المضغوط.'
  },
  'Local clinic alerted health office regarding 7 pediatric jaundice cases clustering around Souk Al-Qameh within 72 hours.': {
    en: 'Local clinic alerted health office regarding 7 pediatric jaundice cases clustering around Souk Al-Qameh within 72 hours.',
    ar: 'أبلغ المستوصف المحلي دائرة الصحة عن 7 حالات يرقان والتهاب كبد بين أطفال سوق القمح خلال 72 ساعة.'
  },
  'Main collector blocked by solid debris, spilling black wastewater across vegetable stalls and pedestrian walkways.': {
    en: 'Main collector blocked by solid debris, spilling black wastewater across vegetable stalls and pedestrian walkways.',
    ar: 'انسداد المجرور الرئيسي بالنفايات الصلبة مما أدى لفيضان المياه السوداء فوق بسطات الخضار والممرات العامة.'
  },
  'Emergency room treated 14 customers who ate chicken shawarma between 6 PM and 10 PM. Symptoms: high fever, vomiting, dehydration.': {
    en: 'Emergency room treated 14 customers who ate chicken shawarma between 6 PM and 10 PM. Symptoms: high fever, vomiting, dehydration.',
    ar: 'استقبل قسم الطوارئ 14 مريضاً تناولوا وجبات شاورما دجاج بين 6 و 10 مساءً، مع أعراض حمى شديدة وإسهال وجفاف.'
  },
  'Butcher shop keeping unrefrigerated ground meat and poultry on outdoor counter in 32°C afternoon heat due to private generator fuel cutoff.': {
    en: 'Butcher shop keeping unrefrigerated ground meat and poultry on outdoor counter in 32°C afternoon heat due to private generator fuel cutoff.',
    ar: 'ملحمة تعرض اللحوم المفرومة والدواجن دون تبريد في حرارة 32 مئوية إثر توقف مولد الكهرباء الخاص.'
  },
  'Unlicensed mobile cart selling custard desserts and cream sweets with no cold chain, covered in flies and dust.': {
    en: 'Unlicensed mobile cart selling custard desserts and cream sweets with no cold chain, covered in flies and dust.',
    ar: 'عربة متجولة غير مرخصة تبيع حلويات بالقشطة والكريما دون تبريد ومعرضة للغبار وحشرات الذباب.'
  },
  'Dark iridescent hydrocarbon slick spreading 300 meters along fishermen basin with hundreds of dead juvenile mullet floating.': {
    en: 'Dark iridescent hydrocarbon slick spreading 300 meters along fishermen basin with hundreds of dead juvenile mullet floating.',
    ar: 'بقعة هيدروكربونية داكنة تمتد 300 متر بمحاذاة حوض الصيادين مع طفو مئات الأسماك النافقة.'
  },
  'Ruptured municipal sewer pipe pouring effluent directly onto the coastal walkway rocks, causing suffocating stench and public health risk for bathers.': {
    en: 'Ruptured municipal sewer pipe pouring effluent directly onto the coastal walkway rocks, causing suffocating stench and public health risk for bathers.',
    ar: 'كسر في قسطل مجارٍ يفرغ مياهاً مبتذلة مباشرة على صخور الكورنيش البحري مسبباً روائح خانقة وخطراً على المارة ورواد البحر.'
  },
  'Over 4 tons of fish guts, scales, and organic waste left rotting uncollected over 48 hours in the commercial fish market alley.': {
    en: 'Over 4 tons of fish guts, scales, and organic waste left rotting uncollected over 48 hours in the commercial fish market alley.',
    ar: 'أكثر من 4 أطنان من مخلفات وأحشاء الأسماك مكدسة ومتروكة للتعفن منذ 48 ساعة في زقاق سوق السمك التجاري.'
  },
  'Thick acrid black smoke blanketed the elementary school zone during school hours due to open burning of scrap insulation and vehicle tires.': {
    en: 'Thick acrid black smoke blanketed the elementary school zone during school hours due to open burning of scrap insulation and vehicle tires.',
    ar: 'سحابة دخان أسود خانق غطت محيط المدرسة الابتدائية بسبب الحرق المكشوف لإطارات السيارات والبلاستيك.'
  },
  'Dozens of large rodents observed nesting inside garbage chutes and crawling into ground floor kitchens and bakeries.': {
    en: 'Dozens of large rodents observed nesting inside garbage chutes and crawling into ground floor kitchens and bakeries.',
    ar: 'رصد عشرات القوارض والجرذان الكبيرة تعشش في مناور ومجاري المباني وتتسلل إلى مخابز ومطابخ الطوابق الأرضية.'
  },
  'Deep unfinished foundation pit holding 500 cubic meters of green stagnant rainwater with massive mosquito larvae clouds.': {
    en: 'Deep unfinished foundation pit holding 500 cubic meters of green stagnant rainwater with massive mosquito larvae clouds.',
    ar: 'حفرة أساسات بناء مهجورة تحوي أكثر من 500 متر مكعب من المياه الآسنة الراكدة مع انتشار هائل ليرقات البعوض.'
  },
  'Underground sewage backup flooded the basement flour storehouse and dough prep rooms with 20cm of septic water.': {
    en: 'Underground sewage backup flooded the basement flour storehouse and dough prep rooms with 20cm of septic water.',
    ar: 'ارتداد مياه الصرف الصحي غمر مستودع الدقيق وغرف العجين بارتفاع 20 سم من المياه الملوثة.'
  }
};

export const INVESTIGATIONS_DICTIONARY: Record<string, {
  findings?: { en: string; ar: string };
  actions?: { en: string; ar: string };
  recommendations?: { en: string; ar: string };
  samples?: { en: string; ar: string };
}> = {
  'INV-2026-0101': {
    findings: {
      en: 'Physical inspection of Syria Street main junction confirmed a ruptured municipal water delivery line running parallel to an open brick sewage canal. Chemical testing revealed free chlorine < 0.02 mg/L, fecal coliform count > 1,800 CFU/100ml. High biological pathogen load.',
      ar: 'أكد الكشف الميداني في تقاطع شارع سوريا وجود كسر في خط توزيع مياه الشرب البلدي الموازي لقناة صرف صحي قديمة. أظهرت الفحوصات أن الكلور الحر أقل من 0.02 ملغ/ل، وتجاوزت بكتيريا القولون البرازية 1800 مستعمرة/100مل مع حمولة ميكروبية عالية الخطورة.'
    },
    actions: {
      en: '1. Isolated municipal valve feeding Syria Street block 4. 2. Provided 45 families with emergency chlorinated potable water tanker trucks. 3. Mobilized Municipal Public Works excavation crew for pipe replacement.',
      ar: '1. عزل وإغلاق الصمام البلدي المغذي للمربع السكني الرابع في شارع سوريا. 2. تزويد 45 عائلة بصهاريج مياه صالحة للشرب ومعقمة بالكلور كإجراء إغاثي طارئ. 3. استنفار ورش الأشغال في بلدية طرابلس لحفر واستبدال الخط.'
    },
    recommendations: {
      en: 'Complete replacement of 200 meters of degraded cast-iron freshwater pipes with high-density polyethylene (HDPE). Issue boil-water mandate for Bab Al-Tabbaneh zone 2 until 3 consecutive negative culture tests.',
      ar: 'استبدال كامل لـ 200 متر من أنابيب الحديد المتهالكة بأنابيب البولي إيثيلين عالي الكثافة (HDPE). فرض تعميم إلزامي بغلي مياه الشرب في قطاع باب التبانة 2 لحين ظهور 3 نتائج فحص متتالية تؤكد الخلو من البكتيريا.'
    },
    samples: {
      en: 'Water Sample #TRP-W-402 (Syria St), Sewage Effluent #TRP-S-88',
      ar: 'عينة مياه رقم TRP-W-402 (شارع سوريا)، عينة مياه صرف صحي رقم TRP-S-88'
    }
  },
  'INV-2026-0102': {
    findings: {
      en: 'Inspected Al-Tal fast-food kitchen. Refrigeration temperature recorded at 14.5°C (legal maximum 4°C). Garlic sauce prepared with raw unpasteurized eggs left in ambient 28°C kitchen temperature. Salmonella enterica confirmed in leftover chicken marinade.',
      ar: 'معاينة مطبخ مطعم الوجبات السريعة في التل. سُجلت حرارة البرادات عند 14.5 مئوية (الحد الأقصى المسموح 4 مئوية). صلصة الثوم المحضرة ببيض نيء غير مبستر كانت متروكة بحرارة المطبخ (28 مئوية). تم تأكيد بكتيريا السالمونيلا في عينات نقع الدجاج.'
    },
    actions: {
      en: '1. Immediate administrative closure of restaurant premises. 2. Confiscation and destruction of 65 kg of spoiled chicken and egg batches. 3. Issued judicial summons to restaurant proprietor.',
      ar: '1. إغلاق إداري وتشميع فوري للمطعم بالشمع الأحمر. 2. مصادرة وإتلاف 65 كغ من الدجاج والبيض الفاسد تحت إشراف المراقبين. 3. تنظيم محضر ضبط قضائي بحق صاحب المؤسسة وإحالته للنيابة العامة.'
    },
    recommendations: {
      en: 'Mandatory hygiene re-certification of all kitchen food handlers. Minimum 14-day closure pending deep sanitation and laboratory clearance.',
      ar: 'إلزام جميع عمال المطبخ بإعادة دورة التدريب والتأهيل الصحي والحصول على شهادات صحية رسمية. الإغلاق لمدة لا تقل عن 14 يوماً حتى استكمال التعقيم الكامل وصدور نتائج مخبرية سلبية.'
    },
    samples: {
      en: 'Food Sample #F-771 (Garlic paste), Swab #SW-22 (Prep counter)',
      ar: 'عينة طعام رقم F-771 (صلصة ثوم)، مسحة أسطح التحضير رقم SW-22'
    }
  },
  'INV-2026-0103': {
    findings: {
      en: 'Surveillance conducted along Al-Mina port basin. Marine diesel oil sheen originated from an unlicensed commercial fishing trawler undergoing unauthorized bilge cleaning.',
      ar: 'كشف ومسح ميداني لحوض مرفأ الميناء. تبين أن بقعة المازوت والديزل البحري ناجمة عن سفينة صيد تجارية غير مرخصة قامت بتفريغ وغسل مياه قعر المحرك بشكل غير قانوني.'
    },
    actions: {
      en: 'Deployed absorbent oil booms across 150 meters of shoreline. Vessel detained in port by Maritime Police.',
      ar: 'نشر حواجز عائمة ماصة للزيوت على طول 150 متراً من الواجهة البحرية. حجز المركب في المرفأ بالتنسيق مع شرطة خفر السواحل.'
    },
    recommendations: {
      en: 'Environmental remediation fine levied on vessel owner. Daily testing of dissolved oxygen levels along fishing wharf.',
      ar: 'فرض غرامة مالية بيئية وتضمين مالك السفينة تكاليف إزالة التلوث. فحص يومي لمستوى الأكسجين المذاب بمحاذاة أرصفة الصيد.'
    },
    samples: {
      en: 'Seawater Sample #SEA-901, Hydrocarbon Index #HC-44',
      ar: 'عينة مياه بحر رقم SEA-901، مؤشر الهيدروكربونات رقم HC-44'
    }
  },
  'INV-2026-0104': {
    findings: {
      en: 'Inspected abandoned construction site in Abu Samra. Stagnant rainwater pond covering ~400 square meters. Larval sampling confirmed Culex pipiens larvae count of ~25 larvae per dip.',
      ar: 'معاينة ورشة بناء مهجورة في أبي سمراء. تجمع بركة مياه أمطار راكدة بمساحة 400 متر مربع. أكد الفحص المجهري وجود كثافة ليرقات بعوض الكيولكس بواقع 25 يرقة لكل عينة مغرفة.'
    },
    actions: {
      en: '1. Drained 80% of accumulated ponding using municipal suction truck. 2. Applied eco-friendly bacterial larvicide (Bacillus thuringiensis israelensis - BTI).',
      ar: '1. شفط 80% من المياه المتجمعة بواسطة صهاريج الشفط التابعة لبلدية طرابلس. 2. رش مبيد بكتيري بيئي متخصص لمكافحة اليرقات (BTI) دون الإضرار بالبيئة.'
    },
    recommendations: {
      en: 'Site owner mandated to backfill excavation with clean earth within 10 days.',
      ar: 'إلزام مالك العقار بردم الحفرة بالتراب النظيف خلال مهلة أقصاها 10 أيام تحت طائلة الملاحقة البلدية.'
    },
    samples: {
      en: 'Larval Dipper Sample #L-19',
      ar: 'عينة مغرفة يرقات رقم L-19'
    }
  }
};

export const ALERTS_DICTIONARY: Record<string, {
  title: { en: string; ar: string };
  desc: { en: string; ar: string };
}> = {
  'ALT-CRIT-2026-001': {
    title: {
      en: 'CRITICAL WATER CONTAMINATION BREACH - BAB AL-TABBANEH',
      ar: 'تنبيه طارئ: تلوث خطير في شبكة مياه الشرب - باب التبانة'
    },
    desc: {
      en: 'Sewerage line infiltration into primary municipal drinking main detected along Syria Street. Risk score calculated at 94/100 with multiple pediatric hospitalizations. Immediate valve cutoff and boil-water mandate issued.',
      ar: 'تم رصد تسرب مباشر لمياه الصرف الصحي إلى خط مياه الشرب الرئيسي على طول شارع سوريا. درجة الخطورة بلغت 94/100 مع إدخال عدة أطفال للمستشفى. تم إغلاق الصمامات وإصدار توجيه إلزامي بغلي المياه.'
    }
  },
  'ALT-CLS-2026-002': {
    title: {
      en: 'POTENTIAL PUBLIC HEALTH CLUSTER DETECTED: WATERBORNE ILLNESS',
      ar: 'رصد بؤرة وبائية محتملة: أمراض منقولة بالمياه'
    },
    desc: {
      en: 'Automated cluster engine detected 5 correlated incidents within an 850m radius over the last 48 hours in Bab Al-Tabbaneh. Total estimated affected population: 138.',
      ar: 'رصدت خوارزمية الترصد 5 بلاغات متقاربة ومتزامنة ضمن دائرة قطرها 850م خلال آخر 48 ساعة في باب التبانة. إجمالي عدد المتضررين التقديري: 138 مواطناً.'
    }
  },
  'ALT-FOOD-2026-003': {
    title: {
      en: 'ACUTE FOOD POISONING OUTBREAK - AL-TAL COMMERCIAL DISTRICT',
      ar: 'تفشي تسمم غذائي حاد - منطقة التل التجارية'
    },
    desc: {
      en: '22 patrons hospitalized with severe salmonellosis symptoms following meals at Clock Tower Square. Restaurant ordered shut pending microbial confirmation.',
      ar: 'نقل 22 مواطناً للمستشفيات بأعراض حادة للسالمونيلا إثر تناول وجبات في ساحة برج الساعة. صدر قرار فوري بإغلاق المطعم وتشميعه لحين صدور النتائج المخبرية.'
    }
  },
  'ALT-ENV-2026-004': {
    title: {
      en: 'UNREGULATED WASTE INCINERATION TOXIC SPIKE - BEDDAWI',
      ar: 'ارتفاع انبعاثات سامة جراء حرق عشوائي للنفايات - البداوي'
    },
    desc: {
      en: 'Multiple simultaneous reports of toxic wire and plastic burning causing respiratory distress at Beddawi schools. Civil Defense and Environmental Police notified.',
      ar: 'تلقي عدة بلاغات متزامنة عن حرق أسلاك وبلاستيك سام تسبب في حالات ضيق تنفس بمدارس البداوي. تم إخطار الدفاع المدني والشرطة البيئية للتدخل.'
    }
  },
  'ALT-TIME-2026-005': {
    title: {
      en: 'UNRESOLVED STAGNANT REPORTS ALERT (> 6 DAYS)',
      ar: 'إنذار تأخر معالجة البلاغات المعلقة (> 6 أيام)'
    },
    desc: {
      en: 'System audit identified 7 unassigned reports in Zahrieh and Qobbeh exceeding municipal 5-day triage SLA.',
      ar: 'أظهر التدقيق الآلي وجود 7 بلاغات غير مكلفة بمفتشين في الزاهرية والقبة تجاوزت الحد الأقصى المحدد في معايير الاستجابة البلدية (5 أيام).'
    }
  }
};

export const CLUSTERS_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  'Water Contamination & Waterborne Illness': { en: 'Water Contamination & Waterborne Illness', ar: 'تلوث المياه والأمراض المنقولة مائياً' },
  'Food Safety & Gastrointestinal Intoxication': { en: 'Food Safety & Gastrointestinal Intoxication', ar: 'سلامة الغذاء والتسمم المعوي' },
  'Marine & Waterfront Environmental Hazard': { en: 'Marine & Waterfront Environmental Hazard', ar: 'المخاطر البيئية البحرية والساحلية' }
};

export const AUDIT_ACTIONS_DICTIONARY: Record<string, { en: string; ar: string }> = {
  'START_INVESTIGATION': { en: 'Start Investigation', ar: 'بدء تحقيق ميداني' },
  'STATUS_TRANSITION': { en: 'Status Transition', ar: 'تحديث حالة البلاغ' },
  'ASSIGN_OFFICER': { en: 'Assign Officer', ar: 'تكليف مفتش صحي' },
  'CLUSTER_DETECTED': { en: 'Cluster Detected', ar: 'رصد بؤرة وبائية' },
  'USER_ROLE_CHANGE': { en: 'User Role Change', ar: 'تعديل صلاحيات المستخدم' },
  'REPORT_SUBMITTED': { en: 'Report Submitted', ar: 'تسجيل بلاغ جديد' },
  'RESOLVE_INCIDENT': { en: 'Resolve Incident', ar: 'إغلاق ومعالجة الحادث' }
};

export const AUDIT_DETAILS_DICTIONARY: Record<string, { en: string; ar: string }> = {
  'Field investigation INV-2026-0101 initiated for water contamination in Bab Al-Tabbaneh.': {
    en: 'Field investigation INV-2026-0101 initiated for water contamination in Bab Al-Tabbaneh.',
    ar: 'بدء التحقيق الميداني INV-2026-0101 لبلاغ تلوث المياه في باب التبانة.'
  },
  'Status moved from UNDER_REVIEW to IN_INVESTIGATION following food poisoning cluster at Al-Tal.': {
    en: 'Status moved from UNDER_REVIEW to IN_INVESTIGATION following food poisoning cluster at Al-Tal.',
    ar: 'ترقية حالة البلاغ من قيد التدقيق إلى قيد التحقيق الميداني إثر اشتباه تسمم في التل.'
  },
  'Assigned Inspector Bassam Chami to investigate oil slick at Al-Mina port.': {
    en: 'Assigned Inspector Bassam Chami to investigate oil slick at Al-Mina port.',
    ar: 'تكليف المراقب بسام شامي بالتحقيق في بقعة الزيوت بمرفأ الميناء.'
  },
  'Spatial-temporal waterborne cluster detected in Bab Al-Tabbaneh (5 incidents, 138 affected).': {
    en: 'Spatial-temporal waterborne cluster detected in Bab Al-Tabbaneh (5 incidents, 138 affected).',
    ar: 'رصد بؤرة وبائية مائية في باب التبانة (5 بلاغات متزامنة، 138 متضرراً).'
  },
  'Updated user credentials and assigned badge TRP-OFF-05.': {
    en: 'Updated user credentials and assigned badge TRP-OFF-05.',
    ar: 'تحديث بيانات المستخدم ومنحه شارة التفتيش رقم TRP-OFF-05.'
  },
  'New incident logged via citizen web portal with GPS coordinates (34.4442, 35.8504).': {
    en: 'New incident logged via citizen web portal with GPS coordinates (34.4442, 35.8504).',
    ar: 'تسجيل بلاغ صحي جديد عبر بوابة المواطن مع الإحداثيات الجغرافية (34.4442, 35.8504).'
  },
  'Sewage overflow at Abu Samra cleared and chlorinated; incident closed.': {
    en: 'Sewage overflow at Abu Samra cleared and chlorinated; incident closed.',
    ar: 'معالجة طفح الصرف الصحي في أبي سمراء وتعقيم المكان وإغلاق البلاغ بنجاح.'
  }
};

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Brand & Header
  appTitle: { en: 'Tripoli HealthPulse', ar: 'نبض طرابلس الصحي' },
  appSubtitle: { en: 'Smart Public Health Surveillance & Reporting', ar: 'المنظومة الذكية للرصد والإبلاغ عن الصحة العامة' },
  country: { en: 'Lebanon', ar: 'لبنان' },
  cityJurisdiction: { en: 'Greater Tripoli', ar: 'طرابلس الكبرى' },
  reportIncident: { en: 'Report Incident', ar: 'إبلاغ عن حادث صحي' },
  notifications: { en: 'Surveillance Notifications', ar: 'إشعارات الترصد الصحي' },
  noNotifications: { en: 'No notifications at this time.', ar: 'لا توجد إشعارات حالياً.' },
  markAllRead: { en: 'Mark all read', ar: 'تحديد الكل كمقروء' },
  demoRoleSwitcher: { en: 'Instant Demo Role Switcher', ar: 'التبديل الفوري بين الأدوار' },

  // Roles
  citizen: { en: 'Citizen', ar: 'مواطن' },
  citizenReporter: { en: 'Citizen Reporter', ar: 'مبلّغ مواطن' },
  healthOfficer: { en: 'Health Officer', ar: 'مراقب صحي' },
  administrator: { en: 'Municipal Admin', ar: 'مدير صحي بلدي' },
  epidemiologyLead: { en: 'Chief Epidemiologist', ar: 'رئيس وحدة الترصد الوبائي' },
  municipalHealthDirector: { en: 'Municipal Health Director', ar: 'مدير الرقابة الصحية والبيئية' },

  // Navigation Items
  citizenDashboard: { en: 'Citizen Dashboard', ar: 'لوحة تحكم المواطن' },
  authorityDashboard: { en: 'Authority Dashboard', ar: 'لوحة التحكم والعمليات' },
  adminDashboard: { en: 'Admin Command Center', ar: 'مركز قيادة الإدارة' },
  submitIncident: { en: 'Submit Incident', ar: 'تقديم بلاغ جديد' },
  myReports: { en: 'My Reports & Tracking', ar: 'بلاغاتي والمتابعة' },
  publicPortal: { en: 'Tripoli Health Notices', ar: 'الإرشادات الصحية العامة' },
  tripoliMap: { en: 'Tripoli Live Map', ar: 'خريطة طرابلس التفاعلية' },
  reportTriage: { en: 'Report Triage & Review', ar: 'فرز ومراجعة البلاغات' },
  allReports: { en: 'All Incident Reports', ar: 'سجل البلاغات الشامل' },
  investigations: { en: 'Field Investigations', ar: 'التحقيقات الميدانية والمخبرية' },
  clusterDetection: { en: 'Cluster Detection', ar: 'رصد البؤر الوبائية (Clusters)' },
  surveillanceAlerts: { en: 'Surveillance Alerts', ar: 'التنبيهات الصحية الطارئة' },
  epidemiologyCharts: { en: 'Epidemiology Charts', ar: 'الإحصائيات والرسوم البيانية' },
  usersOfficers: { en: 'Users & Officers', ar: 'إدارة المستخدمين والمفتشين' },
  reportCategories: { en: 'Report Categories', ar: 'إدارة فئات المخاطر' },
  auditTrail: { en: 'System Audit Trail', ar: 'سجل التدقيق الأمني' },
  exportDossier: { en: 'Export Official Dossier', ar: 'تصدير التقرير الرسمي' },
  slideUpNavbar: { en: 'Slide Up Navigation', ar: 'إخفاء الشريط العلوي' },
  slideDownNavbar: { en: 'Slide Down Navigation', ar: 'إظهار الشريط العلوي' },

  // Risk Levels
  riskCritical: { en: 'CRITICAL', ar: 'حرج جداً' },
  riskHigh: { en: 'HIGH', ar: 'مرتفع' },
  riskMedium: { en: 'MEDIUM', ar: 'متوسط' },
  riskLow: { en: 'LOW', ar: 'منخفض' },

  // Statuses
  statusSubmitted: { en: 'Submitted', ar: 'تم التقديم' },
  statusUnderReview: { en: 'Under Review', ar: 'قيد التدقيق' },
  statusVerified: { en: 'Verified', ar: 'تم التحقق' },
  statusInInvestigation: { en: 'In Investigation', ar: 'قيد التحقيق الميداني' },
  statusResolved: { en: 'Resolved', ar: 'تمت المعالجة' },
  statusClosed: { en: 'Closed', ar: 'مغلق نهائياً' },
  statusRejected: { en: 'Rejected', ar: 'مرفوض' },

  // Stats & Dashboard
  totalReports: { en: 'Total Reports', ar: 'إجمالي البلاغات' },
  reportsToday: { en: 'Reports Today', ar: 'بلاغات اليوم' },
  criticalRisk: { en: 'Critical Risk', ar: 'مستوى حرج (≥76)' },
  highRisk: { en: 'High Risk', ar: 'مستوى مرتفع' },
  underInspection: { en: 'In Investigation', ar: 'قيد التحقيق' },
  resolutionRate: { en: 'Resolution Rate', ar: 'نسبة الإنجاز والمعالجة' },
  activeAlerts: { en: 'Active Alerts', ar: 'تنبيهات نشطة' },
  detectedClusters: { en: 'Detected Clusters', ar: 'البؤر المكتشفة' },
  liveTripoliView: { en: 'Live Tripoli Epidemiological Map View', ar: 'العرض المباشر لخريطة طرابلس الوبائية' },
  priorityQueue: { en: 'Priority Triage Queue', ar: 'قائمة الفرز ذات الأولوية القصوى' },
  immediateDispatch: { en: 'Immediate dispatch', ar: 'استجابة فورية' },
  priorityInspection: { en: 'Priority inspection', ar: 'أولوية كشف' },
  activeFieldTeams: { en: 'Active field teams', ar: 'فرق ميدانية نشطة' },
  remediated: { en: 'remediated', ar: 'حالة معالجة' },
  fullScreenMap: { en: 'Full Screen Map', ar: 'عرض كامل الخريطة' },
  manageAllReports: { en: 'Manage All Reports', ar: 'إدارة كافة البلاغات' },
  awaitingTriage: { en: 'Newly submitted incidents ranked by algorithmic risk score', ar: 'البلاغات الجديدة مرتبة حسب درجة المخاطر الذكية' },

  // Table Headers
  reportNumberCol: { en: 'Report #', ar: 'رقم البلاغ' },
  categoryCol: { en: 'Category', ar: 'الفئة' },
  titleLocationCol: { en: 'Title & Location', ar: 'العنوان والموقع' },
  riskScoreCol: { en: 'Risk Score', ar: 'درجة الخطورة' },
  affectedCol: { en: 'Affected', ar: 'المتضررين' },
  statusCol: { en: 'Status', ar: 'الحالة' },
  assignedOfficerCol: { en: 'Assigned Officer', ar: 'المراقب المكلف' },
  actionCol: { en: 'Action', ar: 'الإجراء' },
  inspect: { en: 'Inspect', ar: 'معاينة' },
  people: { en: 'people', ar: 'شخص' },
  citizens: { en: 'citizens', ar: 'مواطن' },
  unassigned: { en: 'Unassigned', ar: 'غير مكلّف' },
  entries: { en: 'entries', ar: 'سجل' },
  previous: { en: 'Previous', ar: 'السابق' },
  next: { en: 'Next', ar: 'التالي' },
  pageOf: { en: 'Page', ar: 'صفحة' },
  ofWord: { en: 'of', ar: 'من' },
  showing: { en: 'Showing', ar: 'عرض' },
  toWord: { en: 'to', ar: 'إلى' },

  // Map & Filters
  filters: { en: 'Filters:', ar: 'تصفية:' },
  allRisks: { en: 'All Risk Levels', ar: 'جميع مستويات الخطورة' },
  allStatuses: { en: 'All Statuses', ar: 'جميع الحالات' },
  allCategories: { en: 'All Categories', ar: 'جميع الفئات' },
  allDistricts: { en: 'All Districts', ar: 'جميع أحياء طرابلس' },
  focusDistrict: { en: 'Focus:', ar: 'التركيز على:' },
  clustersToggle: { en: 'Clusters', ar: 'البؤر' },
  legendTitle: { en: 'Risk Levels:', ar: 'مستويات الخطورة:' },
  inspectManage: { en: 'Inspect & Manage', ar: 'معاينة وإدارة' },

  // Buttons & Actions
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  close: { en: 'Close', ar: 'إغلاق' },
  closeWindow: { en: 'Close Window', ar: 'إغلاق النافذة' },
  save: { en: 'Save', ar: 'حفظ' },
  submit: { en: 'Submit Incident Report', ar: 'إرسال البلاغ الصحي' },
  startInvestigation: { en: 'Start Field Investigation', ar: 'بدء تحقيق ميداني' },
  verifyReport: { en: 'Verify Citizen Report', ar: 'اعتماد وتأكيد البلاغ' },
  resolveIncident: { en: 'Resolve Incident', ar: 'تسجيل معالجة الحادث' },
  rejectReport: { en: 'Reject / False Positive', ar: 'رفض البلاغ / إنذار خاطئ' },
  assignOfficer: { en: 'Assign Inspector', ar: 'تكليف مراقب صحي' },
  confirmAssignment: { en: 'Confirm Assignment', ar: 'تأكيد التكليف' },
  selectHealthOfficer: { en: 'Select Health Officer...', ar: 'اختر مراقباً صحياً...' },
  printSavePDF: { en: 'Print / Save PDF', ar: 'طباعة / حفظ كملف PDF' },
  runClusterScan: { en: 'Run Live Cluster Scan', ar: 'تشغيل مسح البؤر الوبائية' },
  scanningTripoliGrid: { en: 'Scanning Tripoli Grid...', ar: 'جاري مسح شبكة طرابلس...' },
  acknowledge: { en: 'Acknowledge', ar: 'استلام وتأكيد' },
  resolve: { en: 'Resolve', ar: 'إنهاء ومعالجة' },

  // Sort
  sortBy: { en: 'Sort by:', ar: 'ترتيب حسب:' },
  highestRiskScore: { en: 'Highest Risk Score', ar: 'الأعلى خطورة' },
  mostRecent: { en: 'Most Recent', ar: 'الأحدث تاريخاً' },
  mostAffected: { en: 'Most Affected', ar: 'الأكثر تضرراً' },
  searchPlaceholderReports: { en: 'Search by #number, title, reporter, or district...', ar: 'بحث برقم البلاغ، العنوان، المبلّغ أو الحي...' },
  noMatchingReports: { en: 'No matching public health reports found.', ar: 'لم يتم العثور على أي بلاغات صحية مطابقة.' },

  // Charts
  incidentDistributionByCategory: { en: 'Incident Distribution by Health Category', ar: 'توزيع البلاغات حسب الفئة الصحية' },
  topReportedHazards: { en: 'Top Reported Hazards', ar: 'أبرز المخاطر المرصودة' },
  riskLevelDistribution: { en: 'Risk Level Distribution', ar: 'توزيع مستويات الخطورة' },
  algorithmicAssessment: { en: 'Algorithmic', ar: 'تقييم خوارزمي' },
  incidentsByTripoliDistrict: { en: 'Incidents by Tripoli District / Neighborhood', ar: 'توزيع البلاغات حسب أحياء ومناطق طرابلس' },
  geographicSpread: { en: 'Geographic Spread', ar: 'الانتشار الجغرافي' },
  investigationLifecycleStatus: { en: 'Investigation Lifecycle Status Distribution', ar: 'مسار ومراحل التحقيقات الميدانية' },
  pipeline: { en: 'Pipeline', ar: 'مراحل الإنجاز' },
  totalRegisteredReports: { en: 'Total Registered Reports', ar: 'إجمالي البلاغات المسجلة' },
  resolutionContainmentRate: { en: 'Resolution & Containment Rate', ar: 'نسبة الإنجاز واحتواء المخاطر' },
  closedResolved: { en: 'closed/resolved', ar: 'تمت معالجتها' },

  // Cluster & Alert text
  interrelatedIncidents: { en: 'Interrelated Reports', ar: 'بلاغات مترابطة' },
  estimatedAffected: { en: 'Estimated Affected', ar: 'المتضررين التقديري' },
  radius: { en: 'Radius', ar: 'نطاق دائري' },
  correlatedIncidents: { en: 'Correlated Incidents:', ar: 'الحوادث المترابطة:' },
  surveillanceAlertsFeed: { en: 'Tripoli Surveillance Health Alerts', ar: 'تنبيهات الترصد الصحي في طرابلس' },
  automatedTriageTriggers: { en: 'Automated triage triggers and priority emergency dispatches', ar: 'تنبيهات الترصد التلقائية وإشارات الطوارئ ذات الأولوية' },
  allAlerts: { en: 'All Alerts', ar: 'كافة التنبيهات' },
  activeAlertsCount: { en: 'Active', ar: 'نشط' },
  acknowledgedAlerts: { en: 'Acknowledged', ar: 'تم الاستلام' },
  resolvedAlerts: { en: 'Resolved', ar: 'تمت المعالجة' },
  clusterEngineTitle: { en: 'Automated Spatial-Temporal Cluster Detection Engine', ar: 'محرك الكشف الآلي عن البؤر الوبائية والمكانية' },
  clusterEngineDesc: {
    en: 'Continuously correlates Tripoli incident reports within a 1.2 km radius and 48–72h sliding time window using the Haversine formula and category epidemiological affinity vectors.',
    ar: 'يقوم بربط ومطابقة بلاغات طرابلس الصحية تلقائياً ضمن نطاق 1.2 كم ونافذة زمنية من 48 إلى 72 ساعة باستخدام معادلة هافيرسين والمتجهات الوبائية المشتركة.'
  },

  // Investigations View
  investigationsTitle: { en: 'Official Field Investigations & Laboratory Logs', ar: 'سجل التحقيقات الميدانية والفحوصات المخبرية الرسمية' },
  investigationsDesc: { en: 'Epidemiological findings, microbiological testing, and municipal remediation orders', ar: 'الملاحظات الوبائية، الفحوصات الميكروبيولوجية، وأوامر المعالجة البلدية' },
  allResults: { en: 'All Results', ar: 'جميع النتائج' },
  confirmedHazard: { en: 'Confirmed Hazard', ar: 'خطر مؤكد' },
  remediatedStatus: { en: 'Remediated', ar: 'تمت المعالجة' },
  fieldFindings: { en: 'Field Findings:', ar: 'الملاحظات والنتائج الميدانية:' },
  containmentActions: { en: 'Containment & Actions Taken:', ar: 'إجراءات الاحتواء المتخذة:' },
  officialDirective: { en: 'Official Directive:', ar: 'التوجيهات والقرارات الرسمية:' },
  samplesLabel: { en: 'Samples:', ar: 'العينات المخبرية:' },
  fieldOfficer: { en: 'Field Officer:', ar: 'المراقب الميداني:' },
  inspectLinkedIncident: { en: 'Inspect Linked Incident Report', ar: 'معاينة البلاغ المرتبط' },

  // Common Form
  incidentTitle: { en: 'Incident Title', ar: 'عنوان البلاغ' },
  detailedDescription: { en: 'Detailed Observation & Description', ar: 'التفاصيل والملاحظات الميدانية' },
  tripoliDistrict: { en: 'Tripoli District', ar: 'الحي / المنطقة في طرابلس' },
  streetAddress: { en: 'Street Address / Landmark', ar: 'اسم الشارع / معلم مميز' },
  affectedPeople: { en: 'Estimated Number of Affected People', ar: 'العدد التقديري للمتضررين' },
  evidencePhoto: { en: 'Evidence Photo URL (Optional)', ar: 'رابط صورة إثبات (اختياري)' },
  additionalRemarks: { en: 'Additional Citizen Remarks', ar: 'ملاحظات إضافية' },
  initialSeverity: { en: 'Initial Reporter Severity Rating', ar: 'التقييم الأولي للخطورة' },
  realTimeRiskScore: { en: 'Real-Time Intelligent Risk Engine Calculation', ar: 'حساب محرك المخاطر الذكي اللحظي' },
  scoringBreakdown: { en: 'Scoring Factor Breakdown:', ar: 'تفصيل نقاط عوامل المخاطر:' },
  mapPinpoint: { en: 'Map Pinpoint', ar: 'تحديد على الخريطة' },
  hidePinpoint: { en: 'Hide Pinpoint', ar: 'إخفاء الخريطة' },
  submitModalTitle: { en: 'Submit Public Health Incident Report', ar: 'تقديم بلاغ عن حادث صحي عام' },
  submitModalSubtitle: { en: 'Municipality of Tripoli • Automated Risk Analysis', ar: 'بلدية طرابلس • تحليل المخاطر الآلي' },

  // Report Details
  surveillanceLifecycle: { en: 'Surveillance Lifecycle Workflow', ar: 'مسار ومراحل دورة الترصد الصحي' },
  auditTrailTitle: { en: 'Investigation Audit Trail & Status History', ar: 'سجل التدقيق وتاريخ تحديث الحالات' },
  evaluatorJustifications: { en: 'Evaluator Justifications:', ar: 'مبررات تقييم المخاطر:' },
  severityScoreLabel: { en: 'Severity Score', ar: 'درجة الخطورة' },
  affectedPopLabel: { en: 'Affected Population', ar: 'حجم المتضررين' },
  recencyWeightLabel: { en: 'Recency Weight', ar: 'وزن الحداثة' },
  geoClusterLabel: { en: 'Geographic Cluster', ar: 'البؤرة الجغرافية' },
  categoryPriorityLabel: { en: 'Category Priority', ar: 'أولوية الفئة' },

  // Admin Users & Categories
  usersDirectoryTitle: { en: 'Tripoli Health Staff & Citizen Directory', ar: 'دليل الكوادر الصحية والمواطنين في طرابلس' },
  usersDirectoryDesc: { en: 'Role-Based Access Control (RBAC): Citizens, Certified Health Officers, and Municipal Administrators', ar: 'التحكم بالوصول حسب الدور (RBAC): المواطنون، المراقبون المعتمدون، والإداريون' },
  totalRegisteredUsers: { en: 'Total Registered Users:', ar: 'إجمالي المستخدمين المسجلين:' },
  categoriesManagementTitle: { en: 'Dynamic Public Health Incident Categories', ar: 'إدارة فئات البلاغات والمخاطر الصحية' },
  categoriesManagementDesc: { en: 'Configured in database collection with algorithmic risk engine base weights (1–25)', ar: 'مخزنة في قاعدة البيانات مع أوزان محرك المخاطر الأساسية (1–25)' },
  addNewCategory: { en: 'Add New Surveillance Category to Database', ar: 'إضافة فئة رصد صحي جديدة لقاعدة البيانات' },
  categoryName: { en: 'Category Name', ar: 'اسم الفئة' },
  baseRiskWeight: { en: 'Base Risk Weight (1-25 pts)', ar: 'الوزن الأساسي للمخاطر (1–25 نقطة)' },
  description: { en: 'Description', ar: 'الوصف' },
  addCategoryBtn: { en: 'Add Category', ar: 'إضافة الفئة' },
  auditLogsTitle: { en: 'Municipal Health Surveillance Audit Logs', ar: 'سجل التدقيق الأمني للترصد الصحي البلدي' },
  auditLogsDesc: { en: 'Immutable forensic log of all status transitions, officer dispatches, and cluster activations', ar: 'سجل جنائي غير قابل للتعديل لكافة الإجراءات، التكليفات، وتفعيل البؤر' },
  searchAudit: { en: 'Search audit trail...', ar: 'بحث في سجل التدقيق...' },

  // Strict One-Way Workflow
  oneWayWorkflowTitle: { en: 'Strict Forward-Only Inspection Protocol', ar: 'بروتوكول التفتيش التسلسلي الإلزامي (باتجاه واحد)' },
  oneWayWorkflowDesc: {
    en: 'Strict sequential protocol: each stage moves forward only. Once verified, you proceed to field investigation; once in investigation, you must finalize inspection to resolve.',
    ar: 'بروتوكول تفتيش تسلسلي إلزامي باتجاه واحد: لا يمكن الرجوع لمرحلة سابقة. بعد التحقق ينتقل البلاغ للمعاينة الميدانية، ولا يمكن إنجازه إلا بتثبيت محضر الكشف النهائي.'
  },
  proceedToReview: { en: 'Advance to Review (Under Review)', ar: 'نقل البلاغ إلى قيد التدقيق' },
  proceedToVerify: { en: 'Verify Incident (Verified)', ar: 'اعتماد وتأكيد صحة البلاغ' },
  proceedToInvestigation: { en: 'Launch Field Investigation', ar: 'بدء التحقيق والمعاينة الميدانية' },
  finalizeInspectionBtn: { en: 'Finalize Field Inspection & Resolve', ar: 'إنهاء التفتيش ومعالجة البلاغ نهائياً' },
  finalizeInspectionTitle: { en: 'Finalize Field Inspection & Remediate', ar: 'تثبيت نتائج التفتيش وإغلاق المعالجة' },
  finalizeInspectionDesc: {
    en: 'Certify containment actions, laboratory clearance, and register final municipal resolution.',
    ar: 'توثيق اكتمال إجراءات الاحتواء، النتائج المخبرية، واعتماد حل البلاغ رسمياً.'
  },
  closeIncidentFinal: { en: 'Archive & Final Closeout (Closed)', ar: 'إغلاق وأرشفة البلاغ نهائياً' },
  caseFinalizedClosed: { en: 'Case Finalized & Closed - Record Locked', ar: 'تم إنهاء ومعالجة البلاغ وإغلاقه نهائياً - السجل مقفل ومؤرشف' },
  confirmFinalize: { en: 'Confirm & Finalize Inspection', ar: 'تأكيد وإنهاء التفتيش الميداني' },
  rejectionReason: { en: 'Rejection Reason / Notes', ar: 'سبب رفض البلاغ' },
  cannotRevert: { en: 'Past stages are locked and cannot be reverted.', ar: 'المراحل السابقة مقفلة ولا يمكن الرجوع إليها.' },
  currentStage: { en: 'Current Stage', ar: 'المرحلة الحالية' },
  nextStage: { en: 'Next Permitted Action', ar: 'الإجراء التالي المتاح' },

  // Auth & Profile
  signIn: { en: 'Sign In', ar: 'تسجيل الدخول' },
  signUp: { en: 'Sign Up', ar: 'إنشاء حساب جديد' },
  loginTitle: { en: 'Access Tripoli HealthPulse', ar: 'تسجيل الدخول لمنظومة نبض طرابلس الصحي' },
  registerTitle: { en: 'Register Public Health Account', ar: 'إنشاء حساب جديد في المنظومة' },
  emailAddress: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  password: { en: 'Password', ar: 'كلمة المرور' },
  confirmPassword: { en: 'Confirm Password', ar: 'تأكيد كلمة المرور' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  phoneNumber: { en: 'Phone Number', ar: 'رقم الهاتف' },
  accountRole: { en: 'Account Role', ar: 'نوع الحساب / الدور' },
  badgeOptional: { en: 'Badge Number (e.g. TRP-OFF-08)', ar: 'رقم الشارة (مثال: TRP-OFF-08)' },
  quickDemo: { en: 'Instant One-Click Demo Login', ar: 'تسجيل دخول فوري بحسابات التجربة' },
  alreadyHaveAccount: { en: 'Already have an account? Sign in', ar: 'لديك حساب بالفعل؟ تسجيل الدخول' },
  dontHaveAccount: { en: "Don't have an account? Sign up now", ar: 'ليس لديك حساب؟ أنشئ حساباً جديداً' },
  signOut: { en: 'Sign Out', ar: 'تسجيل الخروج' },
  editProfileBtn: { en: 'Edit Profile', ar: 'تعديل الملف الشخصي' },
  signInTitle: { en: 'Sign In', ar: 'تسجيل الدخول' },
  createAccountBtn: { en: 'Create Account', ar: 'إنشاء حساب' },
  editProfile: { en: 'Edit Profile & Account', ar: 'تعديل الملف الشخصي والبيانات' },
  userProfile: { en: 'User Profile & Settings', ar: 'بيانات الملف الشخصي والإعدادات' },
  profilePicture: { en: 'Profile Picture / Avatar', ar: 'الصورة الشخصية / الرمز' },
  profilePictureUrl: { en: 'Profile Picture Image URL', ar: 'رابط صورة الملف الشخصي' },
  selectAvatar: { en: 'Or select a quick avatar preset:', ar: 'أو اختر صورة رمزية جاهزة:' },
  jobTitleBio: { en: 'Job Title / Municipal Specialty', ar: 'المسمى الوظيفي أو الصفة الرسمية' },
  bio: { en: 'Bio / About', ar: 'نبذة شخصية' },
  saveProfile: { en: 'Save Profile Changes', ar: 'حفظ تعديلات الملف الشخصي' },
  profileUpdatedSuccess: { en: 'Profile updated successfully!', ar: 'تم تحديث بيانات الملف الشخصي بنجاح!' }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateCategory: (cat: string) => string;
  translateDistrict: (dist: string) => string;
  translateStatus: (status: string) => string;
  translateRisk: (risk: string) => string;
  translateSeverity: (severity: string) => string;
  translateTitle: (title: string, categoryName?: string, district?: string) => string;
  translateDescription: (desc: string, categoryName?: string, district?: string) => string;
  translateFindings: (findings: string, invCode?: string) => string;
  translateActions: (actions: string, invCode?: string) => string;
  translateRecommendations: (recs: string, invCode?: string) => string;
  translateSamples: (samples: string, invCode?: string) => string;
  translateAlertTitle: (title: string, alertCode?: string) => string;
  translateAlertDesc: (desc: string, alertCode?: string) => string;
  translateCluster: (clusterCategory: string) => string;
  translateAuditAction: (action: string) => string;
  translateAuditDetails: (details: string) => string;
  translateRole: (role: string) => string;
  translateExplanation: (exp: string) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('tripoli_healthpulse_lang');
      return (saved === 'ar' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('tripoli_healthpulse_lang', lang);
    } catch (e) {
      console.warn('Could not save language preference', e);
    }
  };

  const isRtl = language === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const t = (key: string, fallback?: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return fallback || key;
  };

  const translateCategory = (cat: string): string => {
    if (language === 'en') return cat;
    return CATEGORIES_MAP[cat]?.ar || cat;
  };

  const translateDistrict = (dist: string): string => {
    if (language === 'en') return dist;
    return DISTRICTS_MAP[dist]?.ar || dist;
  };

  const translateStatus = (status: string): string => {
    if (language === 'en') {
      return STATUS_MAP[status]?.en || status;
    }
    return STATUS_MAP[status]?.ar || status;
  };

  const translateRisk = (risk: string): string => {
    if (language === 'en') {
      return RISK_MAP[risk]?.en || risk;
    }
    return RISK_MAP[risk]?.ar || risk;
  };

  const translateSeverity = (severity: string): string => {
    if (language === 'en') {
      return SEVERITY_MAP[severity]?.en || severity;
    }
    return SEVERITY_MAP[severity]?.ar || severity;
  };

  const translateTitle = (title: string, categoryName?: string, district?: string): string => {
    if (language === 'en') return title;

    if (TITLES_DICTIONARY[title]) {
      return TITLES_DICTIONARY[title].ar;
    }

    // Dynamic generation if custom report
    if (categoryName && district) {
      const catAr = translateCategory(categoryName);
      const distAr = translateDistrict(district);
      return `إبلاغ عن ${catAr} في حي ${distAr}`;
    }

    return title;
  };

  const translateDescription = (desc: string, categoryName?: string, district?: string): string => {
    if (language === 'en') return desc;

    if (DESCRIPTIONS_DICTIONARY[desc]) {
      return DESCRIPTIONS_DICTIONARY[desc].ar;
    }

    // Keyword based or fallback
    if (categoryName && district) {
      const catAr = translateCategory(categoryName);
      const distAr = translateDistrict(district);
      return `بلاغ تفصيلي يتعلق بـ ${catAr} في منطقة ${distAr} بطرابلس. تم تسجيل البلاغ ومتابعته عبر فرق الرقابة الصحية والبيئية البلدية.`;
    }

    return desc;
  };

  const translateFindings = (findings: string, invCode?: string): string => {
    if (language === 'en') return findings;
    if (invCode && INVESTIGATIONS_DICTIONARY[invCode]?.findings) {
      return INVESTIGATIONS_DICTIONARY[invCode].findings!.ar;
    }
    // Check known texts
    for (const item of Object.values(INVESTIGATIONS_DICTIONARY)) {
      if (item.findings && item.findings.en === findings) {
        return item.findings.ar;
      }
    }
    return findings;
  };

  const translateActions = (actions: string, invCode?: string): string => {
    if (language === 'en') return actions;
    if (invCode && INVESTIGATIONS_DICTIONARY[invCode]?.actions) {
      return INVESTIGATIONS_DICTIONARY[invCode].actions!.ar;
    }
    for (const item of Object.values(INVESTIGATIONS_DICTIONARY)) {
      if (item.actions && item.actions.en === actions) {
        return item.actions.ar;
      }
    }
    return actions;
  };

  const translateRecommendations = (recs: string, invCode?: string): string => {
    if (language === 'en') return recs;
    if (invCode && INVESTIGATIONS_DICTIONARY[invCode]?.recommendations) {
      return INVESTIGATIONS_DICTIONARY[invCode].recommendations!.ar;
    }
    for (const item of Object.values(INVESTIGATIONS_DICTIONARY)) {
      if (item.recommendations && item.recommendations.en === recs) {
        return item.recommendations.ar;
      }
    }
    return recs;
  };

  const translateSamples = (samples: string, invCode?: string): string => {
    if (language === 'en') return samples;
    if (invCode && INVESTIGATIONS_DICTIONARY[invCode]?.samples) {
      return INVESTIGATIONS_DICTIONARY[invCode].samples!.ar;
    }
    for (const item of Object.values(INVESTIGATIONS_DICTIONARY)) {
      if (item.samples && item.samples.en === samples) {
        return item.samples.ar;
      }
    }
    return samples;
  };

  const translateAlertTitle = (title: string, alertCode?: string): string => {
    if (language === 'en') return title;
    if (alertCode && ALERTS_DICTIONARY[alertCode]?.title) {
      return ALERTS_DICTIONARY[alertCode].title.ar;
    }
    for (const item of Object.values(ALERTS_DICTIONARY)) {
      if (item.title && item.title.en === title) {
        return item.title.ar;
      }
    }
    return title;
  };

  const translateAlertDesc = (desc: string, alertCode?: string): string => {
    if (language === 'en') return desc;
    if (alertCode && ALERTS_DICTIONARY[alertCode]?.desc) {
      return ALERTS_DICTIONARY[alertCode].desc.ar;
    }
    for (const item of Object.values(ALERTS_DICTIONARY)) {
      if (item.desc && item.desc.en === desc) {
        return item.desc.ar;
      }
    }
    return desc;
  };

  const translateCluster = (clusterCategory: string): string => {
    if (language === 'en') return clusterCategory;
    return CLUSTERS_TRANSLATIONS[clusterCategory]?.ar || clusterCategory;
  };

  const translateAuditAction = (action: string): string => {
    if (language === 'en') return action;
    return AUDIT_ACTIONS_DICTIONARY[action]?.ar || action;
  };

  const translateAuditDetails = (details: string): string => {
    if (language === 'en') return details;
    return AUDIT_DETAILS_DICTIONARY[details]?.ar || details;
  };

  const translateRole = (role: string): string => {
    if (language === 'en') return role;
    if (role === 'ADMINISTRATOR') return 'مدير صحي بلدي';
    if (role === 'HEALTH_OFFICER') return 'مراقب صحي';
    if (role === 'CITIZEN') return 'مواطن مبلّغ';
    if (role === 'SYSTEM') return 'نظام الترصد الآلي';
    return role;
  };

  const translateExplanation = (exp: string): string => {
    if (language === 'en') return exp;
    if (exp.includes('High priority category')) return 'فئة ذات أولوية وبائية قصوى تستوجب الاستجابة العاجلة.';
    if (exp.includes('Moderate risk category')) return 'فئة ذات خطورة متوسطة تتطلب الكشف الدوري.';
    if (exp.includes('Critical initial severity')) return 'تقييم خطورة أولي حرج ومباشر من المبلّغ.';
    if (exp.includes('High initial severity')) return 'تقييم خطورة أولي مرتفع.';
    if (exp.includes('Moderate initial severity')) return 'تقييم خطورة أولي متوسط.';
    if (exp.includes('High population affected')) return 'عدد مرتفع من المتضررين (أكثر من 20 مواطناً).';
    if (exp.includes('Moderate population affected')) return 'عدد متوسط من المتضررين (6 إلى 20 مواطناً).';
    if (exp.includes('multiple nearby related incidents')) return 'رصد عدة بلاغات متقاربة جغرافياً خلال نافذة زمنية نشطة.';
    if (exp.includes('Spatial cluster detected')) return 'تم رصد بؤرة جغرافية متصلة في ذات الحي السكني.';
    if (exp.includes('Reported very recently')) return 'بلاغ حديث ورد خلال الـ 24 ساعة الماضية.';
    if (exp.includes('Reported within 48 hours')) return 'بلاغ ورد خلال الـ 48 ساعة الماضية.';
    return exp;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateCategory,
        translateDistrict,
        translateStatus,
        translateRisk,
        translateSeverity,
        translateTitle,
        translateDescription,
        translateFindings,
        translateActions,
        translateRecommendations,
        translateSamples,
        translateAlertTitle,
        translateAlertDesc,
        translateCluster,
        translateAuditAction,
        translateAuditDetails,
        translateRole,
        translateExplanation,
        isRtl
      }}
    >
      <div dir={isRtl ? 'rtl' : 'ltr'} className={isRtl ? 'font-arabic' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
