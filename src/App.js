import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, BookOpen, Brain, Edit3, Eraser, Type, Square, ArrowRight, ChevronLeft, ChevronRight, Save, RotateCcw, Redo, Palette, Settings, X } from 'lucide-react';

const StudyApp = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [annotations, setAnnotations] = useState({});
  const [summaries, setSummaries] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [canvasMode, setCanvasMode] = useState('pen');
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ff69b4');
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (notes.length === 0) {
      setNotes([{
        id: 1,
        title: 'Nuovo Quaderno',
        cover: 'https://placehold.co/300x200/f8f4f0/ff69b4?text=Copertina',
        pages: [{ id: 1, content: '' }]
      }]);
      setCurrentNote({
        id: 1,
        title: 'Nuovo Quaderno',
        cover: 'https://placehold.co/300x200/f8f4f0/ff69b4?text=Copertina',
        pages: [{ id: 1, content: '' }]
      });
    }
  }, []);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const newDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        content: URL.createObjectURL(file),
        date: new Date().toLocaleDateString()
      };
      setDocuments(prev => [...prev, newDoc]);
    });
  };

  const handleUrlImport = (url) => {
    if (url) {
      const newDoc = {
        id: Date.now() + Math.random(),
        name: url,
        type: 'link',
        content: url,
        date: new Date().toLocaleDateString()
      };
      setDocuments(prev => [...prev, newDoc]);
    }
  };

  const startDrawing = (e) => {
    if (canvasMode !== 'pen' && canvasMode !== 'highlighter') return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastPoint({ x, y });
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || (canvasMode !== 'pen' && canvasMode !== 'highlighter')) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = canvasMode === 'highlighter' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = canvasMode === 'highlighter' ? `${brushColor}80` : brushColor;
    ctx.globalCompositeOperation = canvasMode === 'highlighter' ? 'multiply' : 'source-over';
    
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleEraser = () => {
    setCanvasMode('eraser');
  };

  const createSummary = (docId) => {
    const summary = `Riassunto automatico del documento ${docId}. Questo è un esempio di riassunto generato dall'AI basato sui contenuti del documento caricato.`;
    setSummaries(prev => ({ ...prev, [docId]: summary }));
  };

  const addFlashcard = (question, answer) => {
    setFlashcards(prev => [...prev, {
      id: Date.now(),
      question,
      answer,
      lastReviewed: null,
      nextReview: new Date().toISOString()
    }]);
  };

  const createQuiz = (questions) => {
    setQuizzes(prev => [...prev, {
      id: Date.now(),
      questions,
      createdAt: new Date().toISOString(),
      results: []
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-beige-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              StudyFlow
            </h1>
            <nav className="flex space-x-2">
              {[
                { id: 'import', label: 'Importa', icon: Upload },
                { id: 'annotate', label: 'Annotazioni', icon: Edit3 },
                { id: 'summary', label: 'Riassunti', icon: FileText },
                { id: 'notes', label: 'Quaderni', icon: BookOpen },
                { id: 'review', label: 'Ripasso', icon: Brain }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-pink-100 text-pink-700 shadow-md'
                      : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <tab.icon size={18} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'import' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Importa Documenti</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-pink-200 rounded-lg p-8 text-center">
                    <Upload className="mx-auto h-12 w-12 text-pink-400 mb-4" />
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Scegli File
                    </label>
                    <p className="text-gray-500 mt-2">oppure trascina i file qui</p>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="Inserisci URL del documento..."
                      className="w-full px-4 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlImport(e.target.value)}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleUrlImport(input.value);
                        input.value = '';
                      }}
                      className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Importa Link
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Documenti Importati</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {documents.map(doc => (
                    <div key={doc.id} className="p-3 border border-pink-100 rounded-lg hover:bg-pink-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.date}</p>
                        </div>
                        <button
                          onClick={() => createSummary(doc.id)}
                          className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-sm hover:bg-pink-200 transition-colors"
                        >
                          Riassumi
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'annotate' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Annotazioni</h2>
              <button
                onClick={() => setShowDocumentPreview(!showDocumentPreview)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                {showDocumentPreview ? 'Nascondi Documento' : 'Mostra Documento'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {showDocumentPreview && (
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Documento Originale</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <FileText size={48} className="mx-auto mb-2" />
                      <p>Anteprima Documento</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Area Annotazioni</h3>
                
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-pink-50 rounded-lg">
                  <select
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="px-2 py-1 border border-pink-200 rounded text-sm"
                  >
                    {[2, 4, 6, 8, 12].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                  
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 border border-pink-200 rounded cursor-pointer"
                  />
                  
                  <button
                    onClick={() => setCanvasMode('pen')}
                    className={`p-2 rounded ${canvasMode === 'pen' ? 'bg-pink-200' : 'hover:bg-pink-100'}`}
                    title="Penna"
                  >
                    <Type size={16} />
                  </button>
                  
                  <button
                    onClick={() => setCanvasMode('highlighter')}
                    className={`p-2 rounded ${canvasMode === 'highlighter' ? 'bg-pink-200' : 'hover:bg-pink-100'}`}
                    title="Evidenziatore"
                  >
                    <Palette size={16} />
                  </button>
                  
                  <button
                    onClick={handleEraser}
                    className={`p-2 rounded ${canvasMode === 'eraser' ? 'bg-pink-200' : 'hover:bg-pink-100'}`}
                    title="Gomma"
                  >
                    <Eraser size={16} />
                  </button>
                  
                  <button
                    onClick={clearCanvas}
                    className="p-2 rounded hover:bg-pink-100"
                    title="Cancella Tutto"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <canvas
                  ref={canvasRef}
                  width={showDocumentPreview ? 400 : 800}
                  height={400}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="border border-pink-200 rounded-lg w-full"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Riassunti</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Documenti Disponibili</h3>
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="p-3 border border-pink-100 rounded-lg">
                      <p className="font-medium text-gray-800">{doc.name}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => createSummary(doc.id)}
                          className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 transition-colors"
                        >
                          Genera AI
                        </button>
                        <button className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">
                          Manuale
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Riassunti Generati</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {Object.entries(summaries).map(([docId, summary]) => (
                    <div key={docId} className="p-3 border border-pink-100 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Documento: {documents.find(d => d.id == docId)?.name}</p>
                      <p className="text-gray-800">{summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Quaderni Digitali</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setCurrentNote(note)}
                  className={`bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all ${
                    currentNote?.id === note.id ? 'border-pink-300 ring-2 ring-pink-200' : 'border-pink-100 hover:border-pink-200'
                  }`}
                >
                  <img
                    src={note.cover}
                    alt="Copertina"
                    className="w-full h-32 object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800">{note.title}</h3>
                    <p className="text-sm text-gray-500">{note.pages.length} pagine</p>
                  </div>
                </div>
              ))}
            </div>

            {currentNote && (
              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{currentNote.title}</h3>
                  <div className="flex gap-2">
                    <button className="p-2 border border-pink-200 rounded hover:bg-pink-50 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button className="p-2 border border-pink-200 rounded hover:bg-pink-50 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                    <button className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600 transition-colors">
                      <Save size={16} className="inline mr-1" /> Salva
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-pink-50 rounded-lg">
                  <select className="px-2 py-1 border border-pink-200 rounded text-sm">
                    <option>Arial</option>
                    <option>Times New Roman</option>
                    <option>Georgia</option>
                    <option>Courier New</option>
                  </select>
                  
                  <select className="px-2 py-1 border border-pink-200 rounded text-sm">
                    <option>12px</option>
                    <option>14px</option>
                    <option>16px</option>
                    <option>18px</option>
                    <option>20px</option>
                  </select>
                  
                  <div className="flex gap-1">
                    <button className="px-2 py-1 border border-pink-200 rounded text-sm hover:bg-pink-100">B</button>
                    <button className="px-2 py-1 border border-pink-200 rounded text-sm hover:bg-pink-100">I</button>
                    <button className="px-2 py-1 border border-pink-200 rounded text-sm hover:bg-pink-100">U</button>
                  </div>
                  
                  <button className="p-1 border border-pink-200 rounded hover:bg-pink-100">
                    <RotateCcw size={16} />
                  </button>
                  <button className="p-1 border border-pink-200 rounded hover:bg-pink-100">
                    <Redo size={16} />
                  </button>
                  
                  <input
                    type="color"
                    className="w-8 h-8 border border-pink-200 rounded cursor-pointer"
                  />
                </div>

                <textarea
                  value={currentNote.pages[0].content}
                  onChange={(e) => {
                    const updatedNotes = notes.map(n => 
                      n.id === currentNote.id 
                        ? { ...n, pages: n.pages.map(p => p.id === 1 ? { ...p, content: e.target.value } : p) }
                        : n
                    );
                    setNotes(updatedNotes);
                    setCurrentNote(updatedNotes.find(n => n.id === currentNote.id));
                  }}
                  className="w-full h-64 p-4 border border-pink-200 rounded-lg resize-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                  placeholder="Scrivi i tuoi appunti qui..."
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">Ripasso</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Flashcards</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Domanda..."
                      className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Risposta..."
                      className="flex-1 px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                    <button
                      onClick={(e) => {
                        const inputs = e.target.parentElement.querySelectorAll('input');
                        addFlashcard(inputs[0].value, inputs[1].value);
                        inputs[0].value = '';
                        inputs[1].value = '';
                      }}
                      className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                    >
                      Aggiungi
                    </button>
                  </div>
                  
                  <div className="grid gap-3">
                    {flashcards.map(card => (
                      <div key={card.id} className="p-3 border border-pink-100 rounded-lg">
                        <p className="font-medium text-gray-800">{card.question}</p>
                        <p className="text-sm text-gray-600 mt-1">{card.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => createQuiz([
                      { question: "Domanda di esempio?", options: ["A", "B", "C"], correct: 0 }
                    ])}
                    className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Crea Nuovo Quiz
                  </button>
                  
                  <div className="space-y-3">
                    {quizzes.map(quiz => (
                      <div key={quiz.id} className="p-3 border border-pink-100 rounded-lg">
                        <p className="font-medium text-gray-800">Quiz #{quiz.id}</p>
                        <p className="text-sm text-gray-600">{quiz.questions.length} domande</p>
                        <button className="mt-2 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors">
                          Inizia Quiz
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudyApp;
