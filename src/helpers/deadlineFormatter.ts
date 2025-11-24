export function formatDeadline(isoString: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit'});
  const isToday = date.toDateString() === now.toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) {
    return `Today at ${timeStr}`;
  }
  if (isTomorrow) {
    return `Tomorrow at ${timeStr}`;
  }

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });

  return `${day} ${month} at ${timeStr}`;
}



export const loadItem = (isoString: string) => {
  if(!isoString || isoString.length < 1) return '';
  const dateObj = new Date(isoString); 
  const offset = dateObj.getTimezoneOffset() * 60000;
  const localDate = new Date(dateObj.getTime() - offset);
  return localDate.toISOString(); 
};