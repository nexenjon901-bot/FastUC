import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AppSettings {
  isMaintenance: boolean;
  cardNumber: string;
  cardName: string;
}

@Injectable()
export class SettingsService {
  private readonly filePath = path.join(process.cwd(), 'data', 'settings.json');
  
  private settings: AppSettings = {
    isMaintenance: false,
    cardNumber: '8600 0000 0000 0000',
    cardName: 'Admin Adminov'
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      if (!fs.existsSync(path.dirname(this.filePath))) {
        fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.settings = { ...this.settings, ...JSON.parse(data) };
      } else {
        this.saveSettings();
      }
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  }

  private saveSettings() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  }

  getSettings(): AppSettings {
    return this.settings;
  }

  updateSettings(updates: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    return this.settings;
  }
}
