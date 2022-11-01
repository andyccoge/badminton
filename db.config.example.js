const location_href = location.href;
let db_connect = location_href.split('//')[1];
db_connect = db_connect.split('.')[0];
// alert(db_connect);

export let firebaseConfig = {};
if(db_connect=='127' || db_connect=='badminton-courts'){
  firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  };
}
else if(db_connect=='badminton-courts2-tutcn'){
  firebaseConfig = {
  };
}
else if(db_connect=='badminton-courts3-qizrtt'){
  firebaseConfig = {
  };
}
else if(db_connect=='badminton-courts4-ul4as'){
  firebaseConfig = {
  };
}
else if(db_connect=='badminton-courts5-olnbp'){
  firebaseConfig = {
  };  
}
else if(db_connect=='badminton-courts6-qttybe'){
  firebaseConfig = {
  };
}

export const google_text_to_speech_url = 'http://google_api.test/google/google/google_text_to_speech';