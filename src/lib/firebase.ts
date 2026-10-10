import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  increment,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { PerimeterConfig } from '../types/perimeter';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Initialize Firestore (using custom database ID if specified)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test helper per skill requirement
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline mode or waiting for connection.');
    }
    return false;
  }
}

export interface PublishedBlueprint extends PerimeterConfig {
  publishedId: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  stars: number;
  publishedAt: string;
}

// ---------------------------------------------------------------------------
// Firestore Helpers for User Perimeters & Published Flight Plans
// ---------------------------------------------------------------------------

// Save private perimeter to Firestore
export async function saveUserPerimeter(userId: string, config: PerimeterConfig) {
  const ref = doc(db, 'users', userId, 'perimeters', config.id);
  await setDoc(
    ref,
    {
      ...config,
      ownerId: userId,
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );
}

// Load user's private perimeters from Firestore
export async function getUserPerimeters(userId: string): Promise<PerimeterConfig[]> {
  try {
    const colRef = collection(db, 'users', userId, 'perimeters');
    const snapshot = await getDocs(colRef);
    const results: PerimeterConfig[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as PerimeterConfig);
    });
    return results;
  } catch (e) {
    console.warn('Error fetching user perimeters:', e);
    return [];
  }
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isAnonymous?: boolean;
}

// Publish perimeter to Community Terminal
export async function publishPerimeter(user: AppUser, config: PerimeterConfig): Promise<string> {
  const publishedCol = collection(db, 'published_perimeters');
  const docRef = await addDoc(publishedCol, {
    ...config,
    authorId: user.uid,
    authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous Pilot',
    authorEmail: user.email || '',
    stars: 1,
    publishedAt: new Date().toISOString()
  });
  return docRef.id;
}

// Fetch all published perimeters
export async function getPublishedPerimeters(): Promise<PublishedBlueprint[]> {
  try {
    const publishedCol = collection(db, 'published_perimeters');
    const snapshot = await getDocs(publishedCol);
    const list: PublishedBlueprint[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      list.push({
        ...data,
        publishedId: d.id,
        id: data.id || d.id
      } as PublishedBlueprint);
    });
    return list;
  } catch (e) {
    console.warn('Error fetching published perimeters:', e);
    return [];
  }
}

// Star/Upvote published perimeter
export async function starPublishedPerimeter(publishedId: string) {
  try {
    const ref = doc(db, 'published_perimeters', publishedId);
    await updateDoc(ref, {
      stars: increment(1)
    });
  } catch (e) {
    console.warn('Error starring perimeter:', e);
  }
}

// Delete published perimeter
export async function deletePublishedPerimeter(publishedId: string) {
  const ref = doc(db, 'published_perimeters', publishedId);
  await deleteDoc(ref);
}
