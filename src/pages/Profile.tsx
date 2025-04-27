
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';
import { userBookings } from '@/data/mockData';

const Profile: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

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
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-center">{user.name}</h2>
                  <p className="text-gray-500 text-center">{user.email}</p>
                </div>
                
                <div className="py-2 border-t border-gray-100">
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                </div>
                
                <div className="py-2 border-t border-gray-100">
                  <p className="text-sm font-medium">Member Since</p>
                  <p className="text-sm text-gray-600">April 2025</p>
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
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="all">All Bookings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming">
                    <div className="space-y-4">
                      {userBookings.filter(b => b.status !== "completed").map(booking => (
                        <div 
                          key={booking.id} 
                          className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{booking.sport}</h3>
                              <p className="text-sm text-gray-600">{booking.venue} • {booking.court}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">
                                {booking.date} • {booking.slots.join(', ')}
                              </p>
                            </div>
                            <div>
                              <Button variant="outline" size="sm" className="mr-2">
                                Reschedule
                              </Button>
                              <Button variant="destructive" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <p className="text-gray-500 text-center py-6">No past bookings found.</p>
                  </TabsContent>
                  
                  <TabsContent value="all">
                    <div className="space-y-4">
                      {userBookings.map(booking => (
                        <div 
                          key={booking.id} 
                          className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{booking.sport}</h3>
                              <p className="text-sm text-gray-600">{booking.venue} • {booking.court}</p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                booking.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">
                                {booking.date} • {booking.slots.join(', ')}
                              </p>
                            </div>
                            <div>
                              <Button variant="outline" size="sm" className="mr-2">
                                Reschedule
                              </Button>
                              <Button variant="destructive" size="sm">
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
