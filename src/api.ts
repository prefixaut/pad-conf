export interface Message {
    type: MessageType;
    confirmationType?: MessageType;
    confirmationSuccess?: boolean;
    devicePath?: string;
    command?: string;
    devices?: Device[];
    meassureValue?: number;
    meassurePanelIndex?: number;
}

export interface Device {
    path: string;
    manufacturer?: string | undefined;
    serialNumber?: string | undefined;
    pnpId?: string | undefined;
    locationId?: string | undefined;
    productId?: string | undefined;
    vendorId?: string | undefined;
}

export type MessageType = 'confirmation' | 'refresh' | 'list' | 'select' | 'command' | 'meassurement';