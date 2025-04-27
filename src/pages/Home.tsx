
import React from 'react';
import NavBar from '@/components/NavBar';
import FeaturedVenues from '@/components/FeaturedVenues';
import FeaturedSports from '@/components/FeaturedSports';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Add NavBar component */}
      <NavBar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="video-container">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="hero-text mb-6">
            Book Your Next <br />
            <span className="text-primary">Sports Adventure</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience premium sports facilities and book your slots with ease.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <PlayCircle className="mr-2" />
            Book Now
          </Button>
        </div>
      </section>

      {/* Featured Sections */}
      <FeaturedVenues />
      <FeaturedSports />

      {/* Call to Action */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join us today and experience the best sports facilities in your area.
          </p>
          <Button size="lg" variant="default">
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
