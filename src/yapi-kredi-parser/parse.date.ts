export const parseDate = (date: string, time: string) => {
  const [day, monthNumber, year] = date.split('/');
  const [hours, minutes, seconds] = time.split(':');

  return new Date(
    parseInt(year),
    parseInt(monthNumber) - 1,
    parseInt(day),
    parseInt(hours),
    parseInt(minutes),
    parseInt(seconds)
  );
};
