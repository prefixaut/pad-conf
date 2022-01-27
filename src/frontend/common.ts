export interface Panel {
    pin: number;
    keyCode: number;
    baseValue: number;
    positiveThreshold: number;
    negativeThreshold: number;
}

export interface Toast {
    title?: string;
    message: string;
    status?: 'unknown' | 'normal' | 'warning' | 'critical';
}
