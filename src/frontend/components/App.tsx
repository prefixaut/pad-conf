import { Button, Form, FormField, Grommet, Header, Heading, Main, TextInput } from 'grommet';
import React from 'react';

import { Device } from '../../api';
import { DeviceManager } from '../device-manager';
import { DeviceSelect } from './DeviceSelect';
import { Editor } from './Editor';
import { ServerSelect } from './ServerSelect';

interface AppState {
    connected: boolean;
    device: Device;
}

export class App extends React.Component<{}, AppState> {
    constructor(props) {
        super(props);

        this.state = {
            connected: false,
            device: null,
        };
    }

    componentDidMount(): void {
        DeviceManager.addCloseHandler(() => {
            this.setState({
                connected: false,
                device: null,
            });
        });
    }

    componentWillUnmount(): void {
        DeviceManager.disconnect();
    }

    updateConnection(connected: boolean) {
        this.setState({
            connected,
        });
    }

    selectDevice(device: Device) {
        this.setState({
            device,
        });
    }

    render(): React.ReactNode {
        const { connected } = this.state;

        return (
            <Grommet themeMode="dark" className="app" cssVars={true}>
                <Header className="app-header">
                    <Heading>Calibrator</Heading>
                </Header>

                <main className="app-body">
                    <div className="container">
                        <ServerSelect
                            onConnect={() => this.updateConnection(true)}
                            onDisconnect={() => this.updateConnection(false)}
                        />

                        <hr className="my-8"/>

                        {this.state.connected && this.renderBody()}
                    </div>
                </main>
            </Grommet>
        );
    }

    renderBody(): React.ReactNode {
        return (
            <>
                <DeviceSelect onDeviceChange={device => this.selectDevice(device)}></DeviceSelect>
                {this.state.device != null && <Editor></Editor>}
            </>
        );
    }
}
