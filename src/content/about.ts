/**
 * About-page copy that only the owner can write.
 *
 * TODO(owner): replace `null` with your story. Each string is one paragraph.
 * While this is `null` the "Our story" section is hidden — nothing is invented.
 *
 *   export const OUR_STORY: OurStory | null = {
 *     en: ["How Nirmanee started…", "What we care about…"],
 *     si: ["නිර්මාණී ආරම්භ වූ ආකාරය…", "අපට වැදගත් දේ…"],
 *   };
 */
export interface OurStory {
  en: string[];
  si: string[];
}

export const OUR_STORY: OurStory | null = null;
