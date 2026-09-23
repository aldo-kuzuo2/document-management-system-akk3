import { useState } from 'react';

export default function DownloadButton({ documentMetadata, onDownload }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await onDownload(documentMetadata);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button type="button" className="secondary-button" onClick={handleDownload} disabled={isDownloading}>
      {isDownloading ? 'Baixando...' : 'Baixar'}
    </button>
  );
}