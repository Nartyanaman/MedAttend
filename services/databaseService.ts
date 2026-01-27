import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';
import { AppState, Subject, Posting, AttendanceEntry, UserSettings } from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  USER_DATA: 'userData'
};

/**
 * Get user data from Firestore
 */
export const getUserData = async (userId: string): Promise<AppState | null> => {
  console.log(`📖 [getUserData] Attempting to get data for user: ${userId}`);
  console.log(`📖 [getUserData] Collection: ${COLLECTIONS.USER_DATA}, Document ID: ${userId}`);
  
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    console.log(`📖 [getUserData] Document reference created:`, userDocRef.path);
    
    const userDocSnap = await getDoc(userDocRef);
    console.log(`📖 [getUserData] Document exists: ${userDocSnap.exists()}`);
    
    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as AppState;
      console.log(`✅ [getUserData] Data retrieved successfully:`, {
        subjectsCount: data.subjects?.length || 0,
        postingsCount: data.postings?.length || 0,
        historyCount: data.history?.length || 0
      });
      return data;
    }

    console.log(`⚠️ [getUserData] No document found for user: ${userId}`);
    return null;
  } catch (error) {
    console.error('❌ [getUserData] Error getting user data:', error);
    console.error('❌ [getUserData] Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    throw error;
  }
};

/**
 * Save user data to Firestore
 */
export const saveUserData = async (userId: string, data: AppState): Promise<void> => {
  console.log(`💾 [saveUserData] Attempting to save data for user: ${userId}`);
  console.log(`💾 [saveUserData] Collection: ${COLLECTIONS.USER_DATA}, Document ID: ${userId}`);
  console.log(`💾 [saveUserData] Data to save:`, {
    subjectsCount: data.subjects?.length || 0,
    postingsCount: data.postings?.length || 0,
    historyCount: data.history?.length || 0,
    settings: data.settings ? 'present' : 'missing'
  });
  
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    console.log(`💾 [saveUserData] Document reference created:`, userDocRef.path);
    
    const dataToSave = {
      ...data,
      lastUpdated: Timestamp.now()
    };
    
    console.log(`💾 [saveUserData] Calling setDoc with merge: true...`);
    await setDoc(userDocRef, dataToSave, { merge: true });

    console.log(`✅ [saveUserData] Data saved successfully to Firestore!`);
    console.log(`✅ [saveUserData] Document path: ${userDocRef.path}`);
  } catch (error) {
    console.error('❌ [saveUserData] Error saving user data:', error);
    console.error('❌ [saveUserData] Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });
    
    if ((error as any)?.code === 'permission-denied') {
      console.error('🚫 [saveUserData] PERMISSION DENIED - Check Firestore security rules!');
    } else if ((error as any)?.code === 'unavailable') {
      console.error('🌐 [saveUserData] SERVICE UNAVAILABLE - Check internet connection and Firestore status!');
    } else if ((error as any)?.code === 'failed-precondition') {
      console.error('⚠️ [saveUserData] FAILED PRECONDITION - Firestore database may not be initialized!');
    }
    
    throw error;
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> => {
  try {
    console.log(`⚙️ [updateUserSettings] Updating settings for user: ${userId}`);
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);

    await updateDoc(userDocRef, {
      settings,
      lastUpdated: Timestamp.now()
    });

    console.log(`✅ [updateUserSettings] Settings updated successfully`);
  } catch (error) {
    console.error('❌ [updateUserSettings] Error updating user settings:', error);
    throw error;
  }
};

/**
 * Add a subject
 */
export const addSubject = async (userId: string, subject: Subject): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedSubjects = [...(currentData.subjects || []), subject];
      
      await updateDoc(userDocRef, {
        subjects: updatedSubjects,
        lastUpdated: Timestamp.now()
      });
    } else {
      await setDoc(userDocRef, {
        subjects: [subject],
        postings: [],
        history: [],
        settings: {},
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding subject:', error);
    throw error;
  }
};

/**
 * Update a subject
 */
export const updateSubject = async (
  userId: string,
  subjectId: string,
  updatedSubject: Subject
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedSubjects = currentData.subjects.map(s =>
        s.id === subjectId ? updatedSubject : s
      );
      
      await updateDoc(userDocRef, {
        subjects: updatedSubjects,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = async (
  userId: string,
  subjectId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedSubjects = currentData.subjects.filter(
        s => s.id !== subjectId
      );
      
      await updateDoc(userDocRef, {
        subjects: updatedSubjects,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
};

/**
 * Add a posting
 */
export const addPosting = async (userId: string, posting: Posting): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedPostings = [...(currentData.postings || []), posting];
      
      await updateDoc(userDocRef, {
        postings: updatedPostings,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding posting:', error);
    throw error;
  }
};

/**
 * Update a posting
 */
export const updatePosting = async (
  userId: string,
  postingId: string,
  updatedPosting: Partial<Posting>
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedPostings = currentData.postings.map(p =>
        p.id === postingId ? { ...p, ...updatedPosting } : p
      );
      
      await updateDoc(userDocRef, {
        postings: updatedPostings,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error updating posting:', error);
    throw error;
  }
};

/**
 * Delete a posting
 */
export const deletePosting = async (
  userId: string,
  postingId: string
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedPostings = currentData.postings.filter(
        p => p.id !== postingId
      );
      
      await updateDoc(userDocRef, {
        postings: updatedPostings,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error deleting posting:', error);
    throw error;
  }
};

/**
 * Add attendance entry to history
 */
export const addAttendanceEntry = async (
  userId: string,
  entry: AttendanceEntry
): Promise<void> => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      const currentData = userDocSnap.data() as AppState;
      const updatedHistory = [...(currentData.history || []), entry];
      
      await updateDoc(userDocRef, {
        history: updatedHistory,
        lastUpdated: Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Error adding attendance entry:', error);
    throw error;
  }
};

/**
 * Listen to real-time updates of user data
 */
export const subscribeToUserData = (
  userId: string,
  callback: (data: AppState | null) => void
): Unsubscribe => {
  const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
  
  return onSnapshot(
    userDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as AppState);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error in user data subscription:', error);
      callback(null);
    }
  );
};

/**
 * Initialize user data document (first time setup)
 */
export const initializeUserData = async (
  userId: string,
  initialData: AppState
): Promise<void> => {
  console.log(`🚀 [initializeUserData] Initializing data for user: ${userId}`);
  
  try {
    const userDocRef = doc(db, COLLECTIONS.USER_DATA, userId);
    console.log(`🚀 [initializeUserData] Document reference: ${userDocRef.path}`);
    
    const dataToSave = {
      ...initialData,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    };
    
    console.log(`🚀 [initializeUserData] Calling setDoc...`);
    await setDoc(userDocRef, dataToSave);

    console.log(`✅ [initializeUserData] User data initialized successfully!`);
  } catch (error) {
    console.error('❌ [initializeUserData] Error initializing user data:', error);
    console.error('❌ [initializeUserData] Error details:', {
      code: (error as any)?.code,
      message: (error as any)?.message
    });
    throw error;
  }
};
