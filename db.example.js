import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
/* code from our Firebase console */
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};
const firebase = initializeApp(firebaseConfig);

export const db = getFirestore(firebase);
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
export const db_sign_in = signInWithEmailAndPassword;
export const db_auth = getAuth();

export async function get_db_data(db, table, cond=[]) {
    const citiesCol = collection(db, table);
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}