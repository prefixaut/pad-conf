import { Button, Form, FormField, Spinner, TextInput } from 'grommet';
import { Close, Connect } from 'grommet-icons';
import React from 'react';

import { ConnectionHandler } from '../connection-handler';
import { useAppDispatch, useAppSelector } from '../hooks';
import { connectToBackend } from '../store/backend';

export function ServerSelect(): JSX.Element {

    const { connected, loading } = useAppSelector(state => state.backend);
    const dispatch = useAppDispatch();

    function connect(event) {
        const url = event.value.url;

        dispatch(connectToBackend(url));
    }

    function disconnect() {
        ConnectionHandler.disconnect();
    }

    return (
        <>
            <Form onSubmit={(event) => connected ? disconnect() : connect(event)}>
                <div className="form-row">
                    <FormField name="url" htmlFor="url" label="Server URL" className="flex-auto">
                        <TextInput disabled={connected || loading} value="ws://localhost:8000/" id="url" name="url" />
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
