export interface Toast {
    title?: string;
    message: string;
    status?: 'unknown' | 'normal' | 'warning' | 'critical';
    expire?: number;
}
