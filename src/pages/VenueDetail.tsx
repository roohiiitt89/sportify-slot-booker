
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Clock, Users, Phone, MapPin, ArrowLeft } from 'lucide-react';
import BookingModal from '@/components/BookingModal';
import { toast } from "sonner";

const VenueDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBookingModalOpen, setIsBookingModalOpen] = React.useState(false);

  const { data: venue, isLoading } = useQuery({
    queryKey: ['venue', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*, courts(*), sports(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        toast.error("Venue not found");
        navigate('/venues');
        throw error;
      }
      return data;
    }
  });

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
        {venue && (
          <>
            <div className="flex justify-between items-center mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>

            <Carousel className="mb-8">
              <CarouselContent>
                <CarouselItem>
                  <img 
                    src={venue.image_url || '/placeholder.svg'} 
                    alt={venue.name} 
                    className="w-full h-[400px] object-cover rounded-xl"
                  />
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h1 className="text-4xl font-bold mb-4">{venue.name}</h1>
                  <p className="text-gray-600">{venue.description}</p>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Quick Info</h2>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-sports-green" />
                        <span>{venue.opening_hours || 'Opening hours not specified'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-sports-green" />
                        <span>Capacity: {venue.capacity ? venue.capacity : 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-sports-green" />
                        <span>{venue.contact_number || 'Contact number not specified'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-sports-green" />
                        <span>{venue.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {venue.courts && venue.courts.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-4">Available Sports</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {venue.sports && Array.from(new Set(venue.sports.map((sport: any) => sport.id))).map((sportId: string) => {
                          const sport = venue.sports.find((s: any) => s.id === sportId);
                          return sport && (
                            <div 
                              key={sport.id}
                              className="bg-white shadow-sm rounded-lg p-3 border border-gray-200 hover:border-sports-green hover:shadow-md transition-all cursor-pointer"
                              onClick={() => navigate(`/sports/${sport.id}`)}
                            >
                              <p className="font-medium text-center">{sport.name}</p>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Book This Venue</h2>
                    <Button 
                      className="w-full bg-sports-green hover:bg-sports-green/90"
                      onClick={() => setIsBookingModalOpen(true)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialVenue={venue?.name}
      />
    </div>
  );
};

export default VenueDetail;
