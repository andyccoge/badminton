export function stamp_to_time(timestamp, formattedTime='Y/m/d H:i') {
  if(!timestamp){ return ''; }
  if(typeof(timestamp) === 'string'){ timestamp = Number(timestamp) }
  if(timestamp.toString().length==10){
    timestamp = Math.floor(timestamp * 1000);
  }
  let date = new Date(timestamp);
  
  let replaces = {
    Y: date.getFullYear(),
    m: ("0" + (date.getMonth()+1)).substr(-2),
    d: ("0" + date.getDate()).substr(-2),
    H: ("0" + date.getHours()).substr(-2),
    i: ("0" + date.getMinutes()).substr(-2),
    s: ("0" + date.getSeconds()).substr(-2),
  }
  let keys = Object.keys(replaces);
  for (let x = 0; x < keys.length; x++) {
    const key = keys[x];
    formattedTime = formattedTime.replace(key, replaces[key]);
  }
  return formattedTime;
}