export enum MessageType {
    /** Response Message-Type the server sends back when it has successfully processed the initial request */
    CONFIRMATION = 'confirmation',
    /** Request Message-Type to get all currently available devices */
    LIST_DEVICES = 'list-devices',
    /** Request Message-Type to select a certain device for the socket */
    SELECT_DEVICE = 'select-device',
    /** Server Message-Type when the currently selected device has been disconnected */
    DEVICE_DISCONNECT = 'device-disconnect',
    /** Reqeust & Server Message-Type to enable/disable meassurements and it's meassure */
    MEASSUREMENT = 'meassurement',
}

export type Message =
    | ConfirmationBaseMessage
    | ListDevicesMessage
    | SelectDeviceRequest
    | MeassurementMessage
    ;

export type Response =
    | ConfirmationBaseMessage
    | ListDevicesResponse
    | SimpleResponse
    ;

export interface BaseMessage {
    type: MessageType;
}

export interface ConfirmationBaseMessage extends BaseMessage {
    type: MessageType.CONFIRMATION;
    confirmationType: MessageType;
    confirmationSuccess: boolean;
}

export interface SimpleResponse extends BaseMessage {
    type:
        | MessageType.DEVICE_DISCONNECT
        ;
}

export interface ListDevicesRequest extends BaseMessage {
    type: MessageType.LIST_DEVICES;
}

export interface ListDevicesResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.LIST_DEVICES;
    devices: Device[];
}

export type ListDevicesMessage = ListDevicesRequest | ListDevicesResponse;

export interface SelectDeviceRequest extends BaseMessage {
    type: MessageType.SELECT_DEVICE;
    devicePath: string;
}

export type MeassurementMessage = MeassurementRequest | MeassurementResponse;

export interface MeassurementBaseMessage extends BaseMessage {
    type: MessageType.MEASSUREMENT;
}

export interface MeassurementRequest extends MeassurementBaseMessage {
    meassureEnable: boolean;
}

export interface MeassurementResponse extends MeassurementBaseMessage {
    meassureValue: number;
    meassurePanelPin: number;
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

export type PadType = 'ddr' | 'pump' | 'dance';
