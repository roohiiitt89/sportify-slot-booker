import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: string;
  initialVenue?: string;
}

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  available: boolean;
  price: number;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose,
  initialSport,
  initialVenue
}) => {
  const [selectedSport, setSelectedSport] = useState(initialSport || "");
  const [selectedVenue, setSelectedVenue] = useState(initialVenue || "");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth();
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hoursNum = parseInt(hours);
    const ampm = hoursNum >= 12 ? 'PM' : 'AM';
    const hours12 = hoursNum % 12 || 12;
    return `${hours12}:${minutes} ${ampm}`;
  };

  // Fetch sports from Supabase
  const { data: sports, isLoading: sportsLoading } = useQuery({
    queryKey: ['sports-for-booking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sports')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch venues from Supabase
  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ['venues-for-booking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    }
  });
  
  // Fetch courts based on selected venue and sport
  const { data: courts, isLoading: courtsLoading } = useQuery({
    queryKey: ['courts-for-booking', selectedVenue, selectedSport],
    queryFn: async () => {
      const { data: venueData } = await supabase
        .from('venues')
        .select('id')
        .eq('name', selectedVenue)
        .single();

      const { data: sportData } = await supabase
        .from('sports')
        .select('id')
        .eq('name', selectedSport)
        .single();
      
      if (!venueData || !sportData) return [];
      
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('venue_id', venueData.id)
        .eq('sport_id', sportData.id)
        .eq('is_active', true);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedVenue && !!selectedSport
  });
  
  // Fetch template slots for the selected court
  const { data: templateSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['template-slots', selectedCourt],
    queryFn: async () => {
      if (!selectedCourt) return [];
      
      const dayOfWeek = date ? date.getDay() : new Date().getDay();
      
      const { data, error } = await supabase
        .from('template_slots')
        .select('*')
        .eq('court_id', selectedCourt)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      
      return data.map(slot => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        available: true, // We'll check availability against bookings below
        price: slot.price
      }));
    },
    enabled: !!selectedCourt && !!date
  });
  
  // Fetch existing bookings for the selected date and court
  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings', selectedCourt, date],
    queryFn: async () => {
      if (!selectedCourt || !date) return [];
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('court_id', selectedCourt)
        .eq('booking_date', formattedDate);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedCourt && !!date
  });
  
  // Process time slots and check availability
  const timeSlots: TimeSlot[] = React.useMemo(() => {
    return templateSlots.map(slot => {
      // Check if this slot is already booked
      const isBooked = bookings.some(booking => 
        booking.start_time === slot.start_time && 
        booking.end_time === slot.end_time
      );
      
      return {
        ...slot,
        available: !isBooked
      };
    });
  }, [templateSlots, bookings]);

  const handleSlotSelection = (slotTime: string) => {
    if (selectedSlots.includes(slotTime)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotTime));
    } else {
      setSelectedSlots([...selectedSlots, slotTime]);
    }
  };

  const isSlotAvailable = (slot: TimeSlot) => {
    return slot.available;
  };
  
  useEffect(() => {
    // Reset selected slots when court or date changes
    setSelectedSlots([]);
  }, [selectedCourt, date]);

  const handleSubmit = async () => {
    if (!selectedSport || !selectedVenue || !selectedCourt || !date || selectedSlots.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields and select at least one time slot.",
      });
      return;
    }

    if (!isLoggedIn) {
      if (!name || !phone) {
        toast({
          variant: "destructive",
          title: "Missing information",
          description: "Please provide your name and phone number.",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Create bookings for each selected slot
      const bookingPromises = selectedSlots.map(async (slotTime) => {
        const slot = timeSlots.find(s => s.start_time === slotTime);
        if (!slot) return null;
        
        const bookingData = {
          court_id: selectedCourt,
          user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Anonymous booking if not logged in
          booking_date: format(date as Date, 'yyyy-MM-dd'),
          start_time: slot.start_time,
          end_time: slot.end_time,
          total_price: slot.price,
          status: 'pending'
        };
        
        const { data, error } = await supabase
          .from('bookings')
          .insert(bookingData)
          .select();
        
        if (error) throw error;
        return data;
      });
      
      await Promise.all(bookingPromises);
      
      toast({
        title: "Booking Successful",
        description: `You have booked ${selectedSlots.length} slot(s) for ${selectedSport} at ${selectedVenue} on ${format(date as Date, "PPP")}`,
      });
      
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Book Your Slot</DialogTitle>
          <DialogDescription>
            Choose your preferred sport, venue, and time slots to make a booking.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Select Sport</Label>
              <Select 
                value={selectedSport} 
                onValueChange={setSelectedSport}
                disabled={sportsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports?.map(sport => (
                    <SelectItem key={sport.id} value={sport.name}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venue">Select Venue</Label>
              <Select 
                value={selectedVenue} 
                onValueChange={setSelectedVenue}
                disabled={venuesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues?.map(venue => (
                    <SelectItem key={venue.id} value={venue.name}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="court">Select Court</Label>
              <Select 
                value={selectedCourt} 
                onValueChange={setSelectedCourt}
                disabled={!selectedVenue || !selectedSport || courtsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  {courts?.map(court => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Available Time Slots</Label>
            <p className="text-sm text-gray-500">Select one or more time slots</p>
            
            {slotsLoading ? (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-sports-green" />
              </div>
            ) : timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`p-3 rounded-md text-center cursor-pointer transition-colors ${
                      !isSlotAvailable(slot)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : selectedSlots.includes(slot.start_time)
                        ? 'bg-sports-green text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => {
                      if (isSlotAvailable(slot)) {
                        handleSlotSelection(slot.start_time);
                      }
                    }}
                  >
                    <div>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</div>
                    <div className="text-xs mt-1">
                      {isSlotAvailable(slot) 
                        ? `₹${slot.price}` 
                        : 'Booked'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-center">
                {selectedCourt 
                  ? "No available slots for this selection." 
                  : "Select a court to see available slots."}
              </div>
            )}
            
            {selectedSlots.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="font-medium text-sm">
                  Selected: {selectedSlots.length} slots
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total: ₹{selectedSlots.reduce((sum, slotTime) => {
                    const slot = timeSlots.find(s => s.start_time === slotTime);
                    return sum + (slot?.price || 0);
                  }, 0)}
                </p>
              </div>
            )}
          </div>

          {!isLoggedIn && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedSport || !selectedVenue || !selectedCourt || !date || selectedSlots.length === 0}
            className="bg-sports-green hover:bg-sports-green/90"
          >
            {isSubmitting ? "Booking..." : "Book Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
