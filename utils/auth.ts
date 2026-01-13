import { User } from '../types';

const USERS_STORAGE_KEY = 'medattend_users';
const AUTH_STORAGE_KEY = 'medattend_auth';

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
  const errors: string[] = [];

  // At least 8 characters
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // One uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // One lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // One number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const registerUser = (username: string, password: string): { success: boolean; message: string } => {
  // Validate username
  if (!username || username.trim().length < 3) {
    return { success: false, message: 'Username must be at least 3 characters long' };
  }

  // Validate password
  const validation = validatePassword(password);
  if (!validation.isValid) {
    return { success: false, message: validation.errors.join('. ') };
  }

  // Check if user already exists
  const users = getStoredUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, message: 'Username already exists' };
  }

  // Store new user
  const newUser: User = { username: username.trim(), password }; // In production, hash the password
  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'Account created successfully!' };
};

export const loginUser = (username: string, password: string): { success: boolean; message: string } => {
  const users = getStoredUsers();
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid username or password' };
  }

  // Store authentication state
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAuthenticated: true, currentUser: user.username }));

  return { success: true, message: 'Login successful!' };
};

export const logoutUser = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAuthState = (): { isAuthenticated: boolean; currentUser: string | null } => {
  const authData = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authData) {
    return { isAuthenticated: false, currentUser: null };
  }
  try {
    const auth = JSON.parse(authData);
    return {
      isAuthenticated: auth.isAuthenticated || false,
      currentUser: auth.currentUser || null
    };
  } catch {
    return { isAuthenticated: false, currentUser: null };
  }
};

export const getStoredUsers = (): User[] => {
  const usersData = localStorage.getItem(USERS_STORAGE_KEY);
  if (!usersData) {
    return [];
  }
  try {
    return JSON.parse(usersData);
  } catch {
    return [];
  }
};
