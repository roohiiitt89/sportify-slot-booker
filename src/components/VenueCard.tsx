
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star } from 'lucide-react';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    location: string;
    image_url: string | null;
    description: string | null;
  };
}

const VenueCard: React.FC<VenueCardProps> = ({ venue }) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={() => navigate(`/venues/${venue.id}`)}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={venue.image_url || '/placeholder.svg'} 
          alt={venue.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
        <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
        <div className="flex items-center gap-2 text-white/90 mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{venue.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-sports-green text-sports-green" />
            <span className="text-sm">4.5</span>
          </div>
          <Button 
            variant="secondary"
            size="sm"
            className="bg-white text-gray-800 hover:bg-sports-green hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/venues/${venue.id}`);
            }}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VenueCard;
