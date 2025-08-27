// 이미지 업로드 유틸리티
export const uploadImage = async (
  file: File, 
  type: 'sketch' | 'artwork',
  projectId: number,
  sceneId: number
) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);
  formData.append('projectId', projectId.toString());
  formData.append('sceneId', sceneId.toString());

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('업로드 실패');
  }

  return response.json();
};

export const deleteImage = async (filename: string) => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${API_URL}/api/upload/${filename}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('삭제 실패');
  }

  return response.json();
};

export const getStorageInfo = async () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${API_URL}/api/storage-info`);
  
  if (!response.ok) {
    throw new Error('스토리지 정보 가져오기 실패');
  }

  return response.json();
};
