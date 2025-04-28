
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from 'lucide-react';

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

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl group"
      onClick={() => navigate(`/venues/${venue.id}`)}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={venue.image_url || '/placeholder.svg'} 
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
        <div className="absolute bottom-0 right-0 w-10 h-10 bg-sports-green transform translate-y-1/2 rotate-45 origin-bottom-right"></div>
      </CardContent>
    </Card>
  );
};

export default VenueCard;
