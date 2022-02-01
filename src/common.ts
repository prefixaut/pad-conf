export interface Panel {
    deadzoneStart: number;
    deadzoneEnd: number;
    keyCode: number;
}

export const PIN_UNASSIGNED = -1;
export const KEY_CODE_UNASSIGNED = -1;
export const MIN_VALUE = 0;
export const MAX_VALUE = 1024;

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
    number, number, number,
    number, number, number,
    number, number, number,
];

export interface Device {
    path: string;
    manufacturer?: string | undefined;
    serialNumber?: string | undefined;
    pnpId?: string | undefined;
    locationId?: string | undefined;
    productId?: string | undefined;
    vendorId?: string | undefined;
}
