import { Notification } from 'grommet';
import React from 'react';

import { useAppDispatch, useAppSelector } from '../hooks';
import { closeToast } from '../store/toast';

export function ToastHub(): JSX.Element {
    const openToasts = useAppSelector(state => state.toast.openToasts);
    const dispatch = useAppDispatch();

    return (
        <>
            {openToasts.map((toast, index) => <Notification
                key={index}
                toast
                title={toast.title}
                message={toast.message}
                status={toast.status}
                onClose={() => dispatch(closeToast(toast))}
            />)}
        </>
    )
}
