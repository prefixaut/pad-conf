import React from 'react';

import { PadType } from '../../api';
import { PanelSettings } from '../common';

interface PadDisplayProps {
    type: PadType;
    panels: PanelSettings[];
    selectedPanel: number;
    onPanelSelect?: (index: number, panel: PanelSettings) => any;
}

export function PadDisplay(props: PadDisplayProps): JSX.Element {
    switch (props.type) {
        case 'ddr':
            return (
                <div className="pad-display ddr">
                    <div className="panel"></div>
                    {renderPanel(0, '↑', props)}
                    <div className="panel"></div>
                    {renderPanel(1, '←', props)}
                    <div className="panel"></div>
                    {renderPanel(2, '→', props)}
                    <div className="panel"></div>
                    {renderPanel(3, '↓', props)}
                    <div className="panel"></div>
                </div>
            );

        case 'pump':
            return (
                <div className="pad-display pump">
                    {renderPanel(0, '↖', props)}
                    <div className="panel"></div>
                    {renderPanel(1, '↗', props)}
                    <div className="panel"></div>
                    {renderPanel(2, '■', props)}
                    <div className="panel"></div>
                    {renderPanel(3, '↙', props)}
                    <div className="panel"></div>
                    {renderPanel(4, '↘', props)}
                </div>
            );

        case 'dance':
            return (
                <div className="pad-display dance">
                    {renderPanel(0, '↖', props)}
                    {renderPanel(1, '↑', props)}
                    {renderPanel(2, '↗', props)}
                    {renderPanel(3, '←', props)}
                    <div className="panel"></div>
                    {renderPanel(4, '→', props)}
                    <div className="panel"></div>
                    {renderPanel(5, '↓', props)}
                    <div className="panel"></div>
                </div>
            );

        default:
            return <div>Invalid PAD type "{props.type}" provided!</div>;
    }
}

function renderPanel(index: number, text: string, props: PadDisplayProps): React.ReactNode {
    const classes = ['btn'];
    if (props.selectedPanel === index) {
        classes.push('active');
    }

    function callPanelSelect() {
        if (typeof props.onPanelSelect === 'function') {
            props.onPanelSelect(index, props.panels[index]);
        }
    }

    return (
        <div className="panel input">
            <button className={classes.join(' ')} onClick={() => callPanelSelect()}>
                <code>{text}</code>
            </button>
        </div>
    );
}
