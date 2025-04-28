
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ForYouSection = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's past bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select(`
          courts(
            sports(*),
            venues(*)
          )
        `)
        .eq('user_id', user.id)
        .limit(5);

      if (!bookings?.length) return null;

      // Extract unique sports and venues from past bookings
      const sportIds = new Set(bookings.map(booking => booking.courts?.sports?.[0]?.id));
      const venueIds = new Set(bookings.map(booking => booking.courts?.venues?.[0]?.id));

      // Get similar venues based on user's booking history
      const { data: similarVenues } = await supabase
        .from('venues')
        .select('*')
        .filter('id', 'not.in', `(${Array.from(venueIds).join(',')})`)
        .limit(3);

      return {
        pastSports: Array.from(sportIds),
        pastVenues: Array.from(venueIds),
        recommendations: similarVenues || []
      };
    },
    enabled: !!isLoggedIn && !!user?.id
  });

  if (!isLoggedIn || !recommendations?.recommendations.length) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-sports-navy to-sports-blue rounded-2xl p-8 text-white">
      <h3 className="text-2xl font-bold mb-6">Your Recommendations</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.recommendations.map((venue) => (
          <div 
            key={venue.id}
            className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-colors"
          >
            <h4 className="font-bold mb-2">{venue.name}</h4>
            <p className="text-sm mb-3">{venue.description || `Visit ${venue.name} for an exceptional sports experience`}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate(`/venues/${venue.id}`)}
            >
              View Details
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForYouSection;
