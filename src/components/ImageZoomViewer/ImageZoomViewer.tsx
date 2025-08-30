import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface ImageZoomViewerProps {
  imageUrl: string;
  imageType: 'sketch' | 'artwork';
  onClose: () => void;
}

const ImageZoomViewer: React.FC<ImageZoomViewerProps> = ({ imageUrl, imageType, onClose }) => {
  const [scale, setScale] = useState(100); // 퍼센트
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cursor, setCursor] = useState('grab');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 미리 정의된 줌 레벨
  const zoomLevels = [50, 75, 100, 125, 150, 200, 300, 400];

  // 줌 인/아웃 함수
  const handleZoomIn = useCallback(() => {
    const currentIndex = zoomLevels.findIndex(level => level >= scale);
    if (currentIndex < zoomLevels.length - 1) {
      setScale(zoomLevels[currentIndex + 1]);
    }
  }, [scale]);

  const handleZoomOut = useCallback(() => {
    // 현재 scale과 가장 가까운 zoomLevel의 인덱스를 찾기
    let currentIndex = -1;
    for (let i = 0; i < zoomLevels.length; i++) {
      if (zoomLevels[i] >= scale) {
        currentIndex = i;
        break;
      }
    }
    
    // 현재 scale이 모든 zoomLevel보다 큰 경우
    if (currentIndex === -1) {
      currentIndex = zoomLevels.length - 1;
    }
    
    // 이전 레벨로 축소
    if (currentIndex > 0) {
      setScale(zoomLevels[currentIndex - 1]);
    } else {
      // 이미 최소 레벨인 경우
      setScale(zoomLevels[0]);
    }
  }, [scale]);

  // 줌 레벨 직접 선택
  const handleZoomLevel = (level: number) => {
    setScale(level);
  };

  // 리셋 함수
  const handleReset = () => {
    setScale(100);
    setPosition({ x: 0, y: 0 });
  };

  // 마우스 휠 줌
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  }, [handleZoomIn, handleZoomOut]);

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 100) {
      setIsDragging(true);
      setCursor('grabbing');
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // 드래그 중
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  // 드래그 종료
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setCursor(scale > 100 ? 'grab' : 'default');
  }, [scale]);

  // 이벤트 리스너 설정
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  // 커서 업데이트
  useEffect(() => {
    setCursor(scale > 100 ? 'grab' : 'default');
  }, [scale]);

  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleZoomIn, handleZoomOut]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
      {/* 상단 툴바 */}
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            {/* 이미지 타입 표시 */}
            <div className="bg-white bg-opacity-20 text-white px-3 py-1 rounded">
              {imageType === 'sketch' ? '초안' : '아트워크'}
            </div>
            
            {/* 줌 컨트롤 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="축소 (-)"
              >
                <ZoomOut size={20} />
              </button>
              
              {/* 줌 레벨 선택 */}
              <select
                value={scale}
                onChange={(e) => handleZoomLevel(Number(e.target.value))}
                className="bg-white bg-opacity-20 text-white px-3 py-1 rounded border border-white border-opacity-30 focus:outline-none focus:bg-opacity-30"
              >
                {zoomLevels.map(level => (
                  <option key={level} value={level} className="bg-black">
                    {level}%
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleZoomIn}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="확대 (+)"
              >
                <ZoomIn size={20} />
              </button>
              
              <div className="w-px h-6 bg-white bg-opacity-30" />
              
              <button
                onClick={handleReset}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                title="원래 크기로 (0)"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            
            {/* 드래그 가능 표시 */}
            {scale > 100 && (
              <div className="flex items-center space-x-2 text-white text-sm opacity-70">
                <Move size={16} />
                <span>드래그로 이동 가능</span>
              </div>
            )}
          </div>
          
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            title="닫기 (ESC)"
          >
            <X size={24} />
          </button>
        </div>
      </div>
      
      {/* 이미지 컨테이너 */}
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        style={{ cursor }}
        onMouseDown={handleMouseDown}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale / 100})`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
            transformOrigin: 'center'
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={imageType === 'sketch' ? '초안' : '아트워크'}
            className="max-w-none select-none"
            draggable={false}
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
      
      {/* 하단 도움말 */}
      <div className="absolute bottom-4 left-4 text-white text-sm opacity-70">
        <div className="flex items-center space-x-4">
          <span>마우스 휠: 확대/축소</span>
          <span>•</span>
          <span>+/-: 확대/축소</span>
          <span>•</span>
          <span>0: 원래 크기</span>
          <span>•</span>
          <span>ESC: 닫기</span>
        </div>
      </div>
    </div>
  );
};

export default ImageZoomViewer;