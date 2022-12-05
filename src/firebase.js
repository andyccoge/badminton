import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, getDocs, 
    doc, addDoc, updateDoc, writeBatch,
    query, where, orderBy, limit,
    deleteDoc,
} from 'firebase/firestore/lite';
import Swal from 'sweetalert2/dist/sweetalert2.js';

/* 載入設定 */
import { firebaseConfig } from '../db.config.js';
const firebase = initializeApp(firebaseConfig);

export const firebase_db = getFirestore(firebase);
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
export const db_auth = getAuth();
export async function db_sign_in(email, pasaword){ 
  await signInWithEmailAndPassword(db_auth, email, pasaword)
};
export function db_sign_out(redirect_url=''){
  new Swal({
    title: '確定登出？',
    text: "登出後將離開此頁面，部分內容將被重置",
    icon: 'warning',
    confirmButtonText: '確定',
    confirmButtonColor: '#3085d6',
    showCancelButton: true,
    cancelButtonText: '取消',
  }).then((result) => {
    if (result.isConfirmed){
      db_auth.signOut();
      location.href = redirect_url ? redirect_url : "/";
    }
  });
}

export async function get_db_data(table, cond=[{'orderBy':["create_time", "desc"]}]) {
  let sql_query = [];
  cond.forEach(element => {
    if(typeof(element['orderBy'])!='undefined'){
      sql_query.unshift( orderBy(...element['orderBy']) );
    }else{
      sql_query.unshift( where(...element) );
    }
    /* https://firebase.google.com/docs/firestore/query-data/queries?hl=zh-cn */
  });
  const q = query(collection(firebase_db, table), ...sql_query);
  let dataList = null;
  // console.log(sql_query)
  try {
    const docs_obj = await getDocs(q);
    dataList = docs_obj.docs.map(doc => doc.data());
  } catch (error) {
  }

  dataList.forEach((element, index) => {
    if(typeof(element['users'])!='undefined'){
      dataList[index]['users'] = JSON.parse(element['users']);
    }
  });
  return dataList;
}

const data_with_base_column = (table, data, add_column=false) => {
  let data_copy = JSON.parse(JSON.stringify(data));
  let empty_data = {}; /* create_time */
  if(table=='users'){
    empty_data = {id:null, name:'', nick:null, gender:'', level:0, phone:null, email:null};
  }
  else if(table=='game_date_users'){
    empty_data = {id:null, game_date_id:null, user_id:null, played:0, wait:0, status:0, paid:0, check_in:0};
  }
  else if(table=='game_date'){
    empty_data = {id:null, date:null, location:null};
  }
  else if(table=='game_date_courts'){
    if(typeof(data_copy['users'])!='undefined'){ data_copy['users'] = JSON.stringify(data_copy['users']); }
    empty_data = {id:null, game_date_id:null, name:null, type:0, users:'[["",""], ["",""]]', time:0, game_points:[0,0]};
  }
  else if(table=='game_records'){
    if(typeof(data_copy['users'])!='undefined'){ data_copy['users'] = JSON.stringify(data_copy['users']); }
    empty_data = {id:null, game_date_id:null, users:'[["",""], ["",""]]', time:0, game_points:[0,0]};
  }
  else if(table=='auto_set_user_setting'){
    empty_data = {id:null, diff_level_sum:0, diff_level_divi:0, woman_level_deduct:0, no_deduct_level:0};
  }

  let keys = Object.keys(empty_data);
  if(add_column){ /* 補欄位 */
    keys.forEach(key => { 
      if(typeof(data_copy[key])=='undefined'){ data_copy[key] = empty_data[key]; }
    });
  }

  /* 刪欄位 */
  let clear_data = {};
  keys.forEach(key => {
    if(typeof(data_copy[key])!='undefined'){ clear_data[key] = data_copy[key]; }
  });
  delete clear_data.id;
  data_copy = clear_data;

  return data_copy;
}

export async function add_data(table, data) {
  data = data_with_base_column(table, data, true);
  data['create_time'] = Date.now();
  try {
    let docRef = await addDoc(collection(firebase_db, table), data);
    let docRef_new = doc(firebase_db, table, docRef.id);
    await updateDoc(docRef_new, {id: docRef.id});
    return docRef.id;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function set_data(table, data) {
  let new_ids = [];
  // const batch = writeBatch(firebase_db);
  for (let i = 0; i < data.length; i++) {
      const new_id = await add_data(table, data[i]);
      new_ids.push(new_id);
  }
  // await batch.commit();
  return new_ids;
}

export async function update_data(table, id, data) {
  data = data_with_base_column(table, data, false);
  const docRef = doc(firebase_db, table, id);
  try {
    await updateDoc(docRef, data);
  } catch (error) {
    console.log(error);
  }
}

export async function delete_data(table, id) {
  const docRef = doc(firebase_db, table, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.log(error);
  }
}