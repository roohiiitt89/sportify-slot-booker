
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const ForYouSection = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get user's past bookings with venue and sport information
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          court_id,
          courts:court_id(
            sport_id,
            venue_id,
            sports:sport_id(*),
            venues:venue_id(*)
          )
        `)
        .eq('user_id', user.id);
      
      if (bookingsError) {
        console.error("Error fetching user bookings:", bookingsError);
        return { recommendations: [] };
      }

      // Extract venue and sport IDs from bookings
      const userVenueIds = new Set();
      const userSportIds = new Set();
      const userLocations = new Set();
      
      bookings?.forEach(booking => {
        if (booking.courts && booking.courts.venue_id) {
          userVenueIds.add(booking.courts.venue_id);
        }
        if (booking.courts && booking.courts.sport_id) {
          userSportIds.add(booking.courts.sport_id);
        }
        if (booking.courts && booking.courts.venues && booking.courts.venues.location) {
          userLocations.add(booking.courts.venues.location);
        }
      });

      // If there are no previous bookings, get trending venues
      if (userVenueIds.size === 0) {
        const { data: popularVenues } = await supabase
          .from('venues')
          .select('*')
          .eq('is_active', true)
          .limit(3);
        
        return { 
          recommendations: popularVenues || [],
          recommendationType: 'popular'
        };
      }

      // Find similar venues based on sports the user has played
      let similarVenues = [];
      if (userSportIds.size > 0) {
        // Convert Set to Array of strings for the SQL IN clause
        const sportIdsArray = Array.from(userSportIds).map(id => String(id));
        const venueIdsArray = Array.from(userVenueIds).map(id => String(id));
        
        const { data: sportBasedVenues } = await supabase
          .from('courts')
          .select(`
            venues:venue_id(*)
          `)
          .in('sport_id', sportIdsArray)
          .not('venue_id', 'in', venueIdsArray)
          .eq('is_active', true)
          .limit(5);
        
        // Extract unique venues
        const uniqueVenues = new Map();
        sportBasedVenues?.forEach(item => {
          if (item.venues && !uniqueVenues.has(item.venues.id)) {
            uniqueVenues.set(item.venues.id, item.venues);
          }
        });
        
        similarVenues = Array.from(uniqueVenues.values());
      }

      // Find venues in similar locations
      let nearbyVenues = [];
      if (userLocations.size > 0) {
        // In a real app, we'd use geocoding, but for now we'll just do partial string matching
        const locationQueries = Array.from(userLocations).map(location => {
          const cityOrArea = String(location).split(',')[0].trim(); // Extract city or first part
          return supabase
            .from('venues')
            .select('*')
            .ilike('location', `%${cityOrArea}%`)
            .not('id', 'in', Array.from(userVenueIds).map(id => String(id)))
            .eq('is_active', true)
            .limit(3);
        });
        
        const locationResults = await Promise.all(locationQueries);
        const uniqueLocVenues = new Map();
        
        locationResults.forEach(result => {
          result.data?.forEach(venue => {
            if (!uniqueLocVenues.has(venue.id)) {
              uniqueLocVenues.set(venue.id, venue);
            }
          });
        });
        
        nearbyVenues = Array.from(uniqueLocVenues.values());
      }

      // Combine results with priority to location-based recommendations
      const combinedVenues = [...nearbyVenues];
      
      // Add sport-based venues that aren't already included
      similarVenues.forEach(venue => {
        if (!combinedVenues.some(v => v.id === venue.id)) {
          combinedVenues.push(venue);
        }
      });

      // Limit to 3 recommendations
      const finalRecommendations = combinedVenues.slice(0, 3);

      return { 
        recommendations: finalRecommendations,
        recommendationType: nearbyVenues.length > 0 ? 'nearby' : 'similar'
      };
    },
    enabled: !!isLoggedIn && !!user?.id
  });

  if (!isLoggedIn || isLoading) {
    return null;
  }

  if (!recommendations || recommendations.recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-sports-navy to-sports-blue rounded-2xl p-8 text-white">
      <h3 className="text-2xl font-bold mb-6">
        {recommendations.recommendationType === 'nearby' 
          ? 'Venues Near You' 
          : recommendations.recommendationType === 'similar' 
            ? 'Based on Your Interests' 
            : 'Popular Venues'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.recommendations.map((venue) => (
          <div 
            key={venue.id}
            className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-colors"
          >
            <h4 className="font-bold mb-2">{venue.name}</h4>
            <p className="text-sm mb-3 line-clamp-2">{venue.description || `Visit ${venue.name} for an exceptional sports experience`}</p>
            <p className="text-xs mb-3 opacity-75">{venue.location}</p>
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
