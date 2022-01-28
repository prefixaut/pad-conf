import { Button, FormField, Select } from 'grommet';
import { Refresh } from 'grommet-icons';
import React from 'react';

import { ConnectionHandler } from '../connection-handler';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectDevice } from '../store/device';

export function DeviceSelect(): JSX.Element {

    const dispatch = useAppDispatch();
    const devices = useAppSelector(state => state.device.devices);
    const options = devices.filter(device => device.path);

    return (
        <section>
            <div className="form-row">
                <FormField htmlFor="devices" label="Devices" className="flex-auto">
                    <Select
                        options={options}
                        children={(device) => `${device.vendorId} ${device.productId} $({device.path})`}
                        onChange={event => dispatch(selectDevice(event.value))}
                        placeholder="Select Device"
                        id="devices"
                        clear
                    />
                </FormField>

                <div className="my-auto ml-8">
                    <Button
                        icon={<Refresh></Refresh>}
                        primary
                        label="Reload"
                        onClick={() => ConnectionHandler.listDevices()}
                    />
                </div>
            </div>
        </section>
    );
}
