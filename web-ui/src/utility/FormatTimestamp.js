export default function FormatTimestamp(timestamp) {
  if (!timestamp) return;
  
  var splitArray = timestamp.split(':');
  var hours = parseInt(splitArray[0]);
  var minutes = parseInt(splitArray[1]);
  var seconds = parseInt(splitArray[2]);

  if (hours <= 0) {
    hours = "";
  } else {
    hours = `${hours}h `
  }
  if (minutes <= 0) {
    minutes = ""
  } else {
    minutes = `${minutes}m `
  }
  seconds = `${seconds}s`

  return `${hours}${minutes}${seconds}`
}
