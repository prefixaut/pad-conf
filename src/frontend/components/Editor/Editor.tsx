import React from 'react';

import './Editor.css';

import { PannelSettings } from '../../common';

interface EditorProps {

}

interface EditorState {
    panels: PannelSettings[];
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
            <section className="editor">
                <main className="editor-content">

                </main>
                <aside className="pad-grid">
                    <div className="panel"></div>
                    {this.renderPanel(0, '↑')}
                    <div className="panel"></div>
                    {this.renderPanel(1, '←')}
                    <div className="panel"></div>
                    {this.renderPanel(3, '→')}
                    <div className="panel"></div>
                    {this.renderPanel(2, '↓')}
                    <div className="panel"></div>
                </aside>
            </section>
        );
    }

    renderPanel(index: number, text: string): React.ReactNode {
        const classes = ['btn'];
        if (this.state.selectedPanel === index) {
          classes.push('active');
        }
    
        return (
          <div className="panel">
            <button
              className={classes.join(' ')}
              onClick={() => this.selectPanelIndex(index)}
            >
              <span>{text}</span>
            </button>
          </div>
        );
      }
}
