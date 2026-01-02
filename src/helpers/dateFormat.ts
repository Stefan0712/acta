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
  const month = months[dateObject.getMonth()]; 
  // const year = dateObject.getFullYear();
  
  // Pad the time with a '0' if it's a single digit
  const hours = String(dateObject.getHours()).padStart(2, '0');
  const minutes = String(dateObject.getMinutes()).padStart(2, '0');

  return `${day} ${month} at ${hours}:${minutes}`;
};

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    return '> 1 week';
  }
};