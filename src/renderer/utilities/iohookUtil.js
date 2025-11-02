// Comprehensive key mappings for both Mac and Windows
// Based on iohook keycodes that work across platforms
const keynames = {
  // Special keys
  0: '§',
  1: 'Esc',
  
  // Number row
  2: '1',
  3: '2',
  4: '3',
  5: '4',
  6: '5',
  7: '6',
  8: '7',
  9: '8',
  10: '9',
  11: '0',
  12: '-',
  13: '=',
  
  // Top row keys
  14: 'Backspace',
  15: 'Tab',
  
  // Letter keys (qwerty layout)
  16: 'q',
  17: 'w',
  18: 'e',
  19: 'r',
  20: 't',
  21: 'y',
  22: 'u',
  23: 'i',
  24: 'o',
  25: 'p',
  26: '[',
  27: ']',
  28: 'Enter',
  
  // Control key (Left Control on Windows/Mac)
  29: 'Control',
  3613: 'Right Control', // Right Control - works on both platforms
  
  // More letter keys
  30: 'a',
  31: 's',
  32: 'd',
  33: 'f',
  34: 'g',
  35: 'h',
  36: 'j',
  37: 'k',
  38: 'l',
  39: ';',
  40: "'",
  41: '`',
  
  // Shift keys
  42: 'ShiftLeft',
  43: '\\',
  44: 'z',
  45: 'x',
  46: 'c',
  47: 'v',
  48: 'b',
  49: 'n',
  50: 'm',
  51: ',',
  52: '.',
  53: '/',
  54: 'ShiftRight',
  
  // Modifier keys
  56: 'Left Alt', // Alt on Windows, Option (⌥) on Mac
  3640: 'Right Alt', // Right Alt on Windows, Right Option on Mac
  
  // Common keys
  57: 'Space',
  58: 'CapsLock',
  
  // Function keys
  59: 'F1',
  60: 'F2',
  61: 'F3',
  62: 'F4',
  63: 'F5',
  64: 'F6',
  65: 'F7',
  66: 'F8',
  67: 'F9',
  68: 'F10',
  87: 'F11',
  88: 'F12',
  
  // Navigation keys
  61000: 'Arrow Up',
  61003: 'Arrow Left',
  61005: 'Arrow Right',
  61008: 'Arrow Down',
  60999: 'Home',
  61007: 'End',
  61001: 'Page Up',
  61009: 'Page Down',
  61010: 'Insert',
  61011: 'Delete',
  
  // Windows/Meta keys (Command on Mac, Windows key on Windows)
  // On Mac, these represent the Command (⌘) key
  3675: 'Left Win', // Left Windows key / Left Command (⌘)
  3676: 'Right Win', // Right Windows key / Right Command (⌘)
  
  // Mac Command key aliases (for better Mac compatibility)
  // These may be detected as separate codes on some Mac setups
  // Adding them as aliases so reverse lookup works
  // Note: On Mac, when user types "Command", we should map to 3675/3676
  
  // System keys
  3639: 'Print Screen',
  3653: 'Pause Break',
  3677: 'Context Menu', // Right-click menu key
  
  // Numpad keys
  55: 'Num *',
  3637: 'Num /',
  3612: 'Num Enter',
  3655: 'Num Home',
  3657: 'Num Page Up',
  3663: 'Num End',
  3665: 'Num Page Down',
  57420: 'Num Center 5',
  // Numpad numbers (0-9)
  3616: 'Num 0',
  3617: 'Num 1',
  3618: 'Num 2',
  3619: 'Num 3',
  3620: 'Num 4',
  3621: 'Num 5',
  3622: 'Num 6',
  3623: 'Num 7',
  3624: 'Num 8',
  3625: 'Num 9',
  3610: 'Num -',
  3611: 'Num +',
  // Alternative numpad codes for cross-platform compatibility
  57435: 'Num Del', // Alternative numpad delete/dot
  
  // Arrow keys (alternative codes for compatibility)
  57419: '←', // Left arrow alternative
  57416: '↑', // Up arrow alternative
  57424: '↓', // Down arrow alternative
  57421: '→', // Right arrow alternative
  
  // Media keys
  57376: 'Volume Mute',
  57390: 'Volume Down',
  57392: 'Volume Up',
  57360: 'Media Previous',
  57369: 'Media Next',
  57378: 'Media Play',
  57380: 'Media Stop',
};

// Mac-specific display name mappings
// When displaying on Mac, show "Command" instead of "Win"
const platform = typeof process !== 'undefined' ? process.platform : 'unknown';
const isMac = platform === 'darwin';

// Alias mappings for better cross-platform support
// These map browser key names (from e.key) to our internal key names
const keyAliases = {
  // Mac Command key - browser sends "Meta" or "MetaLeft"/"MetaRight"
  'Meta': 'Left Win',
  'MetaLeft': 'Left Win',
  'MetaRight': 'Right Win',
  'Command': 'Left Win',
  'Left Command': 'Left Win',
  'Right Command': 'Right Win',
  'Cmd': 'Left Win',
  'Left Cmd': 'Left Win',
  'Right Cmd': 'Right Win',
  '⌘': 'Left Win',
  
  // Windows key (same as Command on Mac)
  'OSLeft': 'Left Win',
  'OSRight': 'Right Win',
  
  // Control key variations
  'Control': 'Control',
  'ControlLeft': 'Control',
  'ControlRight': 'Right Control',
  
  // Alt/Option key variations
  'Alt': 'Left Alt',
  'AltLeft': 'Left Alt',
  'AltRight': 'Right Alt',
  'Option': 'Left Alt',
  'OptionLeft': 'Left Alt',
  'OptionRight': 'Right Alt',
  
  // Shift key variations
  'Shift': 'ShiftLeft',
  'ShiftLeft': 'ShiftLeft',
  'ShiftRight': 'ShiftRight',
};

// Reverse lookup map for faster reverse searches
// Handles cases where multiple keycodes map to the same name
const reverseKeynames = {};
Object.keys(keynames).forEach(key => {
  const value = keynames[key];
  if (!reverseKeynames[value]) {
    reverseKeynames[value] = [];
  }
  reverseKeynames[value].push(key);
});

// Add aliases to reverse lookup
Object.keys(keyAliases).forEach(alias => {
  const target = keyAliases[alias];
  if (reverseKeynames[target]) {
    reverseKeynames[alias] = reverseKeynames[target];
  }
});

export function getIOHookMapping(source, isIOHookKeycode) {
  if (isIOHookKeycode) {
    // Convert keycode to keyname
    // Handle both string and number keycodes
    const numSource = typeof source === 'string' ? parseInt(source) : source;
    let result = keynames[numSource];
    
    // On Mac, show "Command" instead of "Left Win" or "Right Win" for better UX
    if (isMac && result === 'Left Win') {
      result = 'Command';
    } else if (isMac && result === 'Right Win') {
      result = 'Right Command';
    }
    
    return result;
  } else {
    // Convert keyname to keycode
    // First check aliases
    let lookupName = source;
    if (keyAliases[source]) {
      lookupName = keyAliases[source];
    }
    
    // Handle multiple mappings for the same key name
    const keys = reverseKeynames[lookupName];
    if (keys && keys.length > 0) {
      // Return the first (primary) keycode as string to match storage format
      return keys[0].toString();
    }
    
    // Fallback: search through all keys (slower but more compatible)
    const found = Object.keys(keynames).find((key) => keynames[key] === lookupName);
    return found ? found.toString() : undefined;
  }
}
