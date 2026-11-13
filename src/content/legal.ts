/**
 * DRAFT legal texts — EN + SI. ⚠️ Owner review required (and ideally a lawyer)
 * before launch. When approved, set SITE_SETTINGS.legalDraft = false.
 *
 * Placeholders replaced at render time:
 *   {revisionFee}   — app_settings.revision_fee_lkr (e.g. "Rs 500")
 *   {freeRevisions} — app_settings.free_revisions
 *   {phone} {whatsapp} {email}
 */

export type LegalSlug = "privacy" | "terms" | "returns";

export interface LegalDoc {
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

const en: Record<LegalSlug, LegalDoc> = {
  privacy: {
    title: "Privacy policy",
    description: "How Nirmanee Digital Print House collects, uses and protects your personal data and uploaded files.",
    intro:
      "Nirmanee Digital Print House (\"we\", \"us\") respects your privacy. This policy explains what we collect when you use our website or place an order, why we need it, and the choices you have. It is written with Sri Lanka's Personal Data Protection Act, No. 9 of 2022 in mind.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Contact details you give us: name, phone number, email address and delivery address.",
          "Order details: products, options, notes, messages in your job chat and proof approvals.",
          "Files you upload (photos, designs, logos) and the artwork we create from them.",
          "Payment status from our payment provider. We never see or store your full card number.",
          "Basic technical data: a session cookie that keeps your cart, your language choice, and standard server logs (IP address, browser type) kept for security.",
        ],
      },
      {
        heading: "Why we use it",
        body: [
          "To design, print, quality-check and deliver your order, and to send you proofs and order updates (by WhatsApp, SMS, phone or email).",
          "To answer your questions and handle reprints or refunds.",
          "To keep records required by law (for example invoices and payment records).",
          "We do not sell your data and we do not use your photos for advertising without your separate permission.",
        ],
      },
      {
        heading: "Who we share it with",
        body: [
          "Only the service providers we need to run the shop: website hosting (Vercel), database and login (Supabase), file storage (Cloudflare R2), our payment provider (PayHere) and the courier delivering your parcel.",
          "These providers process data on our behalf and may store it outside Sri Lanka with appropriate safeguards.",
          "We may disclose information if the law requires it.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Uploaded files and artwork: up to 12 months after delivery so we can reprint or repeat your order, then deleted. Ask us to delete them sooner at any time.",
          "Order and payment records: as long as required for accounting and tax purposes.",
          "Carts that are never ordered are cleared after about 30 days.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask to see, correct or delete your personal data, or withdraw consent for optional messages.",
          "Contact us on WhatsApp {whatsapp} or call {phone}. We will reply within a reasonable time.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "We use only essential cookies: one to keep you signed in or keep your guest cart, and one to remember your language. We do not use advertising cookies.",
        ],
      },
      {
        heading: "Changes",
        body: ["We may update this policy. The latest version is always on this page."],
      },
    ],
  },
  terms: {
    title: "Terms of service",
    description: "The terms for ordering custom printing from Nirmanee Digital Print House.",
    intro:
      "These terms apply when you order from Nirmanee Digital Print House through this website, WhatsApp or at our Kalutara shop. By placing an order you agree to them.",
    sections: [
      {
        heading: "Orders and prices",
        body: [
          "Fixed-price products are paid in full when you order. Prices are in Sri Lankan rupees (LKR).",
          "Quote items (for example banners, bulk orders and custom sizes) show an estimate online. Our team confirms the final price in your job chat; a 50% advance starts the work and the balance is due after you approve the proof, before printing.",
          "Every order must be fully paid before printing starts.",
          "We may refuse or cancel an order (with a full refund) if a product is unavailable or the content breaks these terms.",
        ],
      },
      {
        heading: "Your files and content",
        body: [
          "You confirm you own, or have permission to use, every photo, logo, text and design you send us.",
          "We do not print content that is illegal, hateful, obscene, or that infringes someone else's copyright or trademark (for example cartoon characters or brand logos without permission).",
          "Low-resolution files may print blurry. We warn you when we can, but the result depends on the quality of the file you provide.",
        ],
      },
      {
        heading: "Proofs and revisions",
        body: [
          "For most orders our designer sends a digital proof in your job chat before printing. Please check spelling, dates, names, layout and colours carefully.",
          "{freeRevisions} rounds of changes are included. Each further revision costs {revisionFee}, shown before you request it.",
          "When you approve a proof, you confirm it is correct. We print exactly what you approved.",
          "If you choose \"Skip proof, print as-is\", we print your file exactly as uploaded and you are responsible for its content and quality.",
          "Screen colours differ from printed colours; small colour variations are normal and are not a print fault.",
        ],
      },
      {
        heading: "Turnaround, pickup and delivery",
        body: [
          "Production times shown on the website are estimates that start after payment and proof approval.",
          "Pickup at our Kalutara shop is free. Courier delivery is charged by zone and usually arrives in 2–4 working days after dispatch; courier delays are outside our control.",
          "Please check your parcel when it arrives and tell us within 48 hours if anything is damaged or wrong.",
        ],
      },
      {
        heading: "Refunds and reprints",
        body: ["See our Refund & reprint policy for cancellations, refunds and reprints."],
      },
      {
        heading: "Liability",
        body: [
          "Our liability for any order is limited to the amount you paid for it. We are not responsible for indirect losses, such as a missed event, caused by delays outside our control.",
        ],
      },
      {
        heading: "Law",
        body: ["These terms are governed by the laws of Sri Lanka."],
      },
    ],
  },
  returns: {
    title: "Refund & reprint policy",
    description: "Cancellations, refunds and free reprints for custom printed orders at Nirmanee Digital Print House.",
    intro:
      "Everything we make is printed to order with your photos and text, so it cannot be resold. That is why we show you a proof first — and why we fix our own mistakes for free.",
    sections: [
      {
        heading: "Cancelling an order",
        body: [
          "Before our designer starts work: full refund.",
          "After design work has started but before you approve the proof: refund minus the design fee (if you chose \"Design it for me\") or minus Rs 500 for artwork preparation.",
          "After you approve the proof, or once printing has started: no refund, because the item is made only for you.",
        ],
      },
      {
        heading: "Free reprint when it is our fault",
        body: [
          "We reprint free of charge if the item does not match the proof you approved — for example a printing defect, the wrong size, material or quantity, smudging, or damage caused by our packing or in transit.",
          "If a reprint is not possible, we refund the item in full.",
        ],
      },
      {
        heading: "Not covered",
        body: [
          "Mistakes that were visible in the proof you approved (spelling, dates, names, layout).",
          "Blurry results from low-resolution files after we warned you, or orders placed with \"Skip proof, print as-is\".",
          "Small colour differences between your screen and the printed item, and the natural grain of wood, crystal or fabric.",
          "Damage after delivery or pickup, or from misuse (for example dishwashing a hand-wash-only magic mug).",
        ],
      },
      {
        heading: "How to report a problem",
        body: [
          "Message us on WhatsApp {whatsapp} within 48 hours of receiving your order, with your order number and clear photos of the problem.",
          "We reply within one working day and, if it is our fault, start your reprint right away. You don't need to send the item back unless we ask.",
        ],
      },
      {
        heading: "How refunds are paid",
        body: [
          "Refunds go back to the original payment method (card payments through PayHere) or by bank transfer, usually within 7–14 working days.",
        ],
      },
    ],
  },
};

const si: Record<LegalSlug, LegalDoc> = {
  privacy: {
    title: "රහස්‍යතා ප්‍රතිපත්තිය",
    description: "නිර්මාණී ඩිජිටල් ප්‍රින්ට් හවුස් ඔබේ පුද්ගලික දත්ත සහ උඩුගත කළ ගොනු එකතු කරන, භාවිත කරන සහ ආරක්ෂා කරන ආකාරය.",
    intro:
      "නිර්මාණී ඩිජිටල් ප්‍රින්ට් හවුස් (\"අපි\") ඔබේ රහස්‍යතාවට ගරු කරයි. ඔබ අපගේ වෙබ් අඩවිය භාවිත කරන විට හෝ ඇණවුමක් කරන විට අප එකතු කරන දේ, එය අවශ්‍ය ඇයි සහ ඔබට ඇති තේරීම් මෙම ප්‍රතිපත්තියෙන් පැහැදිලි කරයි. මෙය 2022 අංක 9 දරන ශ්‍රී ලංකා පුද්ගලික දත්ත ආරක්ෂණ පනත සැලකිල්ලට ගනිමින් ලියා ඇත.",
    sections: [
      {
        heading: "අප එකතු කරන දේ",
        body: [
          "ඔබ ලබා දෙන සම්බන්ධතා විස්තර: නම, දුරකථන අංකය, ඊමේල් ලිපිනය සහ බෙදාහැරීමේ ලිපිනය.",
          "ඇණවුම් විස්තර: නිෂ්පාදන, විකල්ප, සටහන්, කාර්ය චැට් පණිවිඩ සහ සාම්පල අනුමැතිය.",
          "ඔබ උඩුගත කරන ගොනු (ඡායාරූප, නිර්මාණ, ලාංඡන) සහ ඒවායින් අප සාදන නිර්මාණ.",
          "අපගේ ගෙවීම් සේවාවෙන් ලැබෙන ගෙවීම් තත්ත්වය. ඔබේ සම්පූර්ණ කාඩ්පත් අංකය අප කිසි විටෙක දකින්නේ හෝ ගබඩා කරන්නේ නැත.",
          "මූලික තාක්ෂණික දත්ත: ඔබේ කරත්තය තබා ගන්නා සැසි කුකියක්, භාෂා තේරීම සහ ආරක්ෂාව සඳහා සාමාන්‍ය සේවාදායක ලොග් (IP ලිපිනය, බ්‍රව්සර් වර්ගය).",
        ],
      },
      {
        heading: "අප එය භාවිත කරන්නේ ඇයි",
        body: [
          "ඔබේ ඇණවුම නිර්මාණය කිරීමට, මුද්‍රණය කිරීමට, පරීක්ෂා කිරීමට සහ බෙදාහැරීමට, සාම්පල සහ ඇණවුම් තොරතුරු (WhatsApp, SMS, ඇමතුම හෝ ඊමේල් මගින්) එවීමට.",
          "ඔබේ ප්‍රශ්නවලට පිළිතුරු දීමට සහ නැවත මුද්‍රණ හෝ මුදල් ආපසු ගෙවීම් සඳහා.",
          "නීතියෙන් අවශ්‍ය වාර්තා තබා ගැනීමට (උදා: ඉන්වොයිසි සහ ගෙවීම් වාර්තා).",
          "අපි ඔබේ දත්ත විකුණන්නේ නැත. ඔබේ වෙනම අවසරයකින් තොරව ඔබේ ඡායාරූප වෙළඳ ප්‍රචාරණය සඳහා භාවිත නොකරමු.",
        ],
      },
      {
        heading: "අප එය බෙදා ගන්නේ කා සමඟද",
        body: [
          "කඩය පවත්වාගෙන යාමට අවශ්‍ය සේවා සපයන්නන් සමඟ පමණි: වෙබ් අඩවි සත්කාරකය (Vercel), දත්ත ගබඩාව සහ පිවිසුම (Supabase), ගොනු ගබඩාව (Cloudflare R2), ගෙවීම් සේවාව (PayHere) සහ ඔබේ පාර්සලය ගෙන එන කුරියර් සේවාව.",
          "මෙම සේවා සපයන්නන් අප වෙනුවෙන් දත්ත සකසන අතර සුදුසු ආරක්ෂණ සහිතව ශ්‍රී ලංකාවෙන් පිටත ගබඩා කළ හැක.",
          "නීතියෙන් අවශ්‍ය නම් අප තොරතුරු හෙළි කළ හැක.",
        ],
      },
      {
        heading: "අප එය කොපමණ කාලයක් තබා ගන්නේද",
        body: [
          "උඩුගත කළ ගොනු සහ නිර්මාණ: නැවත මුද්‍රණය හෝ නැවත ඇණවුම සඳහා බෙදාහැරීමෙන් පසු මාස 12ක් දක්වා, ඉන්පසු මකා දමනු ලැබේ. ඕනෑම වේලාවක ඉක්මනින් මකන ලෙස අපෙන් ඉල්ලිය හැක.",
          "ඇණවුම් සහ ගෙවීම් වාර්තා: ගිණුම් සහ බදු අරමුණු සඳහා අවශ්‍ය කාලය දක්වා.",
          "ඇණවුම් නොකළ කරත්ත දින 30කට පමණ පසු ඉවත් කෙරේ.",
        ],
      },
      {
        heading: "ඔබේ අයිතිවාසිකම්",
        body: [
          "ඔබේ පුද්ගලික දත්ත බැලීමට, නිවැරදි කිරීමට හෝ මකා දැමීමට, නැතහොත් අත්‍යවශ්‍ය නොවන පණිවිඩ සඳහා දුන් කැමැත්ත ඉවත් කර ගැනීමට ඔබට ඉල්ලිය හැක.",
          "WhatsApp {whatsapp} හෝ {phone} අමතන්න. සාධාරණ කාලයක් තුළ අපි පිළිතුරු දෙන්නෙමු.",
        ],
      },
      {
        heading: "කුකීස්",
        body: [
          "අපි අත්‍යවශ්‍ය කුකීස් පමණක් භාවිත කරමු: ඔබව පිවිසී තබා ගැනීමට හෝ ඔබේ අමුත්තන්ගේ කරත්තය තබා ගැනීමට එකක් සහ ඔබේ භාෂාව මතක තබා ගැනීමට එකක්. වෙළඳ ප්‍රචාරණ කුකීස් භාවිත නොකරමු.",
        ],
      },
      {
        heading: "වෙනස්කම්",
        body: ["අපි මෙම ප්‍රතිපත්තිය යාවත්කාලීන කළ හැක. නවතම අනුවාදය සැමවිටම මෙම පිටුවේ ඇත."],
      },
    ],
  },
  terms: {
    title: "සේවා කොන්දේසි",
    description: "නිර්මාණී ඩිජිටල් ප්‍රින්ට් හවුස් වෙතින් අභිරුචි මුද්‍රණ ඇණවුම් කිරීමේ කොන්දේසි.",
    intro:
      "ඔබ මෙම වෙබ් අඩවිය, WhatsApp හෝ අපගේ කළුතර කඩය හරහා නිර්මාණී ඩිජිටල් ප්‍රින්ට් හවුස් වෙතින් ඇණවුම් කරන විට මෙම කොන්දේසි අදාළ වේ. ඇණවුමක් කිරීමෙන් ඔබ ඒවාට එකඟ වේ.",
    sections: [
      {
        heading: "ඇණවුම් සහ මිල",
        body: [
          "ස්ථාවර මිල නිෂ්පාදන ඇණවුම් කරන විට සම්පූර්ණයෙන් ගෙවිය යුතුය. මිල ශ්‍රී ලංකා රුපියල් (LKR) වලිනි.",
          "මිල ගණන් අයිතම (උදා: බැනර්, තොග ඇණවුම් සහ අභිරුචි ප්‍රමාණ) සඳහා මාර්ගගතව ඇස්තමේන්තුවක් පෙන්වයි. අවසාන මිල අපගේ කණ්ඩායම ඔබේ කාර්ය චැට් එකේ තහවුරු කරයි; 50% අත්තිකාරමකින් වැඩ අරඹන අතර ඉතිරිය සාම්පලය අනුමත කළ පසු, මුද්‍රණයට පෙර ගෙවිය යුතුය.",
          "මුද්‍රණය ආරම්භ කිරීමට පෙර සෑම ඇණවුමක්ම සම්පූර්ණයෙන් ගෙවිය යුතුය.",
          "නිෂ්පාදනයක් නොමැති නම් හෝ අන්තර්ගතය මෙම කොන්දේසි උල්ලංඝනය කරන්නේ නම් අපට ඇණවුමක් ප්‍රතික්ෂේප හෝ අවලංගු කළ හැක (සම්පූර්ණ මුදල ආපසු).",
        ],
      },
      {
        heading: "ඔබේ ගොනු සහ අන්තර්ගතය",
        body: [
          "ඔබ එවන සෑම ඡායාරූපයක්, ලාංඡනයක්, පෙළක් සහ නිර්මාණයක්ම ඔබට අයිති බව හෝ භාවිතයට අවසර ඇති බව ඔබ තහවුරු කරයි.",
          "නීති විරෝධී, වෛරී, අසභ්‍ය හෝ වෙනත් අයෙකුගේ ප්‍රකාශන හිමිකම හෝ වෙළඳ ලකුණ උල්ලංඝනය කරන අන්තර්ගතය (උදා: අවසරයකින් තොරව කාටූන් චරිත හෝ සන්නාම ලාංඡන) අපි මුද්‍රණය නොකරමු.",
          "අඩු විභේදන ගොනු බොඳ ලෙස මුද්‍රණය විය හැක. හැකි විට අපි අනතුරු අඟවන නමුත් ප්‍රතිඵලය ඔබ ලබා දෙන ගොනුවේ ගුණාත්මකභාවය මත රඳා පවතී.",
        ],
      },
      {
        heading: "සාම්පල සහ සංශෝධන",
        body: [
          "බොහෝ ඇණවුම් සඳහා මුද්‍රණයට පෙර අපගේ නිර්මාණකරු ඔබේ කාර්ය චැට් එකට ඩිජිටල් සාම්පලයක් එවයි. අක්ෂර වින්‍යාසය, දින, නම්, පිරිසැලසුම සහ වර්ණ හොඳින් පරීක්ෂා කරන්න.",
          "වෙනස්කම් වට {freeRevisions}ක් ඇතුළත්ය. ඉන්පසු සෑම සංශෝධනයකටම {revisionFee}ක් අය වන අතර, ඔබ ඉල්ලීමට පෙර එය පෙන්වනු ලැබේ.",
          "ඔබ සාම්පලයක් අනුමත කරන විට එය නිවැරදි බව ඔබ තහවුරු කරයි. ඔබ අනුමත කළ දේ අපි හරියටම මුද්‍රණය කරමු.",
          "ඔබ \"සාම්පලය මඟ හරින්න, තිබෙන ලෙසම මුද්‍රණය කරන්න\" තෝරා ගන්නේ නම්, ඔබ උඩුගත කළ ගොනුව එලෙසම මුද්‍රණය කරන අතර එහි අන්තර්ගතය සහ ගුණාත්මකභාවය ඔබේ වගකීමයි.",
          "තිරයේ වර්ණ මුද්‍රිත වර්ණවලට වඩා වෙනස් වේ; කුඩා වර්ණ වෙනස්කම් සාමාන්‍ය වන අතර එය මුද්‍රණ දෝෂයක් නොවේ.",
        ],
      },
      {
        heading: "සූදානම් කාලය, ලබා ගැනීම සහ බෙදාහැරීම",
        body: [
          "වෙබ් අඩවියේ පෙන්වන නිෂ්පාදන කාලය ගෙවීම සහ සාම්පල අනුමැතියෙන් පසු ආරම්භ වන ඇස්තමේන්තු වේ.",
          "අපගේ කළුතර කඩෙන් ලබා ගැනීම නොමිලේ. කුරියර් බෙදාහැරීම කලාපය අනුව අය කෙරෙන අතර සාමාන්‍යයෙන් යැවීමෙන් පසු වැඩ කරන දින 2–4ක් තුළ ලැබේ; කුරියර් ප්‍රමාද අපගේ පාලනයෙන් පිටතය.",
          "ඔබේ පාර්සලය ලැබුණු විට පරීක්ෂා කර, යමක් හානි වී හෝ වැරදි නම් පැය 48ක් තුළ අපට දන්වන්න.",
        ],
      },
      {
        heading: "මුදල් ආපසු සහ නැවත මුද්‍රණ",
        body: ["අවලංගු කිරීම්, මුදල් ආපසු ගෙවීම් සහ නැවත මුද්‍රණ සඳහා අපගේ මුදල් ආපසු සහ නැවත මුද්‍රණ ප්‍රතිපත්තිය බලන්න."],
      },
      {
        heading: "වගකීම",
        body: [
          "ඕනෑම ඇණවුමක් සඳහා අපගේ වගකීම ඔබ ඒ සඳහා ගෙවූ මුදලට සීමා වේ. අපගේ පාලනයෙන් පිටත ප්‍රමාද නිසා ඇතිවන වක්‍ර පාඩු (උදා: උත්සවයක් මග හැරීම) සඳහා අපි වගකියන්නේ නැත.",
        ],
      },
      {
        heading: "නීතිය",
        body: ["මෙම කොන්දේසි ශ්‍රී ලංකාවේ නීතිවලට යටත් වේ."],
      },
    ],
  },
  returns: {
    title: "මුදල් ආපසු සහ නැවත මුද්‍රණ ප්‍රතිපත්තිය",
    description: "නිර්මාණී ඩිජිටල් ප්‍රින්ට් හවුස් අභිරුචි මුද්‍රණ ඇණවුම් සඳහා අවලංගු කිරීම්, මුදල් ආපසු ගෙවීම් සහ නොමිලේ නැවත මුද්‍රණ.",
    intro:
      "අප සාදන සෑම දෙයක්ම ඔබේ ඡායාරූප සහ පෙළ සමඟ ඇණවුමට මුද්‍රණය කරන නිසා එය නැවත විකිණිය නොහැක. එබැවින් අපි මුලින්ම සාම්පලයක් පෙන්වන අතර අපගේම වැරදි නොමිලේ නිවැරදි කරමු.",
    sections: [
      {
        heading: "ඇණවුමක් අවලංගු කිරීම",
        body: [
          "අපගේ නිර්මාණකරු වැඩ ආරම්භ කිරීමට පෙර: සම්පූර්ණ මුදල ආපසු.",
          "නිර්මාණ වැඩ ආරම්භ කළ පසු නමුත් ඔබ සාම්පලය අනුමත කිරීමට පෙර: නිර්මාණ ගාස්තුව (ඔබ \"මට නිර්මාණය කරන්න\" තෝරා ගත්තේ නම්) හෝ නිර්මාණ සකස් කිරීම සඳහා රු. 500ක් අඩු කර මුදල ආපසු.",
          "ඔබ සාම්පලය අනුමත කළ පසු හෝ මුද්‍රණය ආරම්භ වූ පසු: භාණ්ඩය ඔබ සඳහාම සාදන නිසා මුදල් ආපසු නොලැබේ.",
        ],
      },
      {
        heading: "අපගේ වරදක් නම් නොමිලේ නැවත මුද්‍රණය",
        body: [
          "භාණ්ඩය ඔබ අනුමත කළ සාම්පලයට නොගැලපේ නම් — උදා: මුද්‍රණ දෝෂයක්, වැරදි ප්‍රමාණය, ද්‍රව්‍යය හෝ ගණන, පැල්ලම් හෝ අපගේ ඇසුරුම් හෝ ප්‍රවාහනයේදී සිදුවූ හානි — අපි නොමිලේ නැවත මුද්‍රණය කරමු.",
          "නැවත මුද්‍රණය කළ නොහැකි නම්, භාණ්ඩයේ සම්පූර්ණ මුදල ආපසු ගෙවමු.",
        ],
      },
      {
        heading: "ආවරණය නොවන දේ",
        body: [
          "ඔබ අනුමත කළ සාම්පලයේ පෙනෙන්නට තිබූ වැරදි (අක්ෂර වින්‍යාසය, දින, නම්, පිරිසැලසුම).",
          "අප අනතුරු ඇඟවීමෙන් පසුත් අඩු විභේදන ගොනු නිසා ඇතිවන බොඳ ප්‍රතිඵල, හෝ \"සාම්පලය මඟ හරින්න\" තෝරා කළ ඇණවුම්.",
          "ඔබේ තිරය සහ මුද්‍රිත භාණ්ඩය අතර කුඩා වර්ණ වෙනස්කම් සහ ලී, ක්‍රිස්ටල් හෝ රෙදිවල ස්වභාවික රටා.",
          "බෙදාහැරීමෙන් හෝ ලබා ගැනීමෙන් පසු සිදුවන හානි, හෝ වැරදි භාවිතය (උදා: අතින් පමණක් සේදිය යුතු මැජික් මග් ඩිෂ්වොෂර් එකේ සේදීම).",
        ],
      },
      {
        heading: "ගැටලුවක් වාර්තා කරන ආකාරය",
        body: [
          "ඔබේ ඇණවුම ලැබී පැය 48ක් තුළ ඇණවුම් අංකය සහ ගැටලුවේ පැහැදිලි ඡායාරූප සමඟ WhatsApp {whatsapp} වෙත පණිවිඩයක් එවන්න.",
          "අපි වැඩ කරන දිනයක් තුළ පිළිතුරු දෙන අතර, එය අපගේ වරදක් නම් වහාම නැවත මුද්‍රණය අරඹමු. අප ඉල්ලන්නේ නැත්නම් භාණ්ඩය ආපසු එවීමට අවශ්‍ය නැත.",
        ],
      },
      {
        heading: "මුදල් ආපසු ගෙවන ආකාරය",
        body: [
          "මුදල් ආපසු මුල් ගෙවීම් ක්‍රමයට (PayHere හරහා කාඩ්පත් ගෙවීම්) හෝ බැංකු මාරුවකින් සාමාන්‍යයෙන් වැඩ කරන දින 7–14ක් තුළ ගෙවනු ලැබේ.",
        ],
      },
    ],
  },
};

export function legalDoc(slug: LegalSlug, locale: string): LegalDoc {
  return (locale === "si" ? si : en)[slug];
}

export function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, key: string) => values[key] ?? m);
}
