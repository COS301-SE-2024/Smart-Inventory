// src/app/services/activity-logging.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ActivityLog {
  id: string;
  memberID: string;
  name: string;
  role: string;
  action: string;
  timestamp: Date;
  details?: any; // For additional context or data related to the action
}

@Injectable({
  providedIn: 'root'
})
export class ActivityLoggingService {
  private activityLogs: BehaviorSubject<ActivityLog[]> = new BehaviorSubject<ActivityLog[]>([]);

  constructor() {
    // Initialize with some dummy data
    this.addActivityLog({
      memberID: '001',
      name: 'John Doe',
      role: 'Inventory Controller',
      action: 'Added item to inventory',
      details: { itemName: 'Widget', quantity: 100 }
    });
  }

  // Get all activity logs
  getActivityLogs(): Observable<ActivityLog[]> {
    return this.activityLogs.asObservable();
  }

  // Add a new activity log
  addActivityLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): void {
    const newLog: ActivityLog = {
      ...log,
      id: this.generateUniqueId(),
      timestamp: new Date()
    };
    const currentLogs = this.activityLogs.value;
    this.activityLogs.next([...currentLogs, newLog]);
  }

  // Get logs for a specific member
  getLogsByMember(memberID: string): Observable<ActivityLog[]> {
    return this.activityLogs.pipe(
      map(logs => logs.filter(log => log.memberID === memberID))
    );
  }

  // Get logs for a specific role
  getLogsByRole(role: string): Observable<ActivityLog[]> {
    return this.activityLogs.pipe(
      map(logs => logs.filter(log => log.role === role))
    );
  }

  // Get logs within a date range
  getLogsByDateRange(startDate: Date, endDate: Date): Observable<ActivityLog[]> {
    return this.activityLogs.pipe(
      map(logs => logs.filter(log => log.timestamp >= startDate && log.timestamp <= endDate))
    );
  }

  // Get logs for a specific action type
  getLogsByAction(action: string): Observable<ActivityLog[]> {
    return this.activityLogs.pipe(
      map(logs => logs.filter(log => log.action.includes(action)))
    );
  }

  // Clear all logs
  clearLogs(): void {
    this.activityLogs.next([]);
  }

  // Delete a specific log
  deleteLog(id: string): void {
    const currentLogs = this.activityLogs.value;
    const updatedLogs = currentLogs.filter(log => log.id !== id);
    this.activityLogs.next(updatedLogs);
  }

  // Update a log
  updateLog(id: string, updatedData: Partial<ActivityLog>): void {
    const currentLogs = this.activityLogs.value;
    const updatedLogs = currentLogs.map(log => 
      log.id === id ? { ...log, ...updatedData } : log
    );
    this.activityLogs.next(updatedLogs);
  }

  // Get the most recent log
  getMostRecentLog(): Observable<ActivityLog | undefined> {
    return this.activityLogs.pipe(
      map(logs => logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0])
    );
  }

  // Get the count of logs
  getLogCount(): Observable<number> {
    return this.activityLogs.pipe(
      map(logs => logs.length)
    );
  }

  // Get logs grouped by member
  getLogsGroupedByMember(): Observable<{ [memberID: string]: ActivityLog[] }> {
    return this.activityLogs.pipe(
      map(logs => logs.reduce((acc, log) => {
        acc[log.memberID] = acc[log.memberID] || [];
        acc[log.memberID].push(log);
        return acc;
      }, {} as { [memberID: string]: ActivityLog[] }))
    );
  }

  // Helper method to generate a unique ID
  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}