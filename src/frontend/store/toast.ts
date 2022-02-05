import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Toast } from '../models/toast';

interface ToastState {
    openToasts: Toast[];
}

const initialState: ToastState = {
    openToasts: [],
};

export const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        open(state, action: PayloadAction<Toast>) {
            if (state.openToasts.includes(action.payload)) {
                return;
            }
            state.openToasts.push(action.payload);
        },
        close(state, action: PayloadAction<Toast>) {
            const index = state.openToasts.indexOf(action.payload);
            if (index !== -1)  {
                state.openToasts = [
                    ...state.openToasts.slice(0, index),
                    ...state.openToasts.slice(index),
                ];
            }
        },
        closeAll(state) {
            state.openToasts = [];
        },
    }
});

export const { open: openToast, close: closeToast, closeAll: closeAllToasts } = toastSlice.actions;
export default toastSlice.reducer;
