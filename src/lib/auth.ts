import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  getAuth
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '@/lib/firebase-config';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from '@/models/types';
import { USERS_COLLECTION } from '@/lib/firebase/firestore';

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string): Promise<UserProfile> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userProfile = await getUserProfile(user.uid);
    if (!userProfile) {
      throw new Error('Usuario no encontrado en la base de datos');
    }

    if (!userProfile.isActive) {
      throw new Error('Usuario desactivado. Contacta al administrador');
    }

    // Update last login
    await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
      lastLogin: Timestamp.now()
    });

    return userProfile;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
    throw new Error(errorMessage);
  }
}

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch {
    throw new Error('Error al cerrar sesión');
  }
}

/**
 * Create a new user (admin only) - Uses separate Auth instance to avoid changing current session
 */
export async function createUser(
  email: string,
  password: string,
  username: string,
  role: UserRole
): Promise<UserProfile> {
  try {
    // Create a separate Firebase app instance for user creation
    const secondaryApp = initializeApp(firebaseConfig, 'userCreation');
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    const user = userCredential.user;

    const userProfile: Omit<UserProfile, 'id'> = {
      email: user.email!,
      username,
      role,
      isActive: true,
      createdAt: Timestamp.now()
    };

    // Save user profile to Firestore (using the main db instance)
    await setDoc(doc(db, USERS_COLLECTION, user.uid), userProfile);

    // Sign out the user from the secondary auth to clean up
    await signOut(secondaryAuth);

    return {
      id: user.uid,
      ...userProfile
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al crear usuario';
    throw new Error(errorMessage);
  }
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, uid));
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'id' | 'email' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, uid), updates);
  } catch {
    throw new Error('Error al actualizar perfil de usuario');
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}