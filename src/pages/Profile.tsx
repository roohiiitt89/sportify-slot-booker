
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Profile: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Fetch user bookings with proper error handling and improved nested structure
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          courts(
            id, 
            name,
            venues:venue_id(
              id,
              name
            ),
            sports:sport_id(
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });
        
      if (error) {
        toast.error("Failed to fetch bookings");
        throw error;
      }
      
      // Add additional console logging to debug data structure
      console.log('Bookings data:', data);
      
      return data || [];
    },
    enabled: !!isLoggedIn && !!user?.id,
  });

  // Filter bookings for upcoming and past
  const currentDate = new Date();
  const upcomingBookings = bookings?.filter(booking => 
    new Date(`${booking.booking_date}T${booking.end_time}`) >= currentDate
  ) || [];
  
  const pastBookings = bookings?.filter(booking => 
    new Date(`${booking.booking_date}T${booking.end_time}`) < currentDate
  ) || [];

  // Redirect to sign in if not logged in
  React.useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin');
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn || !user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account and bookings</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Info */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="w-24 h-24 bg-sports-navy/10 rounded-full flex items-center justify-center text-2xl font-bold text-sports-navy mx-auto mb-4">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h2 className="text-xl font-bold text-center">{user.name || 'User'}</h2>
                  <p className="text-gray-500 text-center">{user.email}</p>
                </div>
                
                <div className="py-2 border-t border-gray-100">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-gray-600 capitalize">{user.role || 'user'}</p>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full">Edit Profile</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Bookings */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-10">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Tabs defaultValue="upcoming">
                    <TabsList className="mb-4">
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="past">Past</TabsTrigger>
                      <TabsTrigger value="all">All Bookings</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upcoming">
                      {upcomingBookings.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingBookings.map(booking => (
                            <BookingItem key={booking.id} booking={booking} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <h3 className="text-lg font-medium text-gray-700">No upcoming bookings</h3>
                          <p className="mt-2 text-gray-500">Book a venue to see your bookings here</p>
                          <Button 
                            className="mt-4 bg-sports-green hover:bg-sports-green/90"
                            onClick={() => navigate('/venues')}
                          >
                            Browse Venues
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="past">
                      {pastBookings.length > 0 ? (
                        <div className="space-y-4">
                          {pastBookings.map(booking => (
                            <BookingItem key={booking.id} booking={booking} isCompleted />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <h3 className="text-lg font-medium text-gray-700">No past bookings</h3>
                          <p className="mt-2 text-gray-500">Your booking history will appear here</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="all">
                      {bookings && bookings.length > 0 ? (
                        <div className="space-y-4">
                          {bookings.map(booking => (
                            <BookingItem 
                              key={booking.id} 
                              booking={booking} 
                              isCompleted={new Date(`${booking.booking_date}T${booking.end_time}`) < currentDate} 
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <h3 className="text-lg font-medium text-gray-700">No bookings found</h3>
                          <p className="mt-2 text-gray-500">Book a venue to see your bookings here</p>
                          <Button 
                            className="mt-4 bg-sports-green hover:bg-sports-green/90"
                            onClick={() => navigate('/venues')}
                          >
                            Browse Venues
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Improved BookingItem component to correctly handle nested data
const BookingItem = ({ booking, isCompleted = false }) => {
  // Format time to 12-hour format with AM/PM
  const formatTime = (time: string) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  // Extract data from the nested structure with fallbacks
  const court = booking.courts || {};
  const venueName = court.venues?.name || 'Unknown Venue';
  const sportName = court.sports?.name || 'Unknown Sport';
  const courtName = court.name || 'Unknown Court';
  
  const bookingDate = new Date(booking.booking_date);
  const formattedDate = bookingDate.toLocaleDateString('en-US', { 
    weekday: 'short',
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <Card className="overflow-hidden">
      <div className={`p-4 ${isCompleted ? 'bg-gray-100' : 'bg-green-50'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium">{venueName}</h4>
            <p className="text-sm text-gray-600">{sportName} - {courtName}</p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-2 py-1 rounded-full text-xs ${
              isCompleted 
                ? 'bg-gray-200 text-gray-700' 
                : booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isCompleted ? 'Completed' : (booking.status === 'confirmed' ? 'Confirmed' : 'Pending')}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="text-sm font-medium">
              {formattedDate}<br />
              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="text-sm font-medium">₹{booking.total_price}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Profile;
