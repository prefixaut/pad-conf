import { Button, Form, FormField, Spinner, TextInput } from 'grommet';
import { Close, Connect } from 'grommet-icons';
import React from 'react';
import { DeviceManager } from '../device-manager';

interface ServerSelectProps {
    onConnect?: () => any;
    onDisconnect?: () => any;
}

interface ServerSelectState {
    connected: boolean;
    loading: boolean;
}

export class ServerSelect extends React.Component<ServerSelectProps, ServerSelectState> {

    constructor(props: ServerSelectProps) {
        super(props);
        this.state = {
            connected: DeviceManager.isConnected(),
            loading: false,
        };
    }

    componentDidMount(): void {
        DeviceManager.addCloseHandler(() => {
            this.setState({
                connected: false,
                loading: false,
            });
        });
    }

    connectToBackend(event) {
        console.log(event);
        const url = event.value.url;

        this.setState({
            loading: true,
        });

        DeviceManager.connect(url).then(() => {
            this.setState({
                connected: true,
                loading: false,
            });

            if (typeof this.props.onConnect === 'function') {
                this.props.onConnect();
            }
        }).catch(e => {
            console.error('could not connect to server', e);

            this.setState({
                loading: false,
            });
        });
    }

    disconnectBackend() {
        DeviceManager.disconnect();
        this.setState({
            connected: false,
        });

        if (typeof this.props.onDisconnect === 'function') {
            this.props.onDisconnect();
        }
    }

    render(): React.ReactNode {
        const { connected, loading } = this.state;

        return (
            <>
                <Form onSubmit={(event) => connected ? this.disconnectBackend() : this.connectToBackend(event)}>
                    <div className="form-row">
                        <FormField name="url" htmlFor="url-input" label="Server URL" className="flex-auto">
                            <TextInput disabled={connected || loading} value="ws://localhost:8000/" id="url-input" name="url" />
                        </FormField>
        
                        <div className="my-auto ml-8">
                            <Button
                                className={connected ? "btn btn-error" : "btn"}
                                primary={!connected}
                                label={connected ? "Disconnect" : "Connect"}
                                type="submit"
                                disabled={loading}
                                icon={connected ? <Close/> : <Connect />}
                            />
                        </div>
                    </div>
                </Form>

                {loading && <>
                    <Spinner></Spinner>
                    <div>Connecting to server ...</div>
                </>}
            </>
        );
    }
}
