const dayjs = require('dayjs');

exports.intervalSameDay = (date) => {
  const d = dayjs(date).format('DD MMM');
  return `${d} - ${d}`;
};
