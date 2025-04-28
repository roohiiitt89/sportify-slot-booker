import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from "@/utils/supabaseClient"; // make sure supabase client is correctly initialized

const VenueDetail: React.FC = () => {
  const { id } = useParams(); // Extract the venueId from URL
  const [venue, setVenue] = useState<null | any>(null);

  useEffect(() => {
    // Fetch venue data based on the ID from Supabase
    const fetchVenue = async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single(); // We expect only one venue with the given ID

      if (error) {
        console.error('Error fetching venue:', error);
      } else {
        setVenue(data);
      }
    };

    if (id) {
      fetchVenue();
    }
  }, [id]);

  if (!venue) {
    return <div>Loading...</div>; // Optionally show a loading state
  }

  return (
    <div>
      <h1>{venue.name}</h1>
      <img src={venue.image_url || '/placeholder.svg'} alt={venue.name} />
      <p>{venue.description}</p>
      <p>{venue.location}</p>
      {/* Add other details as necessary */}
    </div>
  );
};

export default VenueDetail;


