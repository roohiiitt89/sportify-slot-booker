
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabaseClient";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";

interface BookingsTableProps {
  venueId?: string;
  isSuperAdmin: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ venueId, isSuperAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-bookings', venueId, isSuperAdmin],
    queryFn: async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          courts:court_id(
            name, 
            venue_id,
            venues:venue_id(name),
            sports:sport_id(name)
          ),
          profiles:user_id(full_name, email)
        `);
        
      // If not super admin, filter by venue
      if (!isSuperAdmin && venueId) {
        query = query.in('court_id', 
          supabase
            .from('courts')
            .select('id')
            .eq('venue_id', venueId)
        );
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
        throw error;
      }
      
      return data || [];
    }
  });

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
      
    if (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } else {
      toast.success("Booking status updated");
      refetch();
    }
  };

  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      !searchTerm ||
      booking.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.courts.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.courts.venues.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load bookings</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-2">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Venue / Court</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                  </TableCell>
                  <TableCell>
                    {booking.profiles?.full_name || booking.guest_name || "Anonymous"}
                    <br />
                    <span className="text-xs text-gray-500">{booking.profiles?.email || booking.guest_phone || "No contact"}</span>
                  </TableCell>
                  <TableCell>
                    {booking.courts.venues.name}
                    <br />
                    <span className="text-xs text-gray-500">{booking.courts.name}</span>
                  </TableCell>
                  <TableCell>{booking.courts.sports.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {booking.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="text-xs px-2 py-1 h-auto border-green-500 text-green-700 hover:bg-green-50"
                          >
                            Confirm
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-xs px-2 py-1 h-auto border-red-500 text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                            className="text-xs px-2 py-1 h-auto border-blue-500 text-blue-700 hover:bg-blue-50"
                          >
                            Complete
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-xs px-2 py-1 h-auto border-red-500 text-red-700 hover:bg-red-50"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BookingsTable;
