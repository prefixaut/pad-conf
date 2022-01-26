import { Select } from 'grommet';
import React from 'react';

import { Device } from '../../api';
import { DeviceManager } from '../device-manager';

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
                    const deviceLost =
                        this.state.selected != null &&
                        msg.devices.filter(d => d.path === this.state.selected).length === 0;

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
            });
    }

    selectDevice(event) {
        const device = event.value;

        DeviceManager.selectDevice(device).then(() => {
            this.setState({
                selected: device,
            });
            if (typeof this.props.onDeviceChange === 'function') {
                this.props.onDeviceChange(device);
            }
        });
    }

    render(): React.ReactNode {
        const options = this.state.devices
            .filter(device => device.path);

        return (
            <section>
                <Select
                    options={options}
                    children={(device) => `${device.vendorId} ${device.productId} $({device.path})`}
                    onChange={e => this.selectDevice(e)}
                />
            </section>
        );
    }
}
