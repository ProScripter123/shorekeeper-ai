import * as SecureStore from 'expo-secure-store';

const USER_DATA_KEY = 'shorekeeper_user_data';

export interface UserData {
  name: string;
  apiKey: string;
  onboardingComplete: boolean;
}

export const saveUserData = async (data: UserData) => {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const data = await SecureStore.getItemAsync(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};
