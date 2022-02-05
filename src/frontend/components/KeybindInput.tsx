import React from 'react';
import { Key, KEY_ALT, KEY_ALT_GRAPH, KEY_CTRL, KEY_SHIFT } from '../models/keys';

interface KeybindInputProps {
    allowAccelerators?: boolean;
    onChange?: (keys: Key | Key[]) => any;
    value: Key | Key[];
}

interface KeybindInputState {
    altRightPressed: boolean;
}

export class KeybindInput extends React.Component<KeybindInputProps, KeybindInputState> {

    constructor(props) {
        super(props);
        this.state = {
            altRightPressed: false,
        };
    }

    handleKey(event: React.KeyboardEvent<HTMLDivElement>) {
        // Ignore the Tab-Key
        if (event.key === 'Tab') {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        const keys: Key[] = [];

        if ((
            event.key === 'Control' ||
            event.key === 'Alt' ||
            event.key === 'Shift'
        )) {
            return;
        }

        if (this.props.allowAccelerators) {
            if (event.ctrlKey) {
                keys.push(KEY_CTRL);
            }
            if (event.shiftKey) {
                keys.push(KEY_SHIFT);
            }
            if (event.altKey) {
                keys.push(KEY_ALT);
            }
            if (this.state.altRightPressed) {
                keys.push(KEY_ALT_GRAPH);
            }
            if (event.code === 'AltRight') {
                this.setState({
                    altRightPressed: true,
                });
                return;
            }
        }

        switch (event.key) {
            case 'Shift':
            case 'Alt':
            case 'Super':
            case 'Ctrl':
            case 'AltGraph':
                // Skip accelerators, as they are handled above
                break;
            default:
                keys.push({
                    code: event.code,
                    key: event.key,
                    keyCode: event.keyCode,
                });
        }

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(keys);
        }
    }

    handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.code === 'AltGraph') {
            this.setState({
                altRightPressed: false,
            });
        }
    }

    render() {
        const { value } = this.props;
        const displayText = (Array.isArray(value) ? value : [value])
            .map(key => key?.key)
            .filter(value => value != null)
            .join(' + ');

        return (
            <div className="keybind-input">
                <div
                    ref="content"
                    contentEditable={true}
                    className="content"
                    tabIndex={0}
                    onKeyDown={event => this.handleKey(event)}
                    onKeyUp={event => this.handleKeyUp(event)}
                />
                <div className="value">{displayText}</div>
            </div>
        );
    }
}
