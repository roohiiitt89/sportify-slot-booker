
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SportCardProps {
  sport: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
  };
}

const SportCard: React.FC<SportCardProps> = ({ sport }) => {
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer bg-white">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={sport.image_url || '/placeholder.svg'} 
          alt={sport.name} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-2">{sport.name}</h3>
          {sport.description && (
            <p className="text-sm text-white/90 line-clamp-2">{sport.description}</p>
          )}
        </div>
      </div>
      
      <div className="p-4 flex justify-between items-center">
        <Button 
          variant="outline"
          size="sm"
          className="hover:bg-sports-green hover:text-white transition-colors"
          onClick={() => navigate(`/sports/${sport.id}`)}
        >
          View Venues
        </Button>
        <div className="text-sm text-gray-500">
          3 available venues
        </div>
      </div>
    </Card>
  );
};

export default SportCard;
