
import React from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const FeaturedSports = () => {
  const { data: sports, isLoading } = useQuery({
    queryKey: ['featured-sports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="flex items-center justify-center py-16">Loading sports...</div>;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Sports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sports && sports.length > 0 ? (
            sports.map((sport) => (
              <Card key={sport.id} className="sport-card group cursor-pointer overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={sport.image_url || '/placeholder.svg'}
                    alt={sport.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-end p-4 z-10">
                    <h3 className="text-lg font-semibold text-white">{sport.name}</h3>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No featured sports available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSports;
