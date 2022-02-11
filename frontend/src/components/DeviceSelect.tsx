import { Button, CheckBox, FormField, Select } from 'grommet';
import { Refresh } from 'grommet-icons';
import React from 'react';

import { Device } from '../../../common/src/common';
import { ConnectionHandler } from '../connection-handler';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectDevice } from '../store/device';

function deviceDisplayName(device: Device) {
    let out = [
        device.manufacturer,
        device.pnpId,
    ]
        .filter(str => typeof str === 'string' && !str.startsWith('('))
        .join(' ')
        .trim();

    if (out != '') {
        out = `${out} (${device.path})`.trim();
    } else {
        out = device.path;
    }

    return out;
}

export function DeviceSelect(): JSX.Element {

    const dispatch = useAppDispatch();
    const { devices, measurements, selectedDevice } = useAppSelector(state => state.device);
    const options = devices.filter(device => device.path);

    return (
        <section>
            <div className="form-row">
                <FormField htmlFor="devices" label="Devices" className="flex-auto">
                    <Select
                        options={options}
                        children={(device) => deviceDisplayName(device)}
                        onChange={event => dispatch(selectDevice(event.value))}
                        placeholder="Select Device"
                        id="devices"
                        clear={true}
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

            {selectedDevice != null && <>
                <div className="form-row mt-4 ml-2">
                    <CheckBox
                        checked={measurements}
                        label="Enable Value Measurements"
                        toggle
                        onChange={() => ConnectionHandler.enableMeasurements(!measurements)}
                    />
                </div>
            </>}
        </section>
    );
}
