export function formatDateAsHanaDate(date: Date) {
  let month = "" + (date.getMonth() + 1),
    day = "" + date.getDate(),
    year = date.getFullYear();

  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return [year, month, day].join("-");
}

// Formats date as yyyymmdd
export function getFormattedDate() {
  const date = new Date();

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  // const hours = String(date.getHours()).padStart(2, "0");
  // const minutes = String(date.getMinutes()).padStart(2, "0");

  const formattedDate = `${year}${month}${day}`;

  return formattedDate;
}

export function formatDate(format: string, date?: Date | undefined) {
  date = date ?? new Date();
  const map: { [key: string]: string } = {
    yyyy: date.getFullYear().toString(),
    yy: String(date.getFullYear()).slice(-2),
    mm: String(date.getMonth() + 1).padStart(2, "0"),
    dd: String(date.getDate()).padStart(2, "0"),
    hh: String(date.getHours()).padStart(2, "0"),
    mi: String(date.getMinutes()).padStart(2, "0"),
    ss: String(date.getSeconds()).padStart(2, "0"),
    sss: String(date.getMilliseconds()).padStart(3, "0"),
  };
  return format.replace(/yyyy|yy|mm|dd|hh|mi|ss|sss/gi, (matched) => map[matched.toLowerCase()]);
}
