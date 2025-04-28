// VenueDetails.tsx

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react'; // Assuming you use lucide-react for icons
import { Card, CardContent } from '@/components/ui/card'; // Assuming you use shadcn or similar
import { supabase } from "@/integrations/supabase/client";

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Guard: If id is missing, show loading spinner
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Fetch Venue Data
  const { data: venue, isLoading, isError } = useQuery(['venue', id], async () => {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        courts(*),
        sports(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-lg">Something went wrong. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Venue Main Details */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{venue.name || "Unnamed Venue"}</h1>
        <p className="text-gray-600">{venue.location || "Unknown Location"}</p>
      </div>

      {/* Available Sports Section */}
      {venue.sports && venue.sports.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Available Sports</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {venue.sports.map((sport: any) => (
                <div 
                  key={sport.id}
                  className="bg-white shadow-sm rounded-lg p-3 border border-gray-200 hover:border-sports-green hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/sports/${sport.id}`)}
                >
                  <p className="font-medium text-center">{sport.name || "Unnamed Sport"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Courts Section (optional, if you want to show courts too) */}
      {venue.courts && venue.courts.length > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Available Courts</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {venue.courts.map((court: any) => (
                <div 
                  key={court.id}
                  className="bg-white shadow-sm rounded-lg p-3 border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <p className="font-medium text-center">{court.name || "Unnamed Court"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Venue Details (optional) */}
      <div className="mt-10">
        {/* Add other sections like About, Opening Hours, Contact Info, etc. */}
      </div>
    </div>
  );
}

