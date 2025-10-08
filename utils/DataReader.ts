import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

export interface UserCredential {
  username: string;
  password: string;
  type: string;
  shouldSucceed: boolean;
  hasIssues?: boolean;
  description?: string;
}

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
  country?: string;
}

export class DataReader {
  private static readonly TEST_DATA_DIR = path.join(__dirname, '../testData');

  /**
   * Read credentials from JSON file
   */
  static readCredentialsFromJSON(): UserCredential[] {
    try {
      const filePath = path.join(this.TEST_DATA_DIR, 'credentials.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      return data.users || [];
    } catch (error) {
      console.error('Error reading credentials from JSON:', error);
      throw new Error('Failed to read credentials from JSON file');
    }
  }

  /**
   * Read credentials from CSV file
   */
  static readCredentialsFromCSV(): UserCredential[] {
    try {
      const filePath = path.join(this.TEST_DATA_DIR, 'credentials.csv');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      const results = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transform: (value, field) => {
          if (field === 'shouldSucceed' || field === 'hasIssues') {
            return value.toLowerCase() === 'true';
          }
          return value;
        }
      });

      return results.data as UserCredential[];
    } catch (error) {
      console.error('Error reading credentials from CSV:', error);
      throw new Error('Failed to read credentials from CSV file');
    }
  }

  /**
   * Read checkout information from JSON file
   */
  static readCheckoutInfo(): CheckoutInfo {
    try {
      const filePath = path.join(this.TEST_DATA_DIR, 'checkoutInfo.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading checkout info:', error);
      throw new Error('Failed to read checkout information');
    }
  }

  /**
   * Get user by type
   */
  static getUserByType(type: string): UserCredential | undefined {
    const users = this.readCredentialsFromJSON();
    return users.find(user => user.type === type);
  }

  /**
   * Get all valid users (should succeed in login)
   */
  static getValidUsers(): UserCredential[] {
    const users = this.readCredentialsFromJSON();
    return users.filter(user => user.shouldSucceed);
  }
}
