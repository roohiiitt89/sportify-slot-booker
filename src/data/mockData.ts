
// Mock data for venues
export const venues = [
  {
    id: 1,
    name: "Elite Sports Complex",
    description: "Premier multi-sport facility with state-of-the-art equipment",
    image: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=1000&auto=format&fit=crop",
    location: "123 Sports Ave, Downtown",
    rating: 4.8,
    sports: ["Basketball", "Tennis", "Swimming"]
  },
  {
    id: 2,
    name: "Victory Stadium",
    description: "Professional-grade stadium for field sports and events",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?q=80&w=1000&auto=format&fit=crop",
    location: "456 Champions Blvd, Westside",
    rating: 4.7,
    sports: ["Football", "Soccer", "Rugby"]
  },
  {
    id: 3,
    name: "Fitness Hub Arena",
    description: "Modern indoor facility for year-round training and matches",
    image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1000&auto=format&fit=crop",
    location: "789 Athletic Dr, Eastside",
    rating: 4.5,
    sports: ["Volleyball", "Badminton", "Table Tennis"]
  },
  {
    id: 4,
    name: "Aquatic Center",
    description: "Olympic-sized pools and professional diving facilities",
    image: "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=1000&auto=format&fit=crop",
    location: "321 Wave Lane, Northside",
    rating: 4.9,
    sports: ["Swimming", "Diving", "Water Polo"]
  }
];

// Mock data for sports
export const sports = [
  {
    id: 1,
    name: "Basketball",
    description: "Indoor courts with professional flooring and equipment",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop",
    popularity: 98,
    venues: ["Elite Sports Complex", "Fitness Hub Arena"]
  },
  {
    id: 2,
    name: "Tennis",
    description: "Indoor and outdoor courts available for all skill levels",
    image: "https://images.unsplash.com/photo-1622279457486-28f309b1c8b7?q=80&w=1000&auto=format&fit=crop",
    popularity: 92,
    venues: ["Elite Sports Complex", "Victory Stadium"]
  },
  {
    id: 3,
    name: "Swimming",
    description: "Olympic-sized pools with professional coaching available",
    image: "https://images.unsplash.com/photo-1565108143329-3ad64b4d7d2e?q=80&w=1000&auto=format&fit=crop",
    popularity: 95,
    venues: ["Aquatic Center", "Elite Sports Complex"]
  },
  {
    id: 4,
    name: "Soccer",
    description: "World-class pitches for the beautiful game",
    image: "https://images.unsplash.com/photo-1517747614396-d21a5b20361e?q=80&w=1000&auto=format&fit=crop",
    popularity: 97,
    venues: ["Victory Stadium"]
  },
  {
    id: 5,
    name: "Volleyball",
    description: "Indoor and beach volleyball courts available",
    image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000&auto=format&fit=crop",
    popularity: 89,
    venues: ["Fitness Hub Arena", "Elite Sports Complex"]
  },
  {
    id: 6,
    name: "Badminton",
    description: "Professional courts with proper lighting and equipment",
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000&auto=format&fit=crop",
    popularity: 86,
    venues: ["Fitness Hub Arena"]
  }
];

// Mock sports quotes for rotating display
export const sportsQuotes = [
  {
    id: 1,
    quote: "Champions keep playing until they get it right.",
    author: "Billie Jean King"
  },
  {
    id: 2,
    quote: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    id: 3,
    quote: "It's not whether you get knocked down; it's whether you get up.",
    author: "Vince Lombardi"
  },
  {
    id: 4,
    quote: "Talent wins games, but teamwork and intelligence win championships.",
    author: "Michael Jordan"
  },
  {
    id: 5,
    quote: "The more difficult the victory, the greater the happiness in winning.",
    author: "Pele"
  },
  {
    id: 6,
    quote: "You are never really playing an opponent. You are playing yourself.",
    author: "Arthur Ashe"
  }
];

// Generate available time slots from 5 AM to 12 AM
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 5; hour < 24; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    slots.push({
      id: `slot-${hour}`,
      time: `${displayHour}:00 ${period}`,
      hour: hour,
      available: Math.random() > 0.3 // 70% chance slot is available
    });
  }
  return slots;
};

// Mock user bookings
export const userBookings = [
  {
    id: "booking-1",
    sport: "Basketball",
    venue: "Elite Sports Complex",
    court: "Court 3",
    date: "2025-05-01",
    slots: ["8:00 AM", "9:00 AM"],
    status: "confirmed"
  },
  {
    id: "booking-2",
    sport: "Tennis",
    venue: "Elite Sports Complex",
    court: "Court 1",
    date: "2025-05-05",
    slots: ["4:00 PM", "5:00 PM"],
    status: "confirmed"
  },
  {
    id: "booking-3",
    sport: "Swimming",
    venue: "Aquatic Center",
    court: "Lane 4",
    date: "2025-05-10",
    slots: ["6:00 PM"],
    status: "pending"
  }
];
