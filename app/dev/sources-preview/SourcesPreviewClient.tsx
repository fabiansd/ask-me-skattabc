'use client';

import { useState } from 'react';

import { ESDocument } from '../../src/clients/esUtil';
import SourcesSidebar from '../../src/components/navigation/SourcesSidebar';


interface SourcesPreviewClientProps {
  initialSources: ESDocument[];
}

export default function SourcesPreviewClient({ initialSources }: SourcesPreviewClientProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Sources sidebar preview</h1>
      <p className="text-sm text-base-content/70 mb-4">
        Dev-only page for visual testing of the SourcesSidebar at different viewport widths.
      </p>
      <button className="btn btn-primary btn-sm" onClick={() => setIsOpen(v => !v)}>
        {isOpen ? 'Skjul kilder' : 'Vis kilder'}
      </button>

      <SourcesSidebar
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}
        messageId={1}
        initialSources={initialSources}
      />
    </div>
  );
}
