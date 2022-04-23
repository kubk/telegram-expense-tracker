import { DateTime } from 'luxon';

export const getDateRangeFromWeek = (year: number, weekNumber: number) => {
  const dateTime = DateTime.fromObject({
    weekYear: year,
    weekNumber: weekNumber,
  });

  if (!dateTime.isValid) {
    throw new Error(
      `Unable to parse date from week ${weekNumber}, year ${year}`
    );
  }

  return {
    from: dateTime.startOf('week').toJSDate(),
    to: dateTime.endOf('week').toJSDate(),
  };
};

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
