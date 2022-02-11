import { Grommet, Header, Heading } from 'grommet';
import React from 'react';

import { Device } from '../../../common/src/common';
import { useAppSelector } from '../hooks';
import { DeviceSelect } from './DeviceSelect';
import { Editor } from './Editor';
import { ServerSelect } from './ServerSelect';
import { ToastHub } from './ToastHub';

export function App(): JSX.Element {
    const connected = useAppSelector(state => state.backend.connected);
    const { selectedDevice } = useAppSelector(state => state.device);

    return (
        <Grommet themeMode="dark" className="app" cssVars={true}>
            <Header className="app-header">
                <Heading>Calibrator</Heading>
            </Header>

            <main className="app-body">
                <div className="container">
                    <ServerSelect />

                    {connected && renderBody(selectedDevice)}
                </div>
            </main>

            <ToastHub />
        </Grommet>
    );
}

function renderBody(device: Device | null): React.ReactNode {
    return (
        <>
            <DeviceSelect />
            {device != null && <>
                <hr className="my-8"/>
                <Editor />
            </>}
        </>
    );
}
