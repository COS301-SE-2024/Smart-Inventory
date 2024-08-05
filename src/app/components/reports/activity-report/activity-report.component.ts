// src/app/components/activity-report/activity-report.component.ts

import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  GetUserCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { Component, OnInit, ViewChild } from '@angular/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import outputs from '../../../../../amplify_outputs.json';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { TitleService } from '../../header/title.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatGridTile } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatGridList } from '@angular/material/grid-list';
import { LoadingSpinnerComponent } from '../../loader/loading-spinner.component';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { ChartDataService } from '../../../services/chart-data.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-activity-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        GridComponent,
        MatDialogModule,
        MatButtonModule,
        LoadingSpinnerComponent,
        AgChartsAngular,
        MatGridList,
        MatToolbarModule,
        MatGridTile,
        MatCard,
        MatCardContent,
        MatButtonModule,
        
    ],
    templateUrl: './activity-report.component.html',
    styleUrls: ['./activity-report.component.css'],
})
export class ActivityReportComponent implements OnInit {
    constructor(
        private titleService: TitleService, 
        private dialog: MatDialog,
        private router: Router,
        private chartDataService: ChartDataService
    ) {}

    @ViewChild('gridComponent') gridComponent!: GridComponent;

    isLoading = true;
    rowData: any[] = [];
    options1!: AgChartOptions;
    options2!: AgChartOptions;

    colDefs: ColDef[] = [
        { field: 'memberID', headerName: 'Member ID' },
        { field: 'name', headerName: 'Name' },
        { field: 'role', headerName: 'Role' },
        { field: 'task', headerName: 'Task' },
        { field: 'timeSpent', headerName: 'Time Spent (minutes)' },
        { field: 'idleTime', headerName: 'Idle Time (minutes)' },
    ];

    ActivityReport = {
        title: 'Activity Report',
        subtitle: 'Overview of team member activities and relevant metrics.',
        metrics: {
            metric_1: 'Average completed activities: ',
            metric_2: 'Idle users: ',
            metric_3: 'Average time to complete a task: ',
        },
    };

    async ngOnInit() {
        this.titleService.updateTitle('Activity Report');
        await this.fetchActivities();
    }

    async fetchActivities() {
      console.log('Fetching activities...');
      try {
          const session = await fetchAuthSession();
  
          const lambdaClient = new LambdaClient({
              region: outputs.auth.aws_region,
              credentials: session.credentials,
          });
  
          const cognitoClient = new CognitoIdentityProviderClient({
              region: outputs.auth.aws_region,
              credentials: session.credentials,
          });
  
          // Retrieve the custom attribute using GetUserCommand
          const getUserCommand = new GetUserCommand({
              AccessToken: session.tokens?.accessToken.toString(),
          });
          const getUserResponse = await cognitoClient.send(getUserCommand);
  
          const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
              (attr: AttributeType) => attr.Name === 'custom:tenentId'
          )?.Value;
  
          const payload = JSON.stringify({
              tenentId: adminUniqueAttribute,
          });
  
          const invokeCommand = new InvokeCommand({
              FunctionName: 'getActivities', // Replace with your actual Lambda function name
              Payload: new TextEncoder().encode(payload),
          });
  
          const lambdaResponse = await lambdaClient.send(invokeCommand);
          const activities = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
          console.log('Activities received from Lambda:', activities);
  
          this.rowData = activities.map((activity: any) => ({
              memberID: activity.memberID,
              name: activity.name,
              role: activity.role,
              task: activity.task,
              timeSpent: activity.timeSpent,
              idleTime: activity.idleTime,
          }));
  
          this.updateCharts();
          this.updateMetrics();
      } catch (error) {
          console.error('Error fetching activities:', error);
      } finally {
          this.isLoading = false;
      }
  }
    updateCharts() {
        const timeSpentByMember = new Map(this.rowData.map(row => [row.name, row.timeSpent]));
        this.options1 = this.chartDataService.setPieData(timeSpentByMember, 'Time Spent by Member');

        const idleTimeByMember = new Map(this.rowData.map(row => [row.name, row.idleTime]));
        this.options2 = this.chartDataService.setPieData(idleTimeByMember, 'Idle Time by Member');
    }

    updateMetrics() {
        const totalActivities = this.rowData.length;
        const avgActivities = totalActivities / this.rowData.length;
        this.ActivityReport.metrics.metric_1 = `Average completed activities: ${avgActivities.toFixed(2)}`;

        const idleUsers = this.rowData.filter(row => row.idleTime === 480).length;
        this.ActivityReport.metrics.metric_2 = `Idle users: ${idleUsers}`;

        const totalTimeSpent = this.rowData.reduce((total, row) => total + row.timeSpent, 0);
        const avgTimePerTask = totalTimeSpent / totalActivities;
        this.ActivityReport.metrics.metric_3 = `Average time to complete a task: ${avgTimePerTask.toFixed(2)} minutes`;
    }


back() {
  this.router.navigate(['/reports']);
}

}