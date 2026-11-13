/**
 * DRAFT FAQ — EN + SI. ⚠️ Owner review required.
 * Placeholders: {revisionFee} {freeRevisions} {whatsapp}
 */
export type FaqGroup = "ordering" | "files" | "delivery" | "payment";

export const FAQ_GROUPS: FaqGroup[] = ["ordering", "files", "delivery", "payment"];

export interface FaqItem {
  group: FaqGroup;
  q: string;
  a: string;
}

const en: FaqItem[] = [
  {
    group: "ordering",
    q: "How does ordering work?",
    a: "Choose a product and options, upload your photos (or ask us to design it) and add it to your cart. Our designer prepares the artwork and sends you a proof. We print only after you approve it.",
  },
  {
    group: "ordering",
    q: "Will I see the design before you print?",
    a: "Yes. For most orders you get a digital proof first. {freeRevisions} rounds of changes are free; further revisions are {revisionFee} each. If you are in a hurry you can choose \"Skip proof, print as-is\" for your own print-ready file.",
  },
  {
    group: "files",
    q: "What files can I send?",
    a: "JPG, PNG, HEIC (iPhone photos), PDF, AI or ZIP, up to 500 MB each. Send the original photo from your phone or camera, not a screenshot or a WhatsApp-compressed copy — it prints much sharper.",
  },
  {
    group: "delivery",
    q: "How long does it take?",
    a: "Most gifts are ready in 1–3 days after you approve the proof; each product page shows the exact time. Express turnaround is available on many products for an extra charge.",
  },
  {
    group: "delivery",
    q: "Do you deliver?",
    a: "Yes, islandwide by courier, usually 2–4 working days after dispatch. The fee depends on your zone (Kalutara district, Western Province or the rest of the island). Pickup at our Kalutara shop is free.",
  },
  {
    group: "payment",
    q: "How do I pay?",
    a: "Online card payment is coming soon. For now, send your cart to us on WhatsApp and we will confirm the payment options (bank transfer or payment at the shop).",
  },
  {
    group: "ordering",
    q: "Can you design it for me?",
    a: "Yes. Choose \"Design it for me\" on the product page and tell us the names, dates, colours and style you like. The design fee is shown before you add to cart.",
  },
  {
    group: "delivery",
    q: "What if something is wrong with my order?",
    a: "If it is our printing fault or the item was damaged in delivery, we reprint it free. Message us on WhatsApp {whatsapp} within 48 hours with your order number and photos.",
  },
  {
    group: "ordering",
    q: "Do you take bulk or corporate orders?",
    a: "Yes — T-shirts, mugs, key tags, banners and more. Bulk discounts apply automatically on product pages, and we can quote larger jobs on WhatsApp.",
  },
];

