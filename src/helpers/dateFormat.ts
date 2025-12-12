// Formats a Date object into "dd Mmm yyyy HH:mm"
export const getDateAndHour = (date: Date): string => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  let dateObject
  if (typeof date === 'string'){
    dateObject = new Date(date);
  } else {
    dateObject = date;
  }
  // Get all the individual parts
  const day = dateObject.getDate();
  const month = months[dateObject.getMonth()]; // getMonth() is 0-indexed
  const year = dateObject.getFullYear();
  
  // Pad the time with a '0' if it's a single digit
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');

  // Assemble the final string
  return `${day} ${month} ${year} ${hours}:${minutes}`;
};