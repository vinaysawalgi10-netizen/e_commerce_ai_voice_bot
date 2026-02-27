import { useEffect, useRef, useState } from 'react';

const YourComponent = ({ participant }) => {
  const [participantImageLoading, setParticipantImageLoading] = useState(true);
  const imgRef = useRef(null);

  useEffect(() => {
    setParticipantImageLoading(true); // Reset loading when participant changes
  }, [participant.image]);

  useEffect(() => {
    const img = imgRef.current;
    if (img) {
      const handleLoad = () => {
        setParticipantImageLoading(false);
      };
      const handleError = () => {
        setParticipantImageLoading(false);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);

      // Check if already loaded
      if (img.complete && img.naturalHeight > 0) {
        setParticipantImageLoading(false);
      }

      // Fallback: hide shimmer after 3 seconds if still loading
      const timeout = setTimeout(() => {
        setParticipantImageLoading(false);
      }, 3000);

      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
        clearTimeout(timeout);
      };
    }
  }, [participant.image]);

  return (
    <div>
      {participantImageLoading && <div className="shimmer">Loading...</div>}
      <img
        key={participant.image}
        ref={imgRef}
        src={participant.image}
        alt="Participant"
        style={{ display: participantImageLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default YourComponent;
