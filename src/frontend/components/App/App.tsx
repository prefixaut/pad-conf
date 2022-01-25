import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';

import './App.css';

import { DeviceSelect } from '../DeviceSelect/DeviceSelect';
import { DeviceManager } from '../../device-manager';
import { Editor } from '../Editor/Editor';
import { Device } from '../../../api';

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
    this.disconnectBackend();
  }

  connectToBackend() {
    DeviceManager.connect()
      .then(() => {
        this.setState({
          connected: true,
        });
      });
  }

  disconnectBackend() {
    DeviceManager.disconnect();
  }

  selectDevice(device: Device) {
    this.setState({
      device,
    });
  }

  render(): React.ReactNode {
    return (
      <ChakraProvider>
        <div className="app">
          <header className="app-header">
            Calibrator
          </header>
          <main className="app-body">
            {!this.state.connected ? this.renderConnect() : this.renderBody()}
          </main>
        </div>
      </ChakraProvider>
    );
  }

  renderConnect(): React.ReactNode {
    return (
      <div>
        <button className="btn" onClick={() => this.connectToBackend()}>Connect</button>
      </div>
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

