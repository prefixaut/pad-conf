import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Device } from '../../api';
import { PadLayout, Panel } from "../../common";

interface DeviceStore {
    loading: boolean;
    devices: Device[];
    selectedDevice?: Device;
    panels: Panel[];
    selectedPanel?: number;
    layout?: PadLayout;
}

const initialState: DeviceStore = {
    loading: false,
    devices: [],
    selectedDevice: null,
    panels: [],
    selectedPanel: null,
};

export const deviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        devices(state, action: PayloadAction<Device[]>) {
            state.devices = action.payload;
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
        panels(state, action: PayloadAction<Panel[]>) {
            state.panels = action.payload;
        },
        selectPanel(state, action: PayloadAction<number>) {
            state.selectedPanel = action.payload;
        },
        layout(state, action: PayloadAction<PadLayout>) {
            state.layout = action.payload;
        },
    }
});

export const { devices, selectDevice, deviceSelected, panels, selectPanel } = deviceSlice.actions;
export default deviceSlice.reducer;
