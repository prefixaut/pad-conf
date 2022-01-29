import React from 'react';
import { useAppSelector } from '../hooks';

import { PadDisplay } from './PadDisplay';

export function Editor(): JSX.Element {
    const { loading } = useAppSelector(state => state.device);

    return (
        <section className="editor container">
            <main className="editor-content">

            </main>

            <aside className="input-display">
                {!loading && <PadDisplay />}
            </aside>
        </section>
    );
}

