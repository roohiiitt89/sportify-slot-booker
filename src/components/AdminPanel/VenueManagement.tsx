
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface VenueManagementProps {
  isSuperAdmin: boolean;
}

const VenueManagement: React.FC<VenueManagementProps> = ({ isSuperAdmin }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: venues, isLoading } = useQuery({
    queryKey: ['admin-venues', user?.id, isSuperAdmin],
    queryFn: async () => {
      // If super_admin, get all venues
      if (isSuperAdmin) {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data;
      } else {
        // For regular admins, get venues they manage
        const { data, error } = await supabase
          .from('venue_admins')
          .select(`
            venue_id,
            venues:venue_id(*)
          `)
          .eq('user_id', user?.id);
          
        if (error) throw error;
        // Extract venue data from the join
        return data?.map(item => item.venues) || [];
      }
    },
    enabled: !!user?.id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues && venues.length > 0 ? (
          venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              <div className="h-40">
                {venue.image_url ? (
                  <img 
                    src={venue.image_url} 
                    alt={venue.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image</p>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.location}</span>
                </div>
                {venue.capacity && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Users className="h-4 w-4" />
                    <span>Capacity: {venue.capacity}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/venues/${venue.id}`)}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => navigate(`/admin?tab=bookings&venue=${venue.id}`)}
                    className="bg-sports-green hover:bg-sports-green/90"
                  >
                    Manage Bookings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            <p>No venues found</p>
            {!isSuperAdmin && (
              <p className="text-sm mt-2">Contact a super admin to assign venues to your account.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueManagement;