const si: FaqItem[] = [
  {
    group: "ordering",
    q: "ඇණවුම් කරන්නේ කෙසේද?",
    a: "නිෂ්පාදනයක් සහ විකල්ප තෝරා, ඔබේ ඡායාරූප උඩුගත කරන්න (හෝ නිර්මාණය කිරීමට අපට කියන්න) සහ කරත්තයට එක් කරන්න. අපගේ නිර්මාණකරු නිර්මාණය සකසා සාම්පලයක් එවයි. ඔබ අනුමත කළ පසුව පමණක් අපි මුද්‍රණය කරමු.",
  },
  {
    group: "ordering",
    q: "මුද්‍රණයට පෙර නිර්මාණය මට බලන්න පුළුවන්ද?",
    a: "ඔව්. බොහෝ ඇණවුම් සඳහා මුලින්ම ඩිජිටල් සාම්පලයක් ලැබේ. වෙනස්කම් වට {freeRevisions}ක් නොමිලේ; ඉන්පසු සංශෝධනයකට {revisionFee}. ඔබට ඉක්මන් නම් මුද්‍රණයට සූදානම් ගොනුවක් සඳහා \"සාම්පලය මඟ හරින්න\" තෝරා ගත හැක.",
  },
  {
    group: "files",
    q: "මට එවිය හැක්කේ කුමන ගොනුද?",
    a: "JPG, PNG, HEIC (iPhone ඡායාරූප), PDF, AI හෝ ZIP, එකක් 500 MB දක්වා. ස්ක්‍රීන්ෂොට් එකක් හෝ WhatsApp හරහා සම්පීඩනය වූ පිටපතක් නොව ඔබේ දුරකථනයේ හෝ කැමරාවේ මුල් ඡායාරූපය එවන්න — එය වඩාත් පැහැදිලිව මුද්‍රණය වේ.",
  },
  {
    group: "delivery",
    q: "කොපමණ කාලයක් ගතවේද?",
    a: "බොහෝ තෑගි සාම්පලය අනුමත කිරීමෙන් පසු දින 1–3ක් තුළ සූදානම් වේ; සෑම නිෂ්පාදන පිටුවකම නිවැරදි කාලය පෙන්වයි. බොහෝ නිෂ්පාදන සඳහා අමතර ගාස්තුවකට ඉක්මන් සේවාව ඇත.",
  },
  {
    group: "delivery",
    q: "ඔබ බෙදාහැරීම කරනවාද?",
    a: "ඔව්, දිවයින පුරා කුරියර් මගින්, සාමාන්‍යයෙන් යැවීමෙන් පසු වැඩ කරන දින 2–4ක් තුළ. ගාස්තුව ඔබේ කලාපය (කළුතර දිස්ත්‍රික්කය, බස්නාහිර පළාත හෝ දිවයිනේ අනෙකුත් ප්‍රදේශ) අනුව වෙනස් වේ. අපගේ කළුතර කඩෙන් ලබා ගැනීම නොමිලේ.",
  },
  {
    group: "payment",
    q: "ගෙවන්නේ කෙසේද?",
    a: "මාර්ගගත කාඩ්පත් ගෙවීම ළඟදීම. දැනට ඔබේ කරත්තය WhatsApp හරහා අපට එවන්න; ගෙවීම් ක්‍රම (බැංකු මාරුව හෝ කඩයේදී ගෙවීම) අපි තහවුරු කරමු.",
  },
  {
    group: "ordering",
    q: "ඔබට මා වෙනුවෙන් නිර්මාණය කළ හැකිද?",
    a: "ඔව්. නිෂ්පාදන පිටුවේ \"මට නිර්මාණය කරන්න\" තෝරා ඔබ කැමති නම්, දින, වර්ණ සහ ශෛලිය අපට කියන්න. කරත්තයට එක් කිරීමට පෙර නිර්මාණ ගාස්තුව පෙන්වයි.",
  },
  {
    group: "delivery",
    q: "මගේ ඇණවුමේ යම් වරදක් තිබේ නම්?",
    a: "එය අපගේ මුද්‍රණ දෝෂයක් නම් හෝ බෙදාහැරීමේදී හානි වූයේ නම්, අපි නොමිලේ නැවත මුද්‍රණය කරමු. පැය 48ක් තුළ ඇණවුම් අංකය සහ ඡායාරූප සමඟ WhatsApp {whatsapp} වෙත පණිවිඩයක් එවන්න.",
  },
  {
    group: "ordering",
    q: "තොග හෝ ආයතනික ඇණවුම් භාර ගන්නවාද?",
    a: "ඔව් — ටී-ෂර්ට්, මග්, කී ටැග්, බැනර් සහ තවත් දේ. නිෂ්පාදන පිටුවල තොග වට්ටම් ස්වයංක්‍රීයව යෙදේ; විශාල කාර්යයන් සඳහා WhatsApp හරහා මිල ගණන් දෙන්නෙමු.",
  },
];

export function faqItems(locale: string): FaqItem[] {
  return locale === "si" ? si : en;
}
