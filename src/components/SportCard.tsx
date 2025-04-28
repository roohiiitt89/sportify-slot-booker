
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { toast } from "sonner";

interface Sport {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

interface SportCardProps {
  sport: Sport;
}

const SportCard: React.FC<SportCardProps> = ({ sport }) => {
  const navigate = useNavigate();

  const handleNavigate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("SportCard: Attempting to navigate to sport with ID:", sport.id);
    
    try {
      if (!sport.id) {
        console.error("SportCard: Missing sport ID for navigation");
        toast.error("Cannot view sport details: Missing ID");
        return;
      }

      // Add logging for debugging
      console.log(`SportCard: Navigation path: /sports/${sport.id}`);
      navigate(`/sports/${sport.id}`);
      console.log("SportCard: Navigation successful");
    } catch (error) {
      console.error("SportCard: Navigation error:", error);
      toast.error("Failed to navigate to sport details. Please try again.");
    }
  };

  if (!sport || !sport.id) {
    console.error("SportCard: Received invalid sport data:", sport);
    return null;
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={sport.image_url || '/placeholder.svg'} 
          alt={sport.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder.svg';
            console.log(`SportCard: Image load error for sport ${sport.id}, using placeholder`);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">{sport.name}</h3>
      </div>
      <CardContent className="p-5">
        <p className="text-gray-600 mb-4 line-clamp-2 min-h-[48px]">
          {sport.description || `Experience the excitement of ${sport.name} at our premier venues.`}
        </p>
        <Button 
          onClick={handleNavigate}
          className="w-full bg-sports-green hover:bg-sports-green/90 group-hover:bg-sports-blue transition-colors"
          aria-label={`View details for ${sport.name}`}
        >
          View Details
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SportCard;
