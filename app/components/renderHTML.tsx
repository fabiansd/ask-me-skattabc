import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';

const SafeHtmlRenderer = ({ htmlContent }) => {
  const [safeHtml, setSafeHtml] = useState('');

  useEffect(() => {
    const cleanHtml = DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } });
    setSafeHtml(cleanHtml);
  }, [htmlContent]);

  return <div dangerouslySetInnerHTML={{ __html: safeHtml }} />;
};

export default SafeHtmlRenderer;
