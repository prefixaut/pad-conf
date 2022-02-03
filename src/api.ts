import { Device, PadLayout, Panel } from './common';

export enum MessageType {
    /** Response Message-Type the server sends back when it has successfully processed the initial request */
    CONFIRMATION = 'confirmation',
    /** Request Message-Type to get all currently available devices */
    LIST_DEVICES = 'list-devices',
    /** Request Message-Type to select a certain device for the socket */
    SELECT_DEVICE = 'select-device',
    /** Server Message-Type when the currently selected device has been disconnected */
    DEVICE_DISCONNECT = 'device-disconnect',
    /** Message to enable/disable the measurements */
    SET_MEASUREMENT = 'set-measurement',
    /** Message to get the measurements status */
    GET_MEASUREMENT = 'get-measurement',
    /** Server Message to display the current value of a pad */
    MEASUREMENT_VALUE = 'measurement-value',
    /** Message to get a single panel's settings */
    GET_PANEL = 'get-panel',
    /** Message to update a single panel's settings */
    UPDATE_PANEL = 'update-panel',
    /** Message to reset the entire devices' settings */
    RESET_SETTINGS = 'reset-settings',
    /** Message to save the entire devices' settings */
    SAVE_SETTINGS = 'save-settings',
    /** Message to get the layout of the device */
    GET_LAYOUT = 'get-layout',
}

export type Message = Request | Response;

export type Request =
    | SimpleRequest
    | SelectDeviceRequest
    | SetMeasurementRequest
    | GetPanelRequest
    | UpdatePanelRequest
    ;

export type Response =
    | SimpleResponse
    | ListDevicesResponse
    | SelectDeviceResponse
    | DeviceDisconnectMessage
    | GetMeasurementResponse
    | SetMeasurementResponse
    | MeasurementValueMessage
    | GetPanelResponse
    | UpdatePanelResponse
    | GetLayoutResponse
    ;

export interface BaseMessage {
    type: MessageType;
}

export interface ConfirmationBaseMessage extends BaseMessage {
    type: MessageType.CONFIRMATION;
    confirmationType: MessageType;
    confirmationSuccess: boolean;
}

export interface SimpleRequest extends BaseMessage {
    type:
    | MessageType.LIST_DEVICES
    | MessageType.GET_MEASUREMENT
    | MessageType.RESET_SETTINGS
    | MessageType.SAVE_SETTINGS
    | MessageType.GET_LAYOUT
    ;
}

export interface SimpleResponse extends ConfirmationBaseMessage {
    confirmationType:
    | MessageType.RESET_SETTINGS
    | MessageType.SAVE_SETTINGS
    ;
}

export interface ListDevicesResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.LIST_DEVICES;
    devices: Device[];
}

export interface SelectDeviceRequest extends BaseMessage {
    type: MessageType.SELECT_DEVICE;
    devicePath: string;
}

export interface SelectDeviceResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.SELECT_DEVICE;
    panels: Panel[];
    panelCount: number;
    layout: PadLayout;
}

export interface DeviceDisconnectMessage extends BaseMessage {
    type: MessageType.DEVICE_DISCONNECT;
}

export interface SetMeasurementRequest extends BaseMessage {
    type: MessageType.SET_MEASUREMENT;
    measureEnable: boolean;
}

export interface SetMeasurementResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.SET_MEASUREMENT;
    isEnabled: boolean;
}

export interface GetMeasurementResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.GET_MEASUREMENT;
    isEnabled: boolean;
}

export interface MeasurementValueMessage extends BaseMessage {
    type: MessageType.MEASUREMENT_VALUE;
    meassureValue: number;
    meassurePanelIndex: number;
}

export interface GetPanelRequest extends BaseMessage {
    type: MessageType.GET_PANEL;
    panelIndex: number;
}

export interface GetPanelResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.GET_PANEL;
    panelIndex: number;
    settings: Panel;
}

export interface UpdatePanelRequest extends BaseMessage {
    type: MessageType.UPDATE_PANEL;
    panelIndex: number;
    settings: Panel;
}

export interface UpdatePanelResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.UPDATE_PANEL;
    panelIndex: number;
}

export interface GetLayoutResponse extends ConfirmationBaseMessage {
    confirmationType: MessageType.GET_LAYOUT;
    layout: PadLayout;
}
