import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Device } from '../../api';
import { Panel } from '../common';

interface DeviceStore {
    loading: boolean;
    devices: Device[];
    selectedDevice?: Device;
    panels: Panel[];
    selectedPanel?: number;
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
            state.selectedDevice = action.payload;
        },
        panels(state, action: PayloadAction<Panel[]>) {
            state.panels = action.payload;
        },
        selectPanel(state, action: PayloadAction<number>) {
            state.selectedPanel = action.payload;
        },
    }
});

export const { devices, selectDevice, panels, selectPanel } = deviceSlice.actions;
export default deviceSlice.reducer;
