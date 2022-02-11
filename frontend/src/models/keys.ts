export interface Key {
    code: string;
    key: string;
    keyCode: number;
}

export const KEY_CTRL: Key = {
    code: 'ControlLeft', // Uses the left one, as there's no merit to make a difference
    key: 'Control',
    keyCode: 17,
};

export const KEY_SHIFT: Key = {
    code: 'ShiftLeft', // Same here
    key: 'Shift',
    keyCode: 16,
};

export const KEY_ALT: Key = {
    code: 'AltLeft',
    key: 'Alt',
    keyCode: 18,
};

export const KEY_OS: Key = {
    code: 'OSLeft',
    key: 'OS',
    keyCode: 91,
};

/** May need to be registered as CTRL+ALT for compatibility */
export const KEY_ALT_GRAPH: Key = {
    code: 'AltRight',
    key: 'AltGraph',
    keyCode: 18,
};

export function isMetaKey(key: Key): boolean { 
    return key.keyCode === 18
        || key.keyCode === 20
        || key.keyCode === 17
        || key.keyCode === 91 
        || key.keyCode === 92
        || key.keyCode === 16;
}

/** Theres actually no damn native way or library to do this, so hell yea, manual labor */
export function keyCodeToKey(keyCode: number): Key | null {
    switch (keyCode) {
        // Digits
        case 48:
            return {
                code: 'Digit0',
                key: '0',
                keyCode,
            };
        case 49:
            return {
                code: 'Digit1',
                key: '1',
                keyCode,
            };
        case 50:
            return {
                code: 'Digit2',
                key: '2',
                keyCode,
            };
        case 51:
            return {
                code: 'Digit3',
                key: '3',
                keyCode,
            };
        case 52:
            return {
                code: 'Digit4',
                key: '4',
                keyCode,
            };
        case 53:
            return {
                code: 'Digit5',
                key: '5',
                keyCode,
            };
        case 54:
            return {
                code: 'Digit6',
                key: '6',
                keyCode,
            };
        case 55:
            return {
                code: 'Digit7',
                key: '7',
                keyCode,
            };
        case 56:
            return {
                code: 'Digit8',
                key: '8',
                keyCode,
            };
        case 57:
            return {
                code: 'Digit9',
                key: '0',
                keyCode,
            };
        
        // Latin Characters
        case 65:
            return {
                code: 'KeyA',
                key: 'a',
                keyCode,
            };
        case 66:
            return {
                code: 'KeyB',
                key: 'b',
                keyCode,
            };
        case 67:
            return {
                code: 'KeyC',
                key: 'c',
                keyCode,
            };
        case 68:
            return {
                code: 'KeyD',
                key: 'd',
                keyCode,
            };
        case 69:
            return {
                code: 'KeyE',
                key: 'e',
                keyCode,
            };
        case 70:
            return {
                code: 'KeyF',
                key: 'f',
                keyCode,
            };
        case 71:
            return {
                code: 'KeyG',
                key: 'g',
                keyCode,
            };
        case 72:
            return {
                code: 'KeyH',
                key: 'h',
                keyCode,
            };
        case 73:
            return {
                code: 'KeyI',
                key: 'i',
                keyCode,
            };
        case 74:
            return {
                code: 'KeyJ',
                key: 'j',
                keyCode,
            };
        case 75:
            return {
                code: 'KeyK',
                key: 'k',
                keyCode,
            };
        case 76:
            return {
                code: 'KeyL',
                key: 'l',
                keyCode,
            };
        case 77:
            return {
                code: 'KeyM',
                key: 'm',
                keyCode,
            };
        case 78:
            return {
                code: 'KeyN',
                key: 'n',
                keyCode,
            };
        case 79:
            return {
                code: 'KeyO',
                key: 'o',
                keyCode,
            };
        case 80:
            return {
                code: 'KeyP',
                key: 'p',
                keyCode,
            };
        case 81:
            return {
                code: 'KeyQ',
                key: 'q',
                keyCode,
            };
        case 82:
            return {
                code: 'KeyR',
                key: 'r',
                keyCode,
            };
        case 83:
            return {
                code: 'KeyS',
                key: 's',
                keyCode,
            };
        case 84:
            return {
                code: 'KeyT',
                key: 't',
                keyCode,
            };
        case 85:
            return {
                code: 'KeyU',
                key: 'u',
                keyCode,
            };
        case 86:
            return {
                code: 'KeyV',
                key: 'v',
                keyCode,
            };
        case 87:
            return {
                code: 'KeyW',
                key: 'w',
                keyCode,
            };
        case 88:
            return {
                code: 'KeyX',
                key: 'x',
                keyCode,
            };
        case 89:
            return {
                code: 'KeyY',
                key: 'z',
                keyCode,
            };
        case 90:
            return {
                code: 'KeyZ',
                key: 'z',
                keyCode,
            };
    
        // ASCII Special characters
        case 188: {
            return {
                code: 'Comma',
                key: ',',
                keyCode,
            };
        }
        case 190: {
            return {
                code: 'Period',
                key: '.',
                keyCode,
            };
        }
        case 186: {
            return {
                code: 'Semicolon',
                key: ';',
                keyCode,
            };
        }
        case 222: {
            return {
                code: 'Quote',
                key: '"',
                keyCode,
            };
        }
        case 219:
            return {
                code: 'BracketLeft',
                key: '(',
                keyCode,
            };
        case 221:
            return {
                code: 'BracketRight',
                key: ')',
                keyCode,
            };
        case 192: {
            return {
                code: 'Backquote',
                key: '`',
                keyCode,
            };
        }
        case 220: {
            return {
                code: 'Backslash',
                key: '\\',
                keyCode,
            };
        }
        case 189: {
            return {
                code: 'Minus',
                key: '-',
                keyCode,
            };
        }
        case 187: {
            return {
                code: 'Equal',
                key: '=',
                keyCode,
            };
        }

        // Non-Printable
        case 93: {
            return {
                code: 'ContextMenu',
                key: 'ContextMenu',
                keyCode,
            };
        }
        case 13: {
            return {
                code: 'Enter',
                key: 'Enter',
                keyCode,
            };
        }
        case 32: {
            return {
                code: 'Space',
                key: 'Space',
                keyCode,
            };
        }
        case 9: {
            return {
                code: 'Tab',
                key: 'Tab',
                keyCode,
            };
        }
        case 46: {
            return {
                code: 'Delete',
                key: 'Delete',
                keyCode,
            };
        }
        case 35: {
            return {
                code: 'End',
                key: 'End',
                keyCode,
            };
        }
        case 36: {
            return {
                code: 'Home',
                key: 'Home',
                keyCode,
            };
        }
        case 45: {
            return {
                code: 'Insert',
                key: 'Insert',
                keyCode,
            };
        }
        case 34: {
            return {
                code: 'PageDown',
                key: 'PageDown',
                keyCode,
            };
        }
        
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
        // Fallback
        default:
            return null;
    }
}
