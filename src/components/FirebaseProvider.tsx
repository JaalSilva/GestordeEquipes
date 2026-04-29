/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  setDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  User
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError, usuarioMock } from '../lib/firebase';
import { MaintenanceTask, AreaDesignation, Meeting, MaintenanceArea } from '../types';
import { AREAS as INITIAL_AREAS, INITIAL_TASKS } from '../constants';

interface FirebaseContextType {
  user: typeof usuarioMock | null;
  firebaseUser: User | null;
  loading: boolean;
  tasks: MaintenanceTask[];
  designations: Record<string, AreaDesignation>;
  meetings: Meeting[];
  areas: MaintenanceArea[];
  updateTask: (task: MaintenanceTask) => Promise<void>;
  updateDesignation: (designation: AreaDesignation) => Promise<void>;
  updateMeeting: (meeting: Meeting) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  updateArea: (area: MaintenanceArea) => Promise<void>;
  deleteArea: (areaId: string) => Promise<void>;
  updateProfile: (updates: Partial<typeof usuarioMock>) => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<typeof usuarioMock | null>(null);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [designations, setDesignations] = useState<Record<string, AreaDesignation>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [areas, setAreas] = useState<MaintenanceArea[]>([]);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Sync User Profile
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        let profile = userSnap.exists() ? userSnap.data() as typeof usuarioMock : null;
        
        if (!profile) {
          profile = {
            uid: user.uid,
            displayName: user.displayName || 'Usuário',
            email: user.email || '',
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=0284c7&color=fff`,
            role: 'user'
          };
          await setDoc(userRef, profile);
        }
        setUserProfile(profile);

        // Bootstrap Admin
        const adminEmails = ['jaazielss@gmail.com', 'comissao@congregação.com'];
        if (user.email && adminEmails.includes(user.email)) {
          await setDoc(doc(db, 'admins', user.uid), {
            uid: user.uid,
            email: user.email,
            role: 'admin',
            updatedAt: serverTimestamp()
          }).catch(() => {});
        }
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    let tasksReady = false;
    let designationsReady = false;
    let meetingsReady = false;
    let areasReady = false;
    let userReady = false;

    const checkReady = () => {
      if (tasksReady && designationsReady && meetingsReady && areasReady && userReady) {
        setLoading(false);
      }
    };

    // Load/Sync User Profile
    const unsubUser = onSnapshot(doc(db, 'users', firebaseUser.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as typeof usuarioMock);
      }
      userReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
      userReady = true;
      checkReady();
    });

    // Sync Tasks
    const qTasks = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      if (snapshot.empty && !tasksReady) {
        // Seed tasks if empty
        INITIAL_TASKS.forEach(t => {
          setDoc(doc(db, 'tasks', t.id), t).catch(err => 
            handleFirestoreError(err, OperationType.WRITE, `tasks/${t.id}`)
          );
        });
      }
      const ts: MaintenanceTask[] = [];
      snapshot.forEach((doc) => ts.push(doc.data() as MaintenanceTask));
      // Prioritize data from Firestore if we already have some, otherwise use INITIAL_TASKS as fallback
      setTasks(ts.length > 0 ? ts : (!tasksReady ? INITIAL_TASKS : []));
      tasksReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'tasks');
      tasksReady = true;
      checkReady();
    });

    // Sync Designations
    const qDesignations = query(collection(db, 'designations'));
    const unsubDesignations = onSnapshot(qDesignations, (snapshot) => {
      const ds: Record<string, AreaDesignation> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as AreaDesignation;
        ds[data.areaId] = data;
      });
      setDesignations(ds);
      designationsReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'designations');
      designationsReady = true;
      checkReady();
    });

    // Sync Meetings
    const qMeetings = query(collection(db, 'meetings'), orderBy('date', 'asc'));
    const unsubMeetings = onSnapshot(qMeetings, (snapshot) => {
      const ms: Meeting[] = [];
      snapshot.forEach((doc) => ms.push(doc.data() as Meeting));
      setMeetings(ms);
      meetingsReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'meetings');
      meetingsReady = true;
      checkReady();
    });

    // Sync Areas
    const qAreas = query(collection(db, 'areas'));
    const unsubAreas = onSnapshot(qAreas, (snapshot) => {
      if (snapshot.empty && !areasReady) {
        // Seed areas if empty
        INITIAL_AREAS.forEach(a => {
          setDoc(doc(db, 'areas', a.id), a).catch(err => 
            handleFirestoreError(err, OperationType.WRITE, `areas/${a.id}`)
          );
        });
      }
      const as: MaintenanceArea[] = [];
      snapshot.forEach((doc) => as.push(doc.data() as MaintenanceArea));
      setAreas(as.length > 0 ? as : (!areasReady ? INITIAL_AREAS : []));
      areasReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'areas');
      areasReady = true;
      checkReady();
    });

    return () => {
      unsubTasks();
      unsubDesignations();
      unsubMeetings();
      unsubAreas();
      unsubUser();
    };
  }, [firebaseUser]);

  const updateProfile = async (updates: Partial<typeof usuarioMock>) => {
    if (!firebaseUser) return;
    try {
      const newProfile = { ...(userProfile || {}), ...updates, uid: firebaseUser.uid };
      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
      setUserProfile(newProfile as any);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  const updateTask = async (task: MaintenanceTask) => {
    try {
      await setDoc(doc(db, 'tasks', task.id), {
        ...task,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `tasks/${task.id}`);
    }
  };

  const updateDesignation = async (designation: AreaDesignation) => {
    try {
      await setDoc(doc(db, 'designations', designation.areaId), {
        ...designation,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `designations/${designation.areaId}`);
    }
  };

  const updateMeeting = async (meeting: Meeting) => {
    try {
      await setDoc(doc(db, 'meetings', meeting.id), {
        ...meeting,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `meetings/${meeting.id}`);
    }
  };

  const deleteMeeting = async (meetingId: string) => {
    try {
      await deleteDoc(doc(db, 'meetings', meetingId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `meetings/${meetingId}`);
    }
  };

  const updateArea = async (area: MaintenanceArea) => {
    try {
      await setDoc(doc(db, 'areas', area.id), {
        ...area,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `areas/${area.id}`);
    }
  };

  const deleteArea = async (areaId: string) => {
    try {
      await deleteDoc(doc(db, 'areas', areaId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `areas/${areaId}`);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user: userProfile,
      firebaseUser,
      loading,
      tasks,
      designations,
      meetings,
      areas,
      updateTask,
      updateDesignation,
      updateMeeting,
      deleteMeeting,
      updateArea,
      deleteArea,
      updateProfile,
      login,
      logout
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
