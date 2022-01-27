import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Device } from '../../api';
import { Panel } from '../common';

interface DeviceStore {
    devices: Device[];
    selectedDevice?: Device;
    panels: Panel[];
    selectedPanel?: number;
}

const initialState: DeviceStore = {
    devices: [],
    selectedDevice: null,
    panels: [],
    selectedPanel: null,
};

export const deviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        setDevices(state, action: PayloadAction<Device[]>) {
            state.devices = action.payload;
        },
        setSelectedDevice(state, action: PayloadAction<Device>) {
            state.selectedDevice = action.payload;
        },
        setPanels(state, action: PayloadAction<Panel[]>) {
            state.panels = action.payload;
        },
        setSelectedPanel(state, action: PayloadAction<number>) {
            state.selectedPanel = action.payload;
        },
    }
});

export const { setDevices, setSelectedDevice, setPanels, setSelectedPanel } = deviceSlice.actions;
export default deviceSlice.reducer;
