
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import NavBar from '@/components/NavBar';
import { supabase } from "@/integrations/supabase/client";
import SportCard from '@/components/SportCard';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Sports: React.FC = () => {
  const { data: sports, isLoading, error } = useQuery({
    queryKey: ['sports'],
    queryFn: async () => {
      console.log("Fetching all sports");
      
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error("Error fetching sports:", error);
        throw error;
      }
      
      console.log("Fetched sports:", data);
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sports-green" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load sports. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <h1 className="text-4xl font-bold mb-8">All Sports</h1>
        
        {sports && sports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sports.map((sport) => (
              <SportCard key={sport.id} sport={sport} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No sports available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sports;
