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
  orderBy
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError, usuarioMock } from '../lib/firebase';
import { MaintenanceTask, AreaDesignation, Meeting, MaintenanceArea } from '../types';
import { AREAS as INITIAL_AREAS, INITIAL_TASKS } from '../constants';

interface FirebaseContextType {
  user: typeof usuarioMock;
  loading: boolean;
  tasks: MaintenanceTask[];
  designations: Record<string, AreaDesignation>;
  meetings: Meeting[];
  areas: MaintenanceArea[];
  updateTask: (task: MaintenanceTask) => Promise<void>;
  updateDesignation: (designation: AreaDesignation) => Promise<void>;
  updateMeeting: (meeting: Meeting) => Promise<void>;
  deleteMeeting: (meetingId: string) => Promise<void>;
  updateProfile: (updates: Partial<typeof usuarioMock>) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(usuarioMock);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [designations, setDesignations] = useState<Record<string, AreaDesignation>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [areas] = useState<MaintenanceArea[]>(INITIAL_AREAS);

  useEffect(() => {
    let tasksReady = false;
    let designationsReady = false;
    let meetingsReady = false;
    let userReady = false;

    const checkReady = () => {
      if (tasksReady && designationsReady && meetingsReady && userReady) {
        setLoading(false);
      }
    };

    // Load/Sync User Profile
    const unsubUser = onSnapshot(doc(db, 'users', usuarioMock.uid), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as typeof usuarioMock);
      }
      userReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${usuarioMock.uid}`);
      userReady = true;
      checkReady();
    });

    // Sync Tasks
    const qTasks = query(collection(db, 'tasks'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const ts: MaintenanceTask[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as MaintenanceTask;
        ts.push(data);
      });
      
      setTasks(ts.length > 0 ? ts : INITIAL_TASKS);
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

    return () => {
      unsubTasks();
      unsubDesignations();
      unsubMeetings();
      unsubUser();
    };
  }, []);

  const updateProfile = async (updates: Partial<typeof usuarioMock>) => {
    try {
      const newProfile = { ...userProfile, ...updates };
      await setDoc(doc(db, 'users', usuarioMock.uid), newProfile);
      setUserProfile(newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${usuarioMock.uid}`);
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

  return (
    <FirebaseContext.Provider value={{
      user: userProfile,
      loading,
      tasks,
      designations,
      meetings,
      areas,
      updateTask,
      updateDesignation,
      updateMeeting,
      deleteMeeting,
      updateProfile // Adding this to context
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
