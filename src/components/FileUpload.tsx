import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Image, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  existingFiles?: Array<{ name: string; url: string; id: string }>;
  onRemoveFile?: (fileId: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  existingFiles = [],
  onRemoveFile,
}) => {
  const [uploadError, setUploadError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError('');
    
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        setUploadError(`Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      } else if (error.code === 'file-invalid-type') {
        setUploadError('Tipo de arquivo não suportado');
      } else {
        setUploadError('Erro no upload do arquivo');
      }
      return;
    }

    if (existingFiles.length + acceptedFiles.length > maxFiles) {
      setUploadError(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    onFilesSelected(acceptedFiles);
  }, [onFilesSelected, maxFiles, maxSize, existingFiles.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles,
    maxSize,
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image size={20} className="text-blue-400" />;
    }
    return <FileText size={20} className="text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {isDragActive ? (
          <p className="text-blue-400">Solte os arquivos aqui...</p>
        ) : (
          <div>
            <p className="text-gray-300 mb-1">
              Clique ou arraste arquivos para fazer upload
            </p>
            <p className="text-gray-500 text-sm">
              Máximo {maxFiles} arquivos, {(maxSize / 1024 / 1024).toFixed(1)}MB cada
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Formatos: Imagens, PDF, DOC, DOCX
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
          <AlertCircle size={16} />
          <span className="text-sm">{uploadError}</span>
        </div>
      )}

      {/* Existing files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Arquivos anexados:</h4>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <span className="text-gray-300 text-sm">{file.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(file.url, '_blank')}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Ver
                  </button>
                  {onRemoveFile && (
                    <button
                      onClick={() => onRemoveFile(file.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;