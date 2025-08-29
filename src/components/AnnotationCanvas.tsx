import React, { useRef, useState, useEffect } from 'react';
import { X, Pen, Eraser, Download, Undo, Redo, Square, Circle, Type, Palette, MessageCircle } from 'lucide-react';

interface AnnotationCanvasProps {
  imageUrl?: string | null;
  onSave: (imageData: string, comment: string) => void;
  onClose: () => void;
}

const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ imageUrl, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#FF0000');
  const [brushSize, setBrushSize] = useState(3);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [annotationComment, setAnnotationComment] = useState('');
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.3);

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#000000', '#FFFFFF',
    '#FFA500', '#800080', '#FFC0CB', '#808080'
  ];

  // 배경 이미지 그리기
  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!backgroundCanvas || !imageUrl) return;
    
    const ctx = backgroundCanvas.getContext('2d');
    if (!ctx) return;

    backgroundCanvas.width = 800;
    backgroundCanvas.height = 600;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      const scale = Math.min(backgroundCanvas.width / img.width, backgroundCanvas.height / img.height);
      const x = (backgroundCanvas.width - img.width * scale) / 2;
      const y = (backgroundCanvas.height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // 투명도 변경
  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!backgroundCanvas) return;
    backgroundCanvas.style.opacity = backgroundOpacity.toString();
  }, [backgroundOpacity]);

  // 주석 캔버스 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;
    
    // 투명한 배경으로 시작
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imageData);
    
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
      
      const previousState = history[historyStep - 1];
      ctx.putImageData(previousState, 0, 0);
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) return;
      
      const nextState = history[historyStep + 1];
      ctx.putImageData(nextState, 0, 0);
      setHistoryStep(historyStep + 1);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'text') {
      setTextPosition({ x, y });
      setTextInput('');
      return;
    }
    
    setIsDrawing(true);
    setStartPos({ x, y });
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    switch (currentTool) {
      case 'pen':
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentColor;
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
        
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineTo(x, y);
        ctx.stroke();
        break;
    }
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) {
      setIsDrawing(false);
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = brushSize;
    
    switch (currentTool) {
      case 'rectangle':
        ctx.strokeRect(
          startPos.x,
          startPos.y,
          endX - startPos.x,
          endY - startPos.y
        );
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(endX - startPos.x, 2) + Math.pow(endY - startPos.y, 2)
        );
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
    }
    
    setIsDrawing(false);
    setStartPos(null);
    saveToHistory();
  };

  const addText = () => {
    if (!textInput || !textPosition) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = currentColor;
    ctx.font = `${brushSize * 5}px sans-serif`;
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    setTextInput('');
    setTextPosition(null);
    saveToHistory();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 주석만 저장 (배경 이미지 제외)
    const imageData = canvas.toDataURL('image/png');
    onSave(imageData, annotationComment);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const backgroundCanvas = backgroundCanvasRef.current;
    if (!canvas || !backgroundCanvas) return;
    
    // 합성용 캔버스 생성
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = canvas.width;
    mergedCanvas.height = canvas.height;
    const mergedCtx = mergedCanvas.getContext('2d');
    
    if (!mergedCtx) return;
    
    // 배경 그리기
    mergedCtx.globalAlpha = backgroundOpacity;
    mergedCtx.drawImage(backgroundCanvas, 0, 0);
    
    // 주석 그리기
    mergedCtx.globalAlpha = 1;
    mergedCtx.drawImage(canvas, 0, 0);
    
    const link = document.createElement('a');
    link.download = `annotation-${Date.now()}.png`;
    link.href = mergedCanvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg flex flex-col" style={{ width: '900px', height: '800px' }}>
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">주석 그리기</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        {/* 툴바 */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
          {/* 도구 선택 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentTool('pen')}
              className={`p-2 rounded ${currentTool === 'pen' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="펜"
            >
              <Pen size={20} />
            </button>
            <button
              onClick={() => setCurrentTool('eraser')}
              className={`p-2 rounded ${currentTool === 'eraser' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="지우개"
            >
              <Eraser size={20} />
            </button>
            <button
              onClick={() => setCurrentTool('rectangle')}
              className={`p-2 rounded ${currentTool === 'rectangle' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="사각형"
            >
              <Square size={20} />
            </button>
            <button
              onClick={() => setCurrentTool('circle')}
              className={`p-2 rounded ${currentTool === 'circle' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="원"
            >
              <Circle size={20} />
            </button>
            <button
              onClick={() => setCurrentTool('text')}
              className={`p-2 rounded ${currentTool === 'text' ? 'bg-black text-white' : 'hover:bg-gray-100'}`}
              title="텍스트"
            >
              <Type size={20} />
            </button>
          </div>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* 색상 선택 */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 hover:bg-gray-100 rounded flex items-center space-x-1"
              title="색상 선택"
            >
              <Palette size={20} />
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: currentColor }}
              ></div>
            </button>
            
            {showColorPicker && (
              <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg p-2 shadow-lg grid grid-cols-6 gap-1 z-10">
                {colors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setCurrentColor(color);
                      setShowColorPicker(false);
                    }}
                    className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* 브러시 크기 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">크기:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-8">{brushSize}</span>
          </div>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* 배경 투명도 */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">배경 투명도:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={backgroundOpacity}
              onChange={(e) => setBackgroundOpacity(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-12">{Math.round(backgroundOpacity * 100)}%</span>
          </div>
          
          <div className="h-8 w-px bg-gray-300"></div>
          
          {/* 실행 취소/재실행 */}
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyStep <= 0}
              className={`p-2 rounded ${historyStep <= 0 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
              title="실행 취소"
            >
              <Undo size={20} />
            </button>
            <button
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              className={`p-2 rounded ${historyStep >= history.length - 1 ? 'text-gray-300' : 'hover:bg-gray-100'}`}
              title="다시 실행"
            >
              <Redo size={20} />
            </button>
          </div>
          
          <button
            onClick={downloadImage}
            className="p-2 hover:bg-gray-100 rounded"
            title="다운로드"
          >
            <Download size={20} />
          </button>
        </div>
        
        {/* 캔버스 영역 */}
        <div className="flex-1 p-4 bg-gray-50 overflow-auto flex items-center justify-center">
          <div className="relative">
            {/* 배경 이미지 캔버스 */}
            <canvas
              ref={backgroundCanvasRef}
              className="absolute border border-gray-300 bg-white"
              style={{ pointerEvents: 'none' }}
            />
            
            {/* 주석 캔버스 */}
            <canvas
              ref={canvasRef}
              className="relative border border-gray-300 cursor-crosshair"
              style={{ backgroundColor: 'transparent' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            
            {/* 텍스트 입력 */}
            {textPosition && (
              <div 
                className="absolute"
                style={{ 
                  left: textPosition.x,
                  top: textPosition.y - 20
                }}
              >
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addText();
                    }
                  }}
                  onBlur={addText}
                  className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                  style={{ color: currentColor }}
                  placeholder="텍스트 입력..."
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>
        
        {/* 코멘트 입력 영역 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} className="text-gray-600" />
            <input
              type="text"
              value={annotationComment}
              onChange={(e) => setAnnotationComment(e.target.value)}
              placeholder="주석에 대한 설명을 입력하세요..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded"
            />
          </div>
        </div>
        
        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-black"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            disabled={!annotationComment.trim()}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotationCanvas;