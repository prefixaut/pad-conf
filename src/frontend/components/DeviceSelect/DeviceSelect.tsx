import React from 'react';

import { Select } from '@chakra-ui/react';

import { DeviceManager } from '../../device-manager';
import { Device } from '../../../api';

interface DeviceManagerProps {
    onDeviceChange?: (device: Device) => any;
}

interface DeviceManagerState {
    loading: boolean;
    devices: Device[];
    selected?: string;
}

export class DeviceSelect extends React.Component<DeviceManagerProps, DeviceManagerState> {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            devices: [],
            selected: null,
        };
    }

    componentDidMount(): void {
        this.setState({
            loading: true,
        });

        DeviceManager.addMesssageHandler(msg => {
            switch (msg.type) {
                case 'list':
                    const deviceLost = this.state.selected != null
                        && msg.devices.filter(d => d.path === this.state.selected).length === 0;

                    this.setState({
                        loading: false,
                        devices: msg.devices,
                        selected: deviceLost ? null : this.state.selected,
                    });
                    break;
            }
        });

        DeviceManager.refresh()
            .then(() => DeviceManager.listDevices())
            .then(devices => {
                this.setState({
                    devices,
                });
            })
    }

    selectDevice(event) {
        const device = event.target.value;
        DeviceManager.selectDevice(device)
            .then(() => {
                this.setState({
                    selected: device,
                });
                if (typeof this.props.onDeviceChange === 'function') {
                    this.props.onDeviceChange(device);
                }
            })
    }

    render(): React.ReactNode {
        return (
            <section>
                <Select variant='flushed' onChange={e => this.selectDevice(e)}>
                    <option value="">{/** Nothing, to make it possible to unselect it */}</option>
                    {this.state.devices.filter(device => device.path).map(device => (
                        <option value={device.path} key={device.path}>{device.vendorId} {device.productId} ({device.path})</option>
                    ))}
                </Select>
            </section>
        );
    }
}
