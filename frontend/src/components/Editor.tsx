import React from 'react';

import { useAppSelector } from '../hooks';
import { PadDisplay } from './PadDisplay';
import { PanelEditor } from './PanelEditor';

export function Editor(): JSX.Element {
    const { loading, selectedPanel, panels, measurements } = useAppSelector(state => state.device);

    return (
        <section className="editor container">
            <main className="editor-content">
                {selectedPanel != null && <PanelEditor
                    panelIndex={selectedPanel}
                    settings={panels[selectedPanel]}
                    measurementEnabled={measurements}
                />}
                {selectedPanel == null && <>
                    Please select a Panel first!
                </>}
            </main>

            <aside className="input-display">
                {!loading && <PadDisplay />}
            </aside>
        </section>
    );
}

