import { useEffect, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import {
  downloadDocument,
  listDocuments,
  uploadDocument,
} from './services/api.js';
import './App.css';

export default function App() {
  const [userId, setUserId] = useState('user-1');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function refreshDocuments() {
    setLoading(true);
    setError('');
    try {
      setDocuments(await listDocuments(userId));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshDocuments();
  }, [userId]);

  async function handleUpload(file) {
    setIsUploading(true);
    setError('');
    try {
      await uploadDocument(file, userId);
      await refreshDocuments();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(documentMetadata) {
    setError('');
    try {
      const blob = await downloadDocument(documentMetadata.id, userId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentMetadata.originalName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="app-shell">
      <div className="app-content">
        <span className="eyebrow">Arquivo pessoal</span>
        <h1>Seus documentos, em um só lugar.</h1>
        <p className="intro">
          Envie arquivos, acompanhe o que está armazenado e baixe uma cópia quando precisar.
        </p>

        <section className="toolbar" aria-label="Identificação do usuário">
          <div>
            <label htmlFor="user-id">Usuário</label>
            <input
              id="user-id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Informe seu identificador"
            />
          </div>
          <button type="button" onClick={refreshDocuments} disabled={loading || !userId}>
            Atualizar lista
          </button>
        </section>

        {error && <p className="error-message" role="alert">{error}</p>}

        <UploadComponent onUpload={handleUpload} disabled={isUploading || !userId} />

        <section className="documents-panel">
          <h2>Documentos enviados</h2>
          <DocumentList
            documents={documents}
            onDownload={handleDownload}
            loading={loading}
          />
        </section>
      </div>
    </main>
  );
}
