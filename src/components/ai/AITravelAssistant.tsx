// src/components/ai/AITravelAssistant.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mic, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { processQuery, AIResponse as AIResponseData, EXAMPLE_QUERIES } from '../../services/aiTravelAssistant';
import { Destination } from '../../data/destinations';
import AIResponse from './AIResponse';
import DestinationDetailModal from '../DestinationDetailModal';

// Minimal typing for the Web Speech API (not in default TS lib)
interface SpeechRecognitionResultLike {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

export default function AITravelAssistant() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState<AIResponseData | null>(null);
  const [modalDestId, setModalDestId] = useState<number | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = (event: SpeechRecognitionResultLike) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setListening(false);
      handleAsk(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      toast.error('Voice input failed. Please try typing instead.');
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    setListening(true);
    recognitionRef.current.start();
  };

  const handleAsk = async (overrideQuery?: string) => {
    const q = (overrideQuery ?? query).trim();
    if (!q) return;

    setLoading(true);
    setResponse(null);
    try {
      const result = await processQuery(q);
      setResponse(result);
    } catch (err) {
      console.error('AI assistant error:', err);
      toast.error('Something went wrong while searching. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: number) => {
    setModalDestId(id);
  };

  const handleBookNow = (destination: Destination) => {
    navigate('/login', {
      state: {
        price: destination.price,
        destinationName: destination.name,
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-3">
          <Sparkles size={14} />
          AI Travel Assistant
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Where do you want to go?</h2>
      </div>

      {/* Input bar */}
      <div className="bg-card border border-border rounded-2xl shadow-lg p-3 sm:p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask anything about your destination..."
            className="flex-1 bg-muted/40 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-primary"
          />
          <button
            onClick={startListening}
            disabled={listening}
            title={speechSupported ? 'Speak your query' : 'Voice input not supported in this browser'}
            className={`w-11 h-11 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'bg-muted/60 text-foreground/70 hover:bg-muted'
            }`}
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => handleAsk()}
            disabled={loading || !query.trim()}
            className="w-11 h-11 flex-shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {listening && (
          <p className="text-xs text-red-500 mt-2 text-center animate-pulse">🎤 Listening...</p>
        )}

        {/* Example chips */}
        {!response && !loading && (
          <div className="flex flex-wrap gap-2 mt-3">
            {EXAMPLE_QUERIES.map((ex) => (
              <button
                key={ex}
                onClick={() => {
                  setQuery(ex);
                  handleAsk(ex);
                }}
                className="text-xs bg-muted/50 hover:bg-muted text-muted-foreground px-3 py-1.5 rounded-full transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Response */}
      <div className="max-w-2xl mx-auto mt-6">
        {loading && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Loader2 size={22} className="mx-auto mb-2 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Searching Wanderlust destinations...</p>
          </div>
        )}

        {!loading && response && (
          <AIResponse response={response} onViewDetails={handleViewDetails} onBookNow={handleBookNow} />
        )}
      </div>

      {/* Reuses the exact same destination detail modal used elsewhere on the site */}
      <DestinationDetailModal destinationId={modalDestId} onClose={() => setModalDestId(null)} />
    </div>
  );
}