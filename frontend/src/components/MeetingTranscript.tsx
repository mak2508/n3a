import { SentimentEvent } from '../types';

interface MeetingTranscriptProps {
  transcript: string;
  sentimentEvents: SentimentEvent[];
}

export function MeetingTranscript({ transcript, sentimentEvents }: MeetingTranscriptProps) {
  // Sort sentiment events by start index to process them in order
  const sortedEvents = [...sentimentEvents].sort((a, b) => a.start_index - b.start_index);
  
  // Function to get the highlight color based on sentiment
  const getHighlightColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100';
      case 'negative':
        return 'bg-red-100';
      default:
        return '';
    }
  };

  // Function to split the transcript into segments based on sentiment events
  const renderTranscript = () => {
    if (!transcript || !sentimentEvents.length) {
      return <p className="text-sm text-gray-700">{transcript}</p>;
    }

    const segments: JSX.Element[] = [];
    let currentIndex = 0;

    sortedEvents.forEach((event, index) => {
      // Add text before the current event
      if (event.start_index > currentIndex) {
        segments.push(
          <span key={`text-${index}`} className="text-sm text-gray-700">
            {transcript.slice(currentIndex, event.start_index)}
          </span>
        );
      }

      // Add the highlighted event text
      segments.push(
        <span
          key={`event-${index}`}
          className={`${getHighlightColor(event.sentiment)} text-sm text-gray-700`}
        >
          {transcript.slice(event.start_index, event.end_index)}
        </span>
      );

      currentIndex = event.end_index;
    });

    // Add any remaining text after the last event
    if (currentIndex < transcript.length) {
      segments.push(
        <span key="remaining" className="text-sm text-gray-700">
          {transcript.slice(currentIndex)}
        </span>
      );
    }

    return segments;
  };

  return (
    <div>
      <div className="whitespace-pre-wrap">
        {renderTranscript()}
      </div>
      <div className="mt-4 flex items-center space-x-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 mr-2"></div>
          <span className="text-sm text-gray-600">Positive</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 mr-2"></div>
          <span className="text-sm text-gray-600">Negative</span>
        </div>
      </div>
    </div>
  );
} 