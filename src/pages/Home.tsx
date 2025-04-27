import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import { ArrowRight } from 'lucide-react';
import { venues, sports, sportsQuotes } from '@/data/mockData';
import BookingModal from '@/components/BookingModal';

const Home: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | undefined>(undefined);
  const [selectedVenue, setSelectedVenue] = useState<string | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        prevIndex === sportsQuotes.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Enhanced video playback handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = () => {
      video.muted = true;
      video.play()
        .then(() => {
          video.setAttribute('data-playing', 'true');
        })
        .catch(error => {
          setTimeout(attemptPlay, 500);
        });
    };

    attemptPlay();

    // Ensure playback resumes after any interruptions
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        attemptPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const openBookingModal = (sport?: string, venue?: string) => {
    setSelectedSport(sport);
    setSelectedVenue(venue);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fefefe] text-gray-900">
      <NavBar />
      
      {/* Hero Section with Video Background */}
      <section className="relative h-[90vh] overflow-hidden rounded-b-3xl bg-gray-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover absolute top-0 left-0"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
        >
          <source src="https://mhkwikrckmlfdfljsbfx.supabase.co/storage/v1/object/public/videos//mixkit-one-on-one-in-a-soccer-game-43483-full-hd%20(1).mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Content Overlay - Matched to your original styling */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 md:px-12 backdrop-blur-sm bg-black/30">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              Book Now for <span className="text-sports-green">Your Game</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 italic mb-8">
              Reserve your favorite sports venues with just a few clicks
            </p>
            <Button 
              onClick={() => openBookingModal()}
              size="lg" 
              className="bg-sports-green hover:bg-sports-green/90 text-white rounded-full px-8 py-6 text-lg"
            >
              Book a Slot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
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
            {venues.map((venue) => (
              <div 
                key={venue.id} 
                className="venue-card transform transition-all duration-300 hover:scale-105"
              >
                <img 
                  src={venue.image} 
                  alt={venue.name} 
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl">
                  <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                  <p className="text-sm text-white/90 mb-3">{venue.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sports-green">★</span>
                      <span className="text-sm">{venue.rating}</span>
                    </div>
                    <Button 
                      onClick={() => openBookingModal(undefined, venue.name)}
                      variant="secondary"
                      size="sm"
                      className="bg-white text-gray-800 hover:bg-sports-green hover:text-white transition-colors"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sports Section */}
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
            {sports.map((sport) => (
              <div 
                key={sport.id}
                className="overflow-hidden rounded-2xl bg-white shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-48">
                  <img 
                    src={sport.image} 
                    alt={sport.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{sport.name}</h3>
                    <div className="text-sm bg-sports-green/10 text-sports-green py-1 px-3 rounded-full">
                      {sport.popularity}% Popular
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 line-clamp-2">{sport.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sport.venues.map(venue => (
                      <span 
                        key={venue} 
                        className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-full"
                      >
                        {venue}
                      </span>
                    ))}
                  </div>
                  <Button 
                    onClick={() => openBookingModal(sport.name)}
                    className="w-full bg-sports-green hover:bg-sports-green/90 text-white"
                  >
                    Book a Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sports Quotes Section */}
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
                      ? 'opacity-100 scale-100' 
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

      {/* CTA Section */}
      <section className="py-20 bg-sports-navy text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Book Your Next Game?</h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of sports enthusiasts who have already booked their perfect sports experience.
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

      {/* Footer */}
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
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-white/70 hover:text-white">FAQ</Link></li>
                <li><Link to="/contact" className="text-white/70 hover:text-white">Contact Us</Link></li>
              </ul>
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
