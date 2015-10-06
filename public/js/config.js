module.exports = {
  pikadayConfig: {
    defaultDate: moment().toDate(),
    maxDate: moment().toDate(),
    setDefaultDate: true,
    i18n: {
      previousMonth: '<',
      nextMonth: '>',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    }
  }
};