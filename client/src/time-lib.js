function toLocalTimeISOString(d) {
  let s = "";
  const d2 = new Date();
  d2.setTime(d.getTime());
  if(d2) {
    d2.setMinutes(d2.getMinutes() - d2.getTimezoneOffset());
    d2.setSeconds(0);
    d2.setMilliseconds(0);
    s = d2.toISOString().slice(0, -1);
  }

  return s;
}

export {toLocalTimeISOString};