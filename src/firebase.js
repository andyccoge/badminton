import { initializeApp } from 'firebase/app';
import { 
    getFirestore, collection, getDocs, 
    doc, addDoc, updateDoc, writeBatch,
    query, where
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

export async function get_db_data(table, cond=[]) {
    let where_query = [];
    cond.forEach(element => {
        where_query.push( where(...element) );
        /* ["state", "==", "CA"] */
        /* ["state", "not-in", ['USA', 'Japan']] */
        /* ['regions', 'array-contains-any', ['west_coast', 'east_coast']] */
    });
    const q = query(collection(firebase_db, table), ...where_query);
    console.log(q);

    const collection_obj = collection(firebase_db, table);
    const docs_obj = await getDocs(collection_obj);
    const dataList = docs_obj.docs.map(doc => doc.data());
    return dataList;
}

export async function add_data(table, data) {
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