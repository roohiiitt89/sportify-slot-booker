
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from "@/lib/supabaseClient";
import NavBar from '@/components/NavBar';
import AdminHeader from '@/components/AdminPanel/AdminHeader';
import BookingsTable from '@/components/AdminPanel/BookingsTable';
import VenueManagement from '@/components/AdminPanel/VenueManagement';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tabFromUrl = searchParams.get('tab') || 'bookings';
  const venueFromUrl = searchParams.get('venue');

  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>(venueFromUrl || undefined);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/signin');
    }
  }, [isLoggedIn, navigate]);

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    if (selectedVenueId) {
      params.set('venue', selectedVenueId);
    }
    navigate(`/admin?${params.toString()}`);
  }, [activeTab, navigate, selectedVenueId]);

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching user roles:", error);
        throw error;
      }
      
      return roles;
    },
    enabled: !!user?.id
  });

  const isSuperAdmin = userRoles?.some(r => r.role === 'super_admin') || false;
  const isAdmin = userRoles?.some(r => r.role === 'admin') || isSuperAdmin;

  // Redirect non-admins
  useEffect(() => {
    if (!isLoading && userRoles && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate, userRoles]);

  if (isLoading || !userRoles) {
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
        <AdminHeader 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={isSuperAdmin ? 'super_admin' : 'admin'} 
        />
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'bookings' && (
            <BookingsTable venueId={selectedVenueId} isSuperAdmin={isSuperAdmin} />
          )}
          
          {activeTab === 'venues' && (
            <VenueManagement isSuperAdmin={isSuperAdmin} />
          )}
          
          {activeTab === 'users' && isSuperAdmin && (
            <div className="p-4 text-center">
              <p>Users management will be implemented in the next phase.</p>
            </div>
          )}
          
          {activeTab === 'reports' && isSuperAdmin && (
            <div className="p-4 text-center">
              <p>Reports will be implemented in the next phase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
