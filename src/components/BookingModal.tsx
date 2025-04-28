
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
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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

// Create booking form schema with validation
const bookingFormSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  venue: z.string().min(1, "Venue is required"),
  court: z.string().min(1, "Court is required"),
  date: z.date({
    required_error: "Date is required",
  }),
  name: z.string().min(1, "Name is required").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
});

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose,
  initialSport,
  initialVenue
}) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn, user } = useAuth();
  
  // Initialize react-hook-form
  const form = useForm<z.infer<typeof bookingFormSchema>>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      sport: initialSport || "",
      venue: initialVenue || "",
      court: "",
      date: new Date(),
      name: "",
      phone: "",
    },
  });
  
  // Get form values for queries
  const selectedSport = form.watch("sport");
  const selectedVenue = form.watch("venue");
  const selectedCourt = form.watch("court");
  const date = form.watch("date");
  
  // Format time from 24-hour to 12-hour format with AM/PM
  const formatTime = (time: string) => {
    if (!time) return '';
    
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
  
  // Initialize form with defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset({
        sport: initialSport || "",
        venue: initialVenue || "",
        court: "",
        date: new Date(),
        name: "",
        phone: "",
      });
      setSelectedSlots([]);
    }
  }, [isOpen, initialSport, initialVenue, form]);

  const onSubmit = async (values: z.infer<typeof bookingFormSchema>) => {
    // Validate selected slots
    if (selectedSlots.length === 0) {
      toast.error("Please select at least one time slot");
      return;
    }

    // Validate guest info if not logged in
    if (!isLoggedIn) {
      if (!values.name || !values.phone) {
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
          user_id: user?.id || null, // Can be null for non-logged in users
          guest_name: !isLoggedIn ? values.name : null,
          guest_phone: !isLoggedIn ? values.phone : null,
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
        
        if (error) {
          console.error("Booking error:", error);
          throw error;
        }
        
        return data;
      });
      
      await Promise.all(bookingPromises);
      
      toast.success(`You have booked ${selectedSlots.length} slot(s) successfully!`);
      
      onClose();
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("There was an error processing your booking. Please try again.");
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Sport</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={sportsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sports?.map(sport => (
                          <SelectItem key={sport.id} value={sport.name}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Venue</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={venuesLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a venue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {venues?.map(venue => (
                          <SelectItem key={venue.id} value={venue.name}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="court"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Court</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedVenue || !selectedSport || courtsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a court" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courts?.map(court => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Select Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) => date < new Date()}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your full name" 
                          {...field} 
                          required={!isLoggedIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your phone number" 
                          {...field} 
                          required={!isLoggedIn}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !selectedSport || !selectedVenue || !selectedCourt || !date || selectedSlots.length === 0}
                className="bg-sports-green hover:bg-sports-green/90"
              >
                {isSubmitting ? "Booking..." : "Book Now"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
