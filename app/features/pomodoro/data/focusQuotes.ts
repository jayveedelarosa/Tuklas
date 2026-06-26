export interface FocusQuote {
  en: string;
  tl: string;
}

export const FOCUS_QUOTES: FocusQuote[] = [
  {
    en: 'Small steps every day make big math wins!',
    tl: 'Ang maliliit na hakbang araw-araw ay malaking tagumpay sa math!',
  },
  {
    en: 'Focus now, play proud later!',
    tl: 'Magpokus ngayon, maglaro nang may pride mamaya!',
  },
  {
    en: 'Your brain is a muscle — train it!',
    tl: 'Ang utak mo ay parang muscle — sanayin ito!',
  },
  {
    en: 'Every minute of focus is a star earned.',
    tl: 'Bawat minuto ng pagtutok ay isang bituing nae-earn.',
  },
  {
    en: 'You can do hard things, one breath at a time.',
    tl: 'Kaya mo ang mahihirap, isang hininga bawat pagkakataon.',
  },
  {
    en: 'Tuklas believes in you — keep going!',
    tl: 'Naniniwala si Tuklas sa iyo — tuloy lang!',
  },
];

let quoteIndex = 0;

export function nextFocusQuote(): FocusQuote {
  const quote = FOCUS_QUOTES[quoteIndex % FOCUS_QUOTES.length];
  quoteIndex += 1;
  return quote;
}
