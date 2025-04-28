import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import { ArrowRight } from 'lucide-react';
import { venues, sports, sportsQuotes } from '@/data/mockData';
import BookingModal from '@/components/BookingModal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import VenueCard from '@/components/VenueCard';
import SportCard from '@/components/SportCard';

const Home: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | undefined>(undefined);
  const [selectedVenue, setSelectedVenue] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        prevIndex === sportsQuotes.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const openBookingModal = (sport?: string, venue?: string) => {
    setSelectedSport(sport);
    setSelectedVenue(venue);
    setIsBookingModalOpen(true);
  };

  const { data: venues } = useQuery({
    queryKey: ['featured-venues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: sports } = useQuery({
    queryKey: ['featured-sports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="video-container">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://mhkwikrckmlfdfljsbfx.supabase.co/storage/v1/object/public/videos//mixkit-one-on-one-in-a-soccer-game-43483-full-hd%20(1).mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        <div className="container mx-auto px-4 z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="hero-text text-white mb-6 animate-fade-in-down">
              Book Now for <span className="text-sports-green">Your Game</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in">
              Reserve your favorite sports venues with just a few clicks
            </p>
            <Button 
              onClick={() => openBookingModal()}
              size="lg" 
              className="bg-sports-green hover:bg-sports-green/90 text-white rounded-full px-8 py-6 text-lg animate-fade-in-up"
            >
              Book a Slot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Featured <span className="text-sports-green">Venues</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover premium sports facilities designed for exceptional experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {venues?.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/venues')}
              size="lg"
              className="bg-sports-green hover:bg-sports-green/90 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Explore All Venues
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
              Featured <span className="text-sports-green">Sports</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your favorite sport and book a slot today
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sports?.map((sport) => (
              <SportCard key={sport.id} sport={sport} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/sports')}
              size="lg"
              className="bg-sports-green hover:bg-sports-green/90 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Sports
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For You</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Personalized recommendations based on your interests
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-sports-navy to-sports-blue rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Your Recommendations</h3>
            <p className="mb-4">Sign in to see personalized recommendations based on your booking history and preferences.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-colors">
                <h4 className="font-bold mb-2">Tennis at Elite Sports Complex</h4>
                <p className="text-sm mb-3">Great courts with professional coaching</p>
                <Button variant="secondary" size="sm" onClick={() => openBookingModal("Tennis", "Elite Sports Complex")}>
                  Book Now
                </Button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-colors">
                <h4 className="font-bold mb-2">Swimming at Aquatic Center</h4>
                <p className="text-sm mb-3">Olympic-sized pools available all day</p>
                <Button variant="secondary" size="sm" onClick={() => openBookingModal("Swimming", "Aquatic Center")}>
                  Book Now
                </Button>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg hover:bg-white/20 transition-colors">
                <h4 className="font-bold mb-2">Basketball at Fitness Hub</h4>
                <p className="text-sm mb-3">Indoor courts with professional flooring</p>
                <Button variant="secondary" size="sm" onClick={() => openBookingModal("Basketball", "Fitness Hub Arena")}>
                  Book Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sports Inspiration</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get motivated with quotes from sports legends
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative h-64 flex items-center justify-center">
              {sportsQuotes.map((quoteObj, index) => (
                <div 
                  key={quoteObj.id}
                  className={`absolute transition-all duration-500 ease-in-out transform p-8 text-center rounded-xl bg-white shadow-lg ${
                    index === currentQuoteIndex 
                      ? 'opacity-100 scale-100 animate-float' 
                      : 'opacity-0 scale-95'
                  }`}
                >
                  <p className="text-xl md:text-2xl text-gray-800 italic mb-4">
                    "{quoteObj.quote}"
                  </p>
                  <p className="text-lg font-medium text-sports-green">
                    — {quoteObj.author}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-sports-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your Next Game?</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of sports enthusiasts who have already booked their perfect sports experience through Sportify Slots.
          </p>
          <Button 
            onClick={() => openBookingModal()}
            size="lg" 
            className="bg-sports-green hover:bg-sports-green/90 text-white rounded-full px-8 py-6 text-lg"
          >
            Book a Slot Now
          </Button>
        </div>
      </section>
      
      <footer className="bg-sports-navy text-white py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Sportify Slots</h3>
              <p className="text-white/70">
                Book your favorite sports venues with ease and enjoy the game you love.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-white/70 hover:text-white">Home</Link></li>
                <li><Link to="/venues" className="text-white/70 hover:text-white">Venues</Link></li>
                <li><Link to="/sports" className="text-white/70 hover:text-white">Sports</Link></li>
                <li><Link to="/signin" className="text-white/70 hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-white/70 hover:text-white">FAQ</Link></li>
                <li><Link to="/contact" className="text-white/70 hover:text-white">Contact Us</Link></li>
                <li><Link to="/terms" className="text-white/70 hover:text-white">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="text-white/70 hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-white">Facebook</a>
                <a href="#" className="text-white/70 hover:text-white">Twitter</a>
                <a href="#" className="text-white/70 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/50 text-sm">
            &copy; {new Date().getFullYear()} Sportify Slots. All rights reserved.
          </div>
        </div>
      </footer>
      
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialSport={selectedSport}
        initialVenue={selectedVenue}
      />
    </div>
  );
};

export default Home;
