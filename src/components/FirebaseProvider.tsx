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
import { db, OperationType, handleFirestoreError, usuarioMock } from '../lib/firebase';
import { MaintenanceTask, AreaDesignation, Meeting, MaintenanceArea } from '../types';
import { AREAS as INITIAL_AREAS, INITIAL_TASKS } from '../constants';

interface FirebaseContextType {
  user: typeof usuarioMock | null;
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
  const [userProfile, setUserProfile] = useState<typeof usuarioMock | null>(usuarioMock);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [designations, setDesignations] = useState<Record<string, AreaDesignation>>({});
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [areas, setAreas] = useState<MaintenanceArea[]>([]);

  const login = async () => {
    // Free access mode
  };

  const logout = async () => {
    // Free access mode
  };

  useEffect(() => {
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

    // Constant UID for free access
    const UID = usuarioMock.uid;

    // Load/Sync User Profile
    const unsubUser = onSnapshot(doc(db, 'users', UID), (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as typeof usuarioMock);
      } else {
        // Initialize profile if not exists
        setDoc(doc(db, 'users', UID), usuarioMock);
        setUserProfile(usuarioMock);
      }
      userReady = true;
      checkReady();
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `users/${UID}`);
      userReady = true;
      checkReady();
    });

    // Bootstrap Admin (ensure the mock user has access if rules require it)
    setDoc(doc(db, 'admins', UID), {
      uid: UID,
      email: usuarioMock.email,
      role: 'admin',
      updatedAt: serverTimestamp()
    }).catch(() => {});

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
  }, []);

  const updateProfile = async (updates: Partial<typeof usuarioMock>) => {
    try {
      const UID = usuarioMock.uid;
      const newProfile = { ...(userProfile || usuarioMock), ...updates, uid: UID };
      await setDoc(doc(db, 'users', UID), newProfile);
      setUserProfile(newProfile as any);
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
