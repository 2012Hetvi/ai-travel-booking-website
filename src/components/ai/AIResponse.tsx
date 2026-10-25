// src/components/ai/AIResponse.tsx
import { MessageCircleWarning } from 'lucide-react';
import { AIResponse as AIResponseData } from '../../services/aiTravelAssistant';
import { Destination } from '../../data/destinations';
import DestinationResult from './DestinationResult';
import DestinationComparison from './DestinationComparison';
import RecommendationCard from './RecommendationCard';

interface Props {
  response: AIResponseData;
  onViewDetails: (id: number) => void;
  onBookNow: (destination: Destination) => void;
}

export default function AIResponse({ response, onViewDetails, onBookNow }: Props) {
  switch (response.type) {
    case 'destination':
      return (
        <DestinationResult
          destination={response.destination}
          details={response.details}
          section="full"
          onViewDetails={onViewDetails}
          onBookNow={onBookNow}
        />
      );

    case 'hotels':
      return (
        <DestinationResult
          destination={response.destination}
          details={response.details}
          section="hotels"
          onViewDetails={onViewDetails}
          onBookNow={onBookNow}
        />
      );

    case 'transport':
      return (
        <DestinationResult
          destination={response.destination}
          details={response.details}
          section="transport"
          onViewDetails={onViewDetails}
          onBookNow={onBookNow}
        />
      );

    case 'itinerary':
      return (
        <DestinationResult
          destination={response.destination}
          details={response.details}
          section="itinerary"
          onViewDetails={onViewDetails}
          onBookNow={onBookNow}
        />
      );

    case 'comparison':
      return (
        <DestinationComparison
          a={response.a}
          b={response.b}
          detailsA={response.detailsA}
          detailsB={response.detailsB}
          onViewDetails={onViewDetails}
        />
      );

    case 'recommendation':
      return (
        <RecommendationCard title={response.title} items={response.items} onViewDetails={onViewDetails} />
      );

    case 'notFound':
      return (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <MessageCircleWarning size={28} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">{response.message}</p>
        </div>
      );

    default:
      return null;
  }
}