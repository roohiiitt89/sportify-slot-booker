
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from 'lucide-react';
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  description: string | null;
  location: string;
  image_url: string | null;
}

interface VenueCardProps {
  venue: Venue;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("VenueCard: Attempting to navigate to venue with ID:", venue.id);
    
    try {
      if (!venue.id) {
        console.error("VenueCard: Missing venue ID for navigation");
        toast.error("Cannot view venue details: Missing ID");
        return;
      }

      // Add logging for debugging
      console.log(`VenueCard: Navigation path: /venues/${venue.id}`);
      navigate(`/venues/${venue.id}`);
      console.log("VenueCard: Navigation successful");
    } catch (error) {
      console.error("VenueCard: Navigation error:", error);
      toast.error("Failed to navigate to venue details. Please try again.");
    }
  };

  if (!venue || !venue.id) {
    console.error("VenueCard: Received invalid venue data:", venue);
    return null;
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={venue.image_url || '/placeholder.svg'} 
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder.svg';
            console.log(`VenueCard: Image load error for venue ${venue.id}, using placeholder`);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      <CardContent className="relative p-5 pb-6">
        <h3 className="text-lg font-bold mb-2 group-hover:text-sports-green transition-colors">{venue.name}</h3>
        <div className="flex items-center text-gray-500 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{venue.location}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2">
          {venue.description || `Visit ${venue.name} for an exceptional sports experience.`}
        </p>
        <button
          onClick={handleClick}
          className="mt-4 text-sports-green font-semibold hover:underline"
          aria-label={`View details for ${venue.name}`}
        >
          View Details
        </button>
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-sports-green transform translate-y-1/2 rotate-45 origin-bottom-right"></div>
      </CardContent>
    </Card>
  );
};

export default VenueCard;
