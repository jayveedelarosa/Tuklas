/**
 * Maps folklore character names (from data/levels.json) to bundled art.
 * Sigbin is the only monster with shipped, finished art and the only one
 * battled in the playable vertical slice; Tikbalang/Aswang/Kapre are
 * future roster entries with no art yet and stay locked.
 */
export const characterArt = {
  sigbin: {
    calm: require('../../../assets/characters/Sigbin.png'),
  },
  tikbalang: {
    calm: require('../../../assets/characters/Sigbin.png'),
  },
  aswang: {
    calm: require('../../../assets/characters/Sigbin.png'),
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
