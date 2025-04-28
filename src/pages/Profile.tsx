
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '@/components/NavBar';

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
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-700">No past bookings</h3>
                      <p className="mt-2 text-gray-500">Your booking history will appear here</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all">
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
