/**
 * Maps folklore character names (from data/levels.json) to bundled art.
 * Sigbin is the only monster battled in the playable vertical slice;
 * Tikbalang and Aswang have their own roster portraits but stay locked
 * future entries; Kapre has no art yet and falls back to Sigbin.
 */
export const characterArt = {
  sigbin: {
    calm: require('../../../assets/characters/Sigbin.png'),
  },
  tikbalang: {
    calm: require('../../../assets/characters/Tikbalang.png'),
  },
  aswang: {
    calm: require('../../../assets/characters/Aswang.png'),
  },
  kapre: {
    calm: require('../../../assets/characters/Sigbin.png'),
  },
} as const;

export type CharacterId = keyof typeof characterArt;

export const tuklasMascot = {
  calm: require('../../../assets/characters/Tuklas(companion of the main character).png'),
  idle1: require('../../../assets/characters/Tuklas(companion of the main character).png'),
  idle2: require('../../../assets/characters/Tuklas(companion of the main character).png'),
};

export const appLogo = require('../../../assets/app logo/App Logo.png');

export const onboardingBackground = require('../../../assets/onboarding/Background on boarding.png');
