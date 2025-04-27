
import React, { useState, useEffect } from 'react';
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

  // Rotate quotes every 5 seconds
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

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="video-container">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://player.vimeo.com/external/449895997.sd.mp4?s=b5073fd18266f2655c7aeff36c970d05fbbec5ad&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
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
      
      {/* Featured Venues Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Venues</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover premium sports facilities designed for exceptional experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {venues.map((venue, index) => (
              <div 
                key={venue.id} 
                className="venue-card group" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img 
                  src={venue.image} 
                  alt={venue.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
                  <h3 className="text-xl font-bold mb-1">{venue.name}</h3>
                  <p className="text-sm text-white/90 mb-3">{venue.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sports-orange">★</span>
                      <span className="text-sm">{venue.rating}</span>
                    </div>
                    <Button 
                      onClick={() => openBookingModal(undefined, venue.name)}
                      variant="secondary"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-sports-navy hover:bg-sports-green hover:text-white"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Sports</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your favorite sport and book a slot today
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sports.map((sport, index) => (
              <div 
                key={sport.id}
                className="sport-card group bg-white rounded-xl overflow-hidden shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-48">
                  <img 
                    src={sport.image} 
                    alt={sport.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold">{sport.name}</h3>
                    <div className="text-sm bg-sports-green/10 text-sports-green py-1 px-2 rounded-full">
                      {sport.popularity}% Popular
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{sport.description}</p>
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
                    className="w-full bg-sports-navy hover:bg-sports-green"
                  >
                    Book a Session
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* For You Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">For You</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Personalized recommendations based on your interests
            </p>
          </div>
          
          {/* This would typically use user data for personalized recommendations */}
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
      
      {/* CTA Section */}
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
      
      {/* Booking Modal */}
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
