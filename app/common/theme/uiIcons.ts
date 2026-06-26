/**
 * Maps logical UI glyph names to bundled icon art, replacing what used to be
 * raw emoji characters in JSX. Swap paths here, not call sites, when final
 * art changes.
 */
export const uiIcons = {
  fire: require('../../../assets/ui/fire.png'),
  goblin: require('../../../assets/ui/goblin.png'),
  guava: require('../../../assets/ui/guava.png'),
  chatBubble: require('../../../assets/ui/chat.png'),
  lock: require('../../../assets/ui/lock.png'),
  numberSense: require('../../../assets/ui/numpad.png'),
  mango: require('../../../assets/ui/mango.png'),
  celebration: require('../../../assets/ui/confetti.png'),
  lightbulb: require('../../../assets/ui/lightbulb.png'),
  pin: require('../../../assets/ui/pin.png'),
} as const;
