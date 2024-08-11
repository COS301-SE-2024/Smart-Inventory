// automation-settings-modal.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-automation-settings-modal',
  templateUrl: './automation-settings-modal.component.html',
  styleUrls: ['./automation-settings-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule
  ]
})
export class AutomationSettingsModalComponent implements OnInit {
  scheduleType: 'interval' | 'daily' | 'weekly' = 'interval';
  intervalValue: number = 24;
  intervalUnit: 'minutes' | 'hours' | 'days' = 'hours';
  dailyTime: string = '00:00';
  weeklySchedule: { [key: string]: string } = {
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  };
  nextScheduledScan: Date = new Date();
  countdownTime: string = '';

  constructor(public dialogRef: MatDialogRef<AutomationSettingsModalComponent>) {}

  ngOnInit() {
    this.updateNextScheduledScan();
    this.startCountdown();
  }

  updateNextScheduledScan() {
    // This is a simplified calculation and should be updated based on the selected schedule type
    const now = new Date();
    switch (this.scheduleType) {
      case 'interval':
        const intervalInMs = this.intervalValue * this.getIntervalMultiplier();
        this.nextScheduledScan = new Date(now.getTime() + intervalInMs);
        break;
      case 'daily':
        const [hours, minutes] = this.dailyTime.split(':').map(Number);
        this.nextScheduledScan = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        if (this.nextScheduledScan <= now) {
          this.nextScheduledScan.setDate(this.nextScheduledScan.getDate() + 1);
        }
        break;
      case 'weekly':
        // This is a simplified weekly calculation and should be improved
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let daysToAdd = 0;
        while (this.weeklySchedule[daysOfWeek[(now.getDay() + daysToAdd) % 7]] === '') {
          daysToAdd++;
        }
        const nextDay = daysOfWeek[(now.getDay() + daysToAdd) % 7];
        const [nextHours, nextMinutes] = this.weeklySchedule[nextDay].split(':').map(Number);
        this.nextScheduledScan = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToAdd, nextHours, nextMinutes);
        break;
    }
  }

  getIntervalMultiplier(): number {
    switch (this.intervalUnit) {
      case 'minutes': return 60 * 1000;
      case 'hours': return 60 * 60 * 1000;
      case 'days': return 24 * 60 * 60 * 1000;
    }
  }

  startCountdown() {
    setInterval(() => {
      const now = new Date();
      const difference = this.nextScheduledScan.getTime() - now.getTime();
      
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      this.countdownTime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
  }

  saveSettings() {
    this.updateNextScheduledScan();
    let scheduleConfig;
    switch(this.scheduleType) {
      case 'interval':
        scheduleConfig = { type: 'interval', value: this.intervalValue, unit: this.intervalUnit };
        break;
      case 'daily':
        scheduleConfig = { type: 'daily', time: this.dailyTime };
        break;
      case 'weekly':
        scheduleConfig = { type: 'weekly', schedule: this.weeklySchedule };
        break;
    }
    this.dialogRef.close(scheduleConfig);
  }

  scanNow() {
    console.log('Scanning inventory now...');
    this.updateNextScheduledScan();
  }

  cancel() {
    this.dialogRef.close();
  }
}