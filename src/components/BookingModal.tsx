
import React, { useState } from 'react';
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
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateTimeSlots, venues, sports } from '@/data/mockData';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSport?: string;
  initialVenue?: string;
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
  const [timeSlots, setTimeSlots] = useState(generateTimeSlots());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isLoggedIn, user } = useAuth();

  const handleSlotSelection = (slotTime: string) => {
    if (selectedSlots.includes(slotTime)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotTime));
    } else {
      setSelectedSlots([...selectedSlots, slotTime]);
    }
  };

  const isSlotAvailable = (slot: { id: string; time: string; available: boolean }) => {
    return slot.available;
  };

  const handleSubmit = () => {
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

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Booking Successful",
        description: `You have booked ${selectedSlots.length} slot(s) for ${selectedSport} at ${selectedVenue} on ${format(date as Date, "PPP")}`,
      });
      setIsSubmitting(false);
      onClose();
    }, 1500);
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map(venue => (
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
                disabled={!selectedVenue || !selectedSport}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="court1">Court 1</SelectItem>
                  <SelectItem value="court2">Court 2</SelectItem>
                  <SelectItem value="court3">Court 3</SelectItem>
                  <SelectItem value="court4">Court 4</SelectItem>
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
            
            <div className="slot-grid">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`slot-item ${
                    !isSlotAvailable(slot)
                      ? 'slot-booked'
                      : selectedSlots.includes(slot.time)
                      ? 'slot-selected'
                      : 'slot-available'
                  }`}
                  onClick={() => {
                    if (isSlotAvailable(slot)) {
                      handleSlotSelection(slot.time);
                    }
                  }}
                >
                  {slot.time}
                </div>
              ))}
            </div>
            
            {selectedSlots.length > 0 && (
              <div className="mt-2 p-2 bg-gray-50 rounded-md">
                <p className="font-medium text-sm">Selected: {selectedSlots.join(', ')}</p>
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
