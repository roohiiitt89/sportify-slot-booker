
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import NavBar from '@/components/NavBar';
import { supabase } from "@/integrations/supabase/client";
import VenueCard from '@/components/VenueCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const Venues: React.FC = () => {
  useEffect(() => {
    console.log("Venues page: Component mounted");
    return () => {
      console.log("Venues page: Component unmounted");
    };
  }, []);

  const { data: venues, isLoading, error } = useQuery({
    queryKey: ['venues'],
    queryFn: async () => {
      console.log("Venues page: Fetching all venues");
      
      try {
        const { data, error } = await supabase
          .from('venues')
          .select('*')
          .eq('is_active', true);
        
        if (error) {
          console.error("Venues page: Error fetching venues:", error);
          toast.error("Failed to load venues data");
          throw error;
        }
        
        console.log("Venues page: Fetched venues:", data);
        if (!data || data.length === 0) {
          console.log("Venues page: No venues data returned from query");
        }
        
        return data || [];
      } catch (error) {
        console.error("Venues page: Exception when fetching venues:", error);
        toast.error("Failed to load venues data");
        throw error;
      }
    }
  });

  if (isLoading) {
    console.log("Venues page: Displaying loading state");
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <h1 className="text-4xl font-bold mb-8">Available Venues</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-48 rounded-t-lg" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Venues page: Displaying error state:", error);
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load venues. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  console.log("Venues page: Rendering content with venues data:", venues);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold mb-8">Available Venues</h1>
        
        {venues && venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No venues available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Venues;
