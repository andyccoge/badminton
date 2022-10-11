import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, getDocs, 
    doc, addDoc, updateDoc, writeBatch,
    query, where, orderBy, limit,
    deleteDoc,
} from 'firebase/firestore/lite';

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
  db_auth.signOut();
  location.href = redirect_url ? redirect_url : "/";
}

export async function get_db_data(table, cond=[{orderBy:["create_time", "desc"]}]) {
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
  return dataList;
}

export async function add_data(table, data) {
  data['create_time'] = Date.now();
  let docRef = await addDoc(collection(firebase_db, table), data);
  let docRef_new = doc(firebase_db, table, docRef.id);
  await updateDoc(docRef_new, {id: docRef.id});
  return docRef.id;
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
  const docRef = doc(firebase_db, table, id);
  await updateDoc(docRef, data);
}

export async function delete_data(table, id) {
  const docRef = doc(firebase_db, table, id);
  await deleteDoc(docRef);
}