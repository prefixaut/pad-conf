import React from 'react';

import { PIN_UNASSIGNED } from '../../common';
import { useAppDispatch, useAppSelector } from '../hooks';
import { selectPanel } from '../store/device';

export function PadDisplay(): JSX.Element {
    const { layout, selectedPanel } = useAppSelector(state => state.device);

    let index = 0;
    const renderedPanels = layout.map((pin, position) => {
        let out: any = (<div className="panel" key={position}></div>);
        if (pin !== PIN_UNASSIGNED) {
            out = renderPanel(index, selectedPanel, position);
            index++;
        }

        return out;
    });

    return (
        <div className="pad-display">
            {renderedPanels}
        </div>
    );
}

function renderPanel(index: number, selectedPanel: number, position: number): React.ReactNode {
    const dispatch = useAppDispatch();
    const classes = ['btn'];

    if (selectedPanel === index) {
        classes.push('active');
    }

    return (
        <div className="panel input" key={position}>
            <button className={classes.join(' ')} onClick={() => dispatch(selectPanel(index))}>
                <code>{getCharForPosition(position)}</code>
            </button>
        </div>
    );
}

function getCharForPosition(position: number) {
    switch (position) {
        case 0:
            return '↖';
        case 1:
            return'↑';
        case 2:
            return'↗';
        case 3:
            return '←';
        case 4:
            return '■';
        case 5:
            return '→';
        case 6:
            return '↙';
        case 7:
            return '↓';
        case 8:
            return '↘';
    }
}
