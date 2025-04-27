import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import NavBar from '@/components/NavBar';
import { ArrowRight, Play, Pause } from 'lucide-react'; // Import play/pause icons
import { venues, sports, sportsQuotes } from '@/data/mockData';
import BookingModal from '@/components/BookingModal';

const Home: React.FC = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | undefined>(undefined);
  const [selectedVenue, setSelectedVenue] = useState<string | undefined>(undefined);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => 
        prevIndex === sportsQuotes.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Ensure video loops properly
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(e => console.log("Video play error:", e));
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, []);

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isVideoPlaying) {
      video.pause();
    } else {
      video.play().catch(e => console.log("Video play error:", e));
    }
    setIsVideoPlaying(!isVideoPlaying);
  };

  const openBookingModal = (sport?: string, venue?: string) => {
    setSelectedSport(sport);
    setSelectedVenue(venue);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="video-container absolute w-full h-full">
          <video 
            ref={videoRef}
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          >
            <source src="https://mhkwikrckmlfdfljsbfx.supabase.co/storage/v1/object/public/videos//mixkit-one-on-one-in-a-soccer-game-43483-full-hd%20(1).mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Play/Pause Button */}
          <button 
            onClick={toggleVideoPlayback}
            className={`absolute bottom-4 right-4 bg-black/50 rounded-full p-3 transition-opacity duration-300 ${
              isVideoPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          >
            {isVideoPlaying ? (
              <Pause className="h-6 w-6 text-white" />
            ) : (
              <Play className="h-6 w-6 text-white" />
            )}
          </button>
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
            {venues.map((venue, index) => (
              <div 
                key={venue.id} 
                className="venue-card transform transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
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
            {sports.map((sport, index) => (
              <div 
                key={sport.id}
                className="sport-card overflow-hidden rounded-2xl bg-white shadow-lg transform transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48">
                  <img 
                    src={sport.image} 
                    alt={sport.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
