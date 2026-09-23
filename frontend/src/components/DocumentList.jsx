import DownloadButton from './DownloadButton.jsx';

export default function DocumentList({ documents, onDownload, loading }) {
  if (loading) {
    return <p className="status-message">Carregando documentos...</p>;
  }

  if (documents.length === 0) {
    return <p className="status-message">Nenhum documento enviado ainda.</p>;
  }

  return (
    <div className="document-list" aria-live="polite">
      {documents.map((document) => (
        <article className="document-row" key={document.id}>
          <div>
            <h3>{document.originalName}</h3>
            <p>
              {document.size} bytes · enviado em{' '}
              {new Date(document.uploadedAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <DownloadButton documentMetadata={document} onDownload={onDownload} />
        </article>
      ))}
    </div>
  );
}