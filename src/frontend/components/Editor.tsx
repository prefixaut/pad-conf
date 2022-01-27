import React from 'react';

import { Panel } from '../common';
import { PadDisplay } from './PadDisplay';

interface EditorProps {}

interface EditorState {
    panels: Panel[];
    selectedPanel: number;
}

export class Editor extends React.Component<EditorProps, EditorState> {
    constructor(props) {
        super(props);

        this.state = {
            panels: [],
            selectedPanel: null,
        };
    }

    selectPanelIndex(index: number) {
        this.setState({
            selectedPanel: index,
        });
    }

    render(): React.ReactNode {
        return (
            <section className="editor container">
                <main className="editor-content">

                </main>

                <aside className="input-display">
                    <PadDisplay
                        type="ddr"
                        panels={this.state.panels}
                        selectedPanel={this.state.selectedPanel}
                        onPanelSelect={(index) => this.selectPanelIndex(index)}
                    ></PadDisplay>
                </aside>
            </section>
        );
    }
}
