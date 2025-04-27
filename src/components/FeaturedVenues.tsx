
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FeaturedVenues = () => {
  const { data: venues, isLoading } = useQuery({
    queryKey: ['featured-venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div>Loading venues...</div>;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Venues</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues?.map((venue) => (
            <Card key={venue.id} className="venue-card group cursor-pointer overflow-hidden">
              <div className="relative h-64">
                <img
                  src={venue.image_url || '/placeholder.svg'}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                  <h3 className="text-xl font-bold text-white mb-2">{venue.name}</h3>
                  <p className="text-gray-200 text-sm">{venue.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVenues;
