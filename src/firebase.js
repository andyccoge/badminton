import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, getDocs, 
    doc, addDoc, updateDoc, writeBatch,
    query, where, orderBy, 
    deleteDoc,
} from 'firebase/firestore/lite';

/* 載入設定 */
import { firebaseConfig } from '../db.config.js';
const firebase = initializeApp(firebaseConfig);

export const firebase_db = getFirestore(firebase);
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
export const db_auth = getAuth();
export async function db_sign_in(email, pasaword){ 
    signInWithEmailAndPassword(db_auth, email, pasaword)
};
export function db_sign_out(redirect_url=''){
    db_auth.signOut();
    location.href = redirect_url ? redirect_url : "/";
}

export async function get_db_data(table, cond=[]) {
    let sql_query = [orderBy("create_time", "desc")];
    cond.forEach(element => {
        console.log(...element);
        sql_query.push( where(...element) );
        /* https://firebase.google.com/docs/firestore/query-data/queries?hl=zh-cn */
    });
    const q = query(collection(firebase_db, table), ...sql_query);
    const docs_obj = await getDocs(q);
    const dataList = docs_obj.docs.map(doc => doc.data());
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