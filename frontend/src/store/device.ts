import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Device, PadLayout, Panel } from '../../../common/src/common';

interface DeviceStore {
    loading: boolean;
    measurements: boolean;
    devices: Device[];
    selectedDevice: Device | null;
    panels: Panel[];
    selectedPanel: number | null;
    layout: PadLayout | null;
}

const initialState: DeviceStore = {
    loading: false,
    measurements: false,
    devices: [],
    selectedDevice: null,
    panels: [],
    selectedPanel: null,
    layout: null,
};

export const deviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        devices(state, action: PayloadAction<Device[]>) {
            state.devices = action.payload;
        },
        setSelectedDevice(state, action: PayloadAction<Device | null>) {
            state.selectedDevice = action.payload;
        },
        selectDevice(state, action: PayloadAction<Device>) {
            state.loading = true;
            state.selectedDevice = action.payload;
        },
        deviceSelected(state, action: PayloadAction<{ panels: Panel[], layout: PadLayout }>) {
            state.loading = false;
            state.panels = action.payload.panels;
            state.layout = action.payload.layout;
        },
        mesasurements(state, action: PayloadAction<boolean>) {
            if (action.payload != null) {
                state.measurements = action.payload;
            }
        },
        panels(state, action: PayloadAction<Panel[]>) {
            state.panels = action.payload;
        },
        updatePanel(state, action: PayloadAction<{ index: number, settings: Panel }>) {
            state.panels[action.payload.index] = action.payload.settings;
        },
        selectPanel(state, action: PayloadAction<number | null>) {
            state.selectedPanel = action.payload;
        },
        layout(state, action: PayloadAction<PadLayout>) {
            state.layout = action.payload;
        },
    }
});

export const { devices, selectDevice, setSelectedDevice, deviceSelected, mesasurements, panels, updatePanel, selectPanel } = deviceSlice.actions;
export default deviceSlice.reducer;
