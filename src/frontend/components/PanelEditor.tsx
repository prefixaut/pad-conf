import { Box, Button, Form, FormField, RangeSelector, Stack, Text } from 'grommet';
import React from 'react';

import { MessageType, Response } from '../../api';
import { KEY_CODE_UNASSIGNED, MAX_VALUE, MIN_VALUE, Panel } from '../../common';
import { ConnectionHandler } from '../connection-handler';
import { store } from '../store';
import { updatePanel } from '../store/device';

interface PanelEditorProps {
    panelIndex: number;
    settings: Panel;
}

interface PanelEditorState extends Panel {
    currentValue: number;
}

export class PanelEditor extends React.Component<PanelEditorProps, PanelEditorState> {

    constructor(props) {
        super(props);
        this.state = {
            deadzoneStart: MIN_VALUE,
            deadzoneEnd: MAX_VALUE,
            keyCode: KEY_CODE_UNASSIGNED,
            currentValue: null,
        };
    }

    componentDidMount(): void {
        ConnectionHandler.addResponseHandler(this.messageHandler);
        ConnectionHandler.addCloseHandler(this.closeHandler);

        // Update the state with the current settings of the panel
        this.setState({
            ...this.props.settings,
        });
    }

    componentWillUnmount(): void {
        ConnectionHandler.removeCloseHandler(this.closeHandler);
        ConnectionHandler.removeResponseHandler(this.messageHandler);
    }

    closeHandler() {
        ConnectionHandler.removeCloseHandler(this.closeHandler);
        ConnectionHandler.removeResponseHandler(this.messageHandler);
    }

    messageHandler(message: Response) {
        switch (message.type) {
            case MessageType.MEASSUREMENT:
                if (message.meassurePanelIndex === this.props.panelIndex) {
                    this.setState({
                        currentValue: message.meassureValue,
                    });
                }
                break;
        }
    }

    updatePanel() {
        const settings = this.state;

        ConnectionHandler.updateSinglePanel(this.props.panelIndex, settings)
            .then(() => store.dispatch(updatePanel({
                index: this.props.panelIndex,
                settings
            })));
    }

    render(): React.ReactNode {
        const { deadzoneStart, deadzoneEnd, keyCode } = this.state;

        return (
            <Form onSubmit={() => this.updatePanel()}>
                <FormField label="Deadzone" htmlFor="input-deadzone">
                    <Stack>
                        <Box direction="row" justify="between">
                            {[MIN_VALUE, MAX_VALUE].map(value => (
                            <Box key={value} pad="small" border={false}>
                                <Text style={{ fontFamily: 'monospace' }}>
                                    {value}
                                </Text>
                            </Box>
                            ))}
                        </Box>
                        <RangeSelector
                            size="full"
                            direction="horizontal"
                            min={MIN_VALUE}
                            max={MAX_VALUE}
                            values={[deadzoneStart, deadzoneEnd]}
                            onChange={event => this.setState({ deadzoneStart: event[0], deadzoneEnd: event[1] })}
                            id="input-deadzone"
                        />
                    </Stack>

                    <Text style={{ fontFamily: 'monospace', textAlign: 'center' }}>
                        {deadzoneStart} - {deadzoneEnd}
                    </Text>
                </FormField>

                <Button type="submit" primary className="btn" label="Apply"></Button>
            </Form>
        );
    }

}
