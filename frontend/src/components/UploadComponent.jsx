import { useState } from 'react';

export default function UploadComponent({ onUpload, disabled = false }) {
  const [file, setFile] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      return;
    }

    await onUpload(file);
    setFile(null);
    event.target.reset();
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label htmlFor="document-file">Escolha um documento</label>
      <div className="upload-controls">
        <input
          id="document-file"
          type="file"
          onChange={(event) => setFile(event.target.files[0] || null)}
          disabled={disabled}
        />
        <button type="submit" disabled={!file || disabled}>
          {disabled ? 'Enviando...' : 'Enviar documento'}
        </button>
      </div>
      {file && <span className="selected-file">Selecionado: {file.name}</span>}
    </form>
  );
}