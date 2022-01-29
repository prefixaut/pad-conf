export interface Panel {
    pin: number;
    baseValue: number;
    positiveThreshold: number;
    negativeThreshold: number;
    keyCode: number;
}

export enum Command {
    DEBUG = 'd',
    MEASSURE = 'm',
    ALL = 'a',
    COUNT = 'c',
    LAYOUT = 'l',
    GET = 'g',
    WRITE = 'w',
    RESET = 'r',
    SAVE = 's',
    MEASSURE_VALUE = 'v',
}

export type PadLayout = [
    boolean, boolean, boolean,
    boolean, boolean, boolean,
    boolean, boolean, boolean,
];
