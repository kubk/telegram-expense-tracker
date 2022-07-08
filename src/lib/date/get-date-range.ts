import { DateTime } from 'luxon';

export const getDateRangeFromMonth = (year: number, month: number) => {
  const dateTime = DateTime.fromObject({
    month: month,
    year: year,
  });

  if (!dateTime.isValid) {
    throw new Error(`Unable to parse date from month ${month}, year ${year}`);
  }

  return {
    from: dateTime.startOf('month').toJSDate(),
    to: dateTime.endOf('month').toJSDate(),
  };
};
