// automation-settings-modal.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScanConfirmationDialogComponent } from './scan-confirmation-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { OrdersComponent } from 'app/pages/orders/orders.component';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';

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
    MatRadioModule,
    ScanConfirmationDialogComponent,
    MatTabsModule, 
    LoadingSpinnerComponent
  ]
})
export class AutomationSettingsModalComponent implements OnInit {
  isLoading = false;
  scheduleType: 'daily' | 'weekly' = 'daily';
  dailyTime: string = '00:00';
  weeklySchedule: { [key: string]: string } = {
    monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '', sunday: ''
  };
  nextScheduledScan: Date = new Date();
  countdownTime: string = '';
  selectedTabIndex: number = 0;

  constructor(
    public dialogRef: MatDialogRef<AutomationSettingsModalComponent>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { ordersComponent: any } // Change OrdersComponent to any to avoid circular dependency
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    try {
      await this.fetchCurrentSettings();
      this.selectedTabIndex = this.scheduleType === 'daily' ? 0 : 1;
      this.updateNextScheduledScan();
      this.startCountdown();
    } finally {
      this.isLoading = false;
    }
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
    this.scheduleType = index === 0 ? 'daily' : 'weekly';
  }

  updateNextScheduledScan() {
    const now = new Date();
    switch (this.scheduleType) {
      case 'daily':
        const [hours, minutes] = this.dailyTime.split(':').map(Number);
        this.nextScheduledScan = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        if (this.nextScheduledScan <= now) {
          this.nextScheduledScan.setDate(this.nextScheduledScan.getDate() + 1);
        }
        break;
      case 'weekly':
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        let nextScan = null;
        for (let i = 0; i < 7; i++) {
          const checkDay = daysOfWeek[(now.getDay() + i) % 7];
          if (this.weeklySchedule[checkDay]) {
            const [checkHours, checkMinutes] = this.weeklySchedule[checkDay].split(':').map(Number);
            let checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, checkHours, checkMinutes);
            if (checkDate > now && (!nextScan || checkDate < nextScan)) {
              nextScan = checkDate;
            }
          }
        }
        if (!nextScan) {
          // If no valid time found, set to the first scheduled day next week
          const firstScheduledDay = daysOfWeek.find(day => this.weeklySchedule[day]);
          if (firstScheduledDay) {
            const [firstHours, firstMinutes] = this.weeklySchedule[firstScheduledDay].split(':').map(Number);
            nextScan = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7 + daysOfWeek.indexOf(firstScheduledDay) - now.getDay(), firstHours, firstMinutes);
          } else {
            console.error('No weekly schedule set');
            nextScan = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default to 1 week from now if no schedule
          }
        }
        this.nextScheduledScan = nextScan;
        break;
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

  scanNow() {
    this.isLoading = true;
    // Close the current dialog

    // Open the confirmation dialog
    const confirmDialogRef = this.dialog.open(ScanConfirmationDialogComponent, {
      width: '300px'
    });

    confirmDialogRef.afterClosed().subscribe(async (result) => { // Make this callback async
      if (result === true) {
        try {
          const session = await fetchAuthSession();
          const tenentId = await this.getTenentId(session);

          const lambdaClient = new LambdaClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
          });

          const invokeCommand = new InvokeCommand({
            FunctionName: 'orderAutomation',
            Payload: new TextEncoder().encode(JSON.stringify({
              tenentId: tenentId
            })),
          });

          const lambdaResponse = await lambdaClient.send(invokeCommand);
          const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

          if (responseBody.statusCode === 200) {
            this.snackBar.open('Inventory scan completed successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
            // Refresh the orders page
            await this.data.ordersComponent.loadOrdersData();
          } else {
            throw new Error(responseBody.body || 'Unknown error occurred');
          }
        } catch (error) {
          console.error('Error during inventory scan:', error);
          this.snackBar.open(`Error during inventory scan: ${(error as Error).message}`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
        finally {
          this.isLoading = false;
        }
      } else {
        // If cancelled, reopen the Automation Settings modal
        this.dialog.open(AutomationSettingsModalComponent, {
          width: '400px',
          data: { ordersComponent: this.data.ordersComponent }
        });
      }
    });
  }


  cancel() {
    this.dialogRef.close();
  }

  async fetchCurrentSettings() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getAutomationSettings',
        Payload: new TextEncoder().encode(JSON.stringify({
          pathParameters: { tenentId: tenentId }
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        const settings = JSON.parse(responseBody.body);
        this.applySettings(settings);
      } else {
        console.error('Error fetching automation settings:', responseBody.body);
      }
    } catch (error) {
      console.error('Error fetching automation settings:', error);
    }
  }

  applySettings(settings: any) {
    this.scheduleType = settings.scheduleType;
    switch (this.scheduleType) {
      case 'daily':
        this.dailyTime = settings.dailyTime;
        break;
      case 'weekly':
        this.weeklySchedule = settings.weeklySchedule;
        break;
    }
  }

  async saveSettings() {
    this.isLoading = true;
    this.updateNextScheduledScan();
    let scheduleConfig;
    if (this.selectedTabIndex === 0) {
      scheduleConfig = { scheduleType: 'daily', dailyTime: this.dailyTime };
    } else {
      scheduleConfig = { scheduleType: 'weekly', weeklySchedule: this.weeklySchedule };
    }

    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'updateAutomationSettings',
        Payload: new TextEncoder().encode(JSON.stringify({
          body: JSON.stringify({
            tenentId: tenentId,
            settings: scheduleConfig
          })
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        console.log('Automation settings updated successfully');
        this.snackBar.open('Automation settings updated successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.dialogRef.close(scheduleConfig);
      } else {
        throw new Error(responseBody.body || 'Failed to update automation settings');
      }
    } catch (error) {
      console.error('Error saving automation settings:', error);
      this.snackBar.open(`Error saving settings: ${(error as Error).message}`, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } finally {
      this.isLoading = false;
    }
  }

  async getTenentId(session: any): Promise<string> {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials,
    });

    const getUserCommand = new GetUserCommand({
      AccessToken: session.tokens?.accessToken.toString(),
    });
    const getUserResponse = await cognitoClient.send(getUserCommand);

    const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

    if (!tenentId) {
      throw new Error('TenentId not found in user attributes');
    }

    console.log(tenentId);

    return tenentId;
  }


}