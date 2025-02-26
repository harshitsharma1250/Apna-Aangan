export default function PlaceImg({ place, className = null }) {
    if (!place?.photos?.length) {
      return null;
    }
  
    if (!className) {
      className = 'object-cover';
    }
  
    return (
      <img
        src={`http://localhost:3000/uploads/${place.photos[0]}`}
        className={className}
        alt="Place"
      />
    );
  }
  