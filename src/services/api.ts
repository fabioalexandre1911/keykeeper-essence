
import { PasswordEntry } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const passwordService = {
  async getAll(): Promise<PasswordEntry[]> {
    try {
      const response = await fetch(`${API_URL}/passwords`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch passwords:", error);
      // Return stored data as fallback
      const fallbackData = localStorage.getItem('password-manager-data');
      return fallbackData ? JSON.parse(fallbackData) : [];
    }
  },

  async create(password: Omit<PasswordEntry, 'id' | 'modified'>): Promise<PasswordEntry> {
    try {
      const response = await fetch(`${API_URL}/passwords`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(password),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to create password:", error);
      throw error;
    }
  },

  async update(id: string, password: Omit<PasswordEntry, 'id' | 'modified'>): Promise<PasswordEntry> {
    try {
      const response = await fetch(`${API_URL}/passwords/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(password),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to update password:", error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/passwords/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to delete password:", error);
      throw error;
    }
  }
};
