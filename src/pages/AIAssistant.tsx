// src/pages/AIAssistant.tsx
import AITravelAssistant from '../components/ai/AITravelAssistant';

function AIAssistant() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AITravelAssistant />
      </div>
    </div>
  );
}

export default AIAssistant;