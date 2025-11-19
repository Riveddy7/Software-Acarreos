
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

export const TICKETS_COLLECTION = 'tickets';
export const SHIPMENTS_COLLECTION = 'shipments';
export const TRUCKS_COLLECTION = 'trucks';
export const DRIVERS_COLLECTION = 'drivers';
export const MATERIALS_COLLECTION = 'materials';
export const LOCATIONS_COLLECTION = 'locations';
export const USERS_COLLECTION = 'users';
export const SUPPLIERS_COLLECTION = 'suppliers';
export const PURCHASE_ORDERS_COLLECTION = 'purchaseOrders';
export const RECEPTIONS_COLLECTION = 'receptions';
export const ACARREOS_COLLECTION = 'acarreos';
export const REQUISICIONES_MATERIAL_COLLECTION = 'requisiciones-material';

/**
 * Fetches all documents from a specified collection and orders them by creation date.
 * @param collectionName The name of the Firestore collection.
 * @returns A promise that resolves to an array of documents with their IDs.
 */
export async function getCollection<T extends { id: string }>(collectionName: string): Promise<T[]> {
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as T));
}

/**
 * Fetches a single document from a specified collection.
 * @param collectionName The name of the Firestore collection.
 * @param id The ID of the document to fetch.
 * @returns A promise that resolves to the document with its ID, or null if not found.
 */
export async function getDocument<T extends { id: string }>(collectionName: string, id: string): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as T;
}

/**
 * Adds a new document to a specified collection in Firestore.
 * @param collectionName The name of the collection.
 * @param data The data to add. It should not include an 'id'.
 * @returns The ID of the newly created document.
 */
export async function addDocument<T>(collectionName: string, data: T): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates an existing document in a specified collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to update.
 * @param data The data to update.
 */
export async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
}

/**
 * Deletes a document from a specified collection.
 * @param collectionName The name of the collection.
 * @param id The ID of the document to delete.
 */
export async function deleteDocument(collectionName: string, id: string): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}
