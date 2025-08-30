import React, { useState, useCallback } from 'react';
import { X, Upload } from 'lucide-react';

interface ImageUploadProgressProps {
  onUpload: (file: File, onProgress?: (progress: number) => void) => Promise<void>;
  onCancel?: () => void;
  accept?: string;
  maxSize?: number; // in MB
}

export const ImageUploadProgress: React.FC<ImageUploadProgressProps> = ({
  onUpload,
  onCancel,
  accept = 'image/*',
  maxSize = 10
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`);
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setSelectedFile(file);
    setError(null);
    handleUpload(file);
  }, [maxSize]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await onUpload(file, (progressValue) => {
        setProgress(progressValue);
      });

      // 업로드 완료
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        setSelectedFile(null);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    setUploading(false);
    setProgress(0);
    setSelectedFile(null);
    setError(null);
    onCancel?.();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {!uploading && !selectedFile && (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              클릭하여 이미지를 선택하세요
            </p>
            <p className="text-xs text-gray-500 mt-1">
              최대 {maxSize}MB
            </p>
          </div>
        </label>
      )}

      {(uploading || selectedFile) && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 mr-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedFile?.name}
              </p>
              {selectedFile && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              )}
            </div>
            {!uploading && (
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                      업로드 중
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-blue-600">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
