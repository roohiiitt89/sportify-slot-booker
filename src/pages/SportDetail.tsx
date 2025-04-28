
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import NavBar from '@/components/NavBar';
import VenueCard from '@/components/VenueCard';
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SportDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: sport, isLoading: sportLoading } = useQuery({
    queryKey: ['sport', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    meta: {
      onError: () => {
        toast.error("Failed to load sport details");
        navigate('/sports');
      }
    }
  });

  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ['sport-venues', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courts')
        .select(`
          venue_id,
          venues:venue_id(*)
        `)
        .eq('sport_id', id)
        .eq('is_active', true);
      
      if (error) throw error;

      // Extract unique venues
      const uniqueVenues = data.reduce((acc, item) => {
        if (item.venues && !acc.some(venue => venue.id === item.venues.id)) {
          acc.push(item.venues);
        }
        return acc;
      }, []);

      return uniqueVenues;
    },
    enabled: !!sport
  });

  const isLoading = sportLoading || venuesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        {sport && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold">{sport.name} Venues</h1>
              <Button 
                onClick={() => navigate('/sports')}
                variant="outline"
                className="flex items-center gap-2"
              >
                All Sports
              </Button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3">
                  <img 
                    src={sport.image_url || '/placeholder.svg'} 
                    alt={sport.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-2xl font-bold mb-4">About {sport.name}</h2>
                  <p className="text-gray-600 mb-6">
                    {sport.description || `Experience the excitement of ${sport.name} at our premier venues.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-8">Available Venues</h2>
        
        {venues && venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <h3 className="text-xl mb-4">No venues currently available for this sport</h3>
            <p className="text-gray-600 mb-6">
              Please check back later or explore other sports options.
            </p>
            <Button 
              onClick={() => navigate('/venues')}
              className="bg-sports-green hover:bg-sports-green/90"
            >
              Browse All Venues <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportDetail;
