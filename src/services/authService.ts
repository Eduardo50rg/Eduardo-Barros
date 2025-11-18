import { auth, db } from '../firebaseConfig';
import type { User, UserRole } from '../types';

// --- AUTHENTICATION FUNCTIONS ---

export const signUp = async (name: string, email: string, password: string, role: UserRole) => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (!user) {
        throw new Error("User creation failed.");
    }

    await user.updateProfile({ displayName: name });

    const userProfile: Omit<User, 'id'> = {
        name,
        role,
        status: 'pending', 
        isOnline: true,
        registrationDate: new Date().toISOString(),
        sessions: [],
    };
    
    await db.collection("users").doc(user.uid).set(userProfile);
    
    try {
        await user.sendEmailVerification();
    } catch(e) {
        console.warn('Failed to send verification email', e);
    }

    return user;
};

export const signIn = async (email: string, password: string) => {
    return await auth.signInWithEmailAndPassword(email, password);
};

export const logOut = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).update({ isOnline: false });
        } catch (e) {
            console.error("Failed to update online status on logout", e);
        }
    }
    return await auth.signOut();
};

export const passwordReset = async (email: string) => {
    return await auth.sendPasswordResetEmail(email);
};

// --- USER PROFILE FUNCTIONS ---

export const getUserProfile = async (uid: string): Promise<User | null> => {
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
        return { id: userDoc.id, ...userDoc.data() } as User;
    } else {
        console.warn("No user profile found in Firestore for UID:", uid);
        return null;
    }
};