import { notFound } from 'next/navigation';

import { MOCK_SOURCES } from '../../../tests/mockData';

import SourcesPreviewClient from './SourcesPreviewClient';

// Evaluate the env-var gate at request time (not build time) so this page can
// ship in the production bundle while remaining 404 unless ENABLE_DEV_PREVIEWS
// is explicitly set on the running server.
export const dynamic = 'force-dynamic';

// The /dev/* routes are only available when ENABLE_DEV_PREVIEWS=true. This
// keeps dev preview pages out of the production app even if they ship in the
// deployed bundle.
export default function SourcesPreviewPage() {
  if (process.env.ENABLE_DEV_PREVIEWS !== 'true') {
    notFound();
  }

  return <SourcesPreviewClient initialSources={MOCK_SOURCES} />;
}
