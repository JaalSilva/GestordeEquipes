/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  setDoc, 
  doc, 
  deleteDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { MaintenanceTask, AreaDesignation, Meeting, MaintenanceArea } from '../types';
import { AREAS as INITIAL_AREAS, INITIAL_TASKS } from '../constants';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  tasks: MaintenanceTask[];
  designations: Record<string, AreaDesignation>;
  meetings: Meeting[];
  areas: MaintenanceArea[];
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
  updateTask: (task: MaintenanceTask) => Promise<void>;
  updateDesignation: (designation: AreaDesignation) => Promise<void>;
  updateMeeting: (meeting: Meeting) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [designations, setDesignations] = useState<Record<string, AreaDesignation>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [areas, setAreas] = useState<MaintenanceArea[]>(INITIAL_AREAS);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setDesignations({});
      setMeetings([]);
      return;
    }

    // Sync Tasks
    const qTasks = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const ts: MaintenanceTask[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as MaintenanceTask;
        ts.push(data);
      });
      
      // If collection is empty, we show initial tasks
      if (ts.length === 0) {
        setTasks(INITIAL_TASKS);
      } else {
        setTasks(ts);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    // Sync Designations
    const qDesignations = query(collection(db, 'designations'));
    const unsubDesignations = onSnapshot(qDesignations, (snapshot) => {
      const ds: Record<string, AreaDesignation> = {};
      snapshot.forEach((doc) => {
        const data = doc.data() as AreaDesignation;
        ds[data.areaId] = data;
      });
      setDesignations(ds);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'designations'));

    // Sync Meetings
    const qMeetings = query(collection(db, 'meetings'), orderBy('date', 'asc'));
    const unsubMeetings = onSnapshot(qMeetings, (snapshot) => {
      const ms: Meeting[] = [];
      snapshot.forEach((doc) => ms.push(doc.data() as Meeting));
      setMeetings(ms);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'meetings'));

    return () => {
      unsubTasks();
      unsubDesignations();
      unsubMeetings();
    };
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
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

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      tasks,
      designations,
      meetings,
      areas,
      signIn,
      logout,
      updateTask,
      updateDesignation,
      updateMeeting,
      deleteMeeting
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
