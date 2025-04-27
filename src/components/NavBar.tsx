
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Menu, X } from "lucide-react";

const NavBar: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold flex items-center"
        >
          <span className={`${isScrolled ? 'text-sports-navy' : 'text-white'}`}>
            Sportify
          </span>
          <span className="text-sports-green ml-1">Slots</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Home
          </Link>
          <Link 
            to="/venues" 
            className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Venues
          </Link>
          <Link 
            to="/sports" 
            className={`nav-link ${isScrolled ? 'text-gray-700' : 'text-white'}`}
          >
            Sports
          </Link>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`rounded-full ${isScrolled ? 'text-sports-navy hover:text-sports-green' : 'text-white hover:text-sports-green'}`}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user?.name}
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookings">My Bookings</Link>
                </DropdownMenuItem>
                {user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/signin">
                <Button 
                  variant={isScrolled ? "outline" : "secondary"}
                  size="sm"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  variant="default"
                  size="sm"
                  className={isScrolled ? "bg-sports-green hover:bg-sports-green/90" : ""}
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className={isScrolled ? "text-sports-navy" : "text-white"} />
          ) : (
            <Menu className={isScrolled ? "text-sports-navy" : "text-white"} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="flex flex-col px-4 py-4 space-y-4">
            <Link 
              to="/" 
              className="nav-link text-gray-700 pl-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/venues" 
              className="nav-link text-gray-700 pl-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Venues
            </Link>
            <Link 
              to="/sports" 
              className="nav-link text-gray-700 pl-2 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sports
            </Link>

            {isLoggedIn ? (
              <>
                <Link 
                  to="/profile" 
                  className="nav-link text-gray-700 pl-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <Link 
                  to="/bookings" 
                  className="nav-link text-gray-700 pl-2 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Bookings
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="nav-link text-gray-700 pl-2 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-left pl-2 py-2 text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button 
                    variant="default"
                    size="sm"
                    className="w-full bg-sports-green hover:bg-sports-green/90"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
