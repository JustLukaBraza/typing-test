// Using very short, simple sounds encoded in base64 to avoid extra file requests.
const keypressAudio = new Audio(
  'data:audio/wav;base64,UklGRjwAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQgAAAAIAEAAbwB2AIEA'
);
const errorAudio = new Audio(
  'data:audio/wav;base64,UklGRkAAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAIAECA'
);
const finishAudio = new Audio(
  'data:audio/wav;base64,UklGRlAAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAA//8='
);

keypressAudio.volume = 0.4;
errorAudio.volume = 0.3;
finishAudio.volume = 0.5;

const sounds = {
  keypress: keypressAudio,
  error: errorAudio,
  finish: finishAudio,
};

export const playSound = (sound: 'keypress' | 'error' | 'finish') => {
  try {
    const audio = sounds[sound];
    audio.currentTime = 0;
    audio.play().catch(e => console.log("Sound play failed:", e));
  } catch (e) {
    console.error("Error playing sound:", e);
  }
};
