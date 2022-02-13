import { keys } from '../../../common/src/key-codes.json';

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
export function keyCodeToKey(keyCode: number): Key | undefined {
    return keys.find(key => key.keyCode === keyCode);
}
