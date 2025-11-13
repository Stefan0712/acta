// Formats a Date object into "dd Mmm yyyy HH:mm"
export const getDateAndHour = (date: Date): string => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Get all the individual parts
  const day = date.getDate();
  const month = months[date.getMonth()]; // getMonth() is 0-indexed
  const year = date.getFullYear();
  
  // Pad the time with a '0' if it's a single digit
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  // Assemble the final string
  return `${day} ${month} ${year} ${hours}:${minutes}`;
};