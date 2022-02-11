import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BackendState {
    url: string | null;
    connected: boolean;
    loading: boolean;
}

const initialState: BackendState = {
    url: null,
    connected: false,
    loading: false,
};

export const backendSlice = createSlice({
    name: 'backend',
    initialState,
    reducers: {
        connect(state, action: PayloadAction<string>) {
            state.url = action.payload;
            state.connected = false;
            state.loading = true;
        },
        connected(state) {
            state.connected = true;
            state.loading = false;
        },
        disconnect(state) {
            state.url = null;
            state.connected = false;
            state.loading = false;
        }
    }
});

export const { connect: connectToBackend, connected: setConnectedToBackend, disconnect: disconnectFromBackend } = backendSlice.actions;
export default backendSlice.reducer;
