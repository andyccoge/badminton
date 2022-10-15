import { useToast } from "vue-toastification";
const toast = useToast();

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

export function copy_text(text){
  var textArea = document.createElement("textarea");
  textArea.value = text;
  // Avoid show element
  textArea.style.top = "100vh";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    var successful = document.execCommand('copy');
    if(successful){ toast.success('複製文字：'+text); }
    else{ toast.error('複製文字失敗'); }
  } catch (err) {
    toast.error('複製文字發生錯誤');
  }

  document.body.removeChild(textArea);
}

export function window_open(url=''){
  if(url){ window.open(url); }
}
export function redirect(url=''){
  if(url){ location.href= url; }
}

export function get_href_attr(attr=''){
  if(attr==''){ return attr; }
  var Request = new Object();	 
  Request = GetRequest();

  function GetRequest() {		 
    var url = location.search; 
    var theRequest = new Object();		 
    if (url.indexOf("?") != -1) {		 
      var str = url.substr(1);		 
      let strs = str.split("&");		 
      for(var i = 0; i < strs.length; i++) {		 
        theRequest[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);		 
      }		 
    }		 
    return theRequest;		 
  }

  if(typeof(Request[attr])!='undefined'){
    attr = Request[attr];
  }else{
    attr = '';
  }
  return attr;
}

export function get_user_name(users, user_id){
  for (let index = 0; index < users.length; index++) {
    const element = users[index];
    if(element.id==user_id){ return element.nick ? element.nick : element.name; };
  }
  return "";
}

export function merge_user_and_date_user_data(user, game_date_user_data){
  let date_user_id = game_date_user_data.id;
  const merge_data = {...game_date_user_data, ...user, date_user_id: date_user_id};
  return merge_data
}
      