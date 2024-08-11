// src/app/components/activity-report/activity-report.component.ts

import {
    CognitoIdentityProviderClient,
    GetUserCommand,
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
//   import { LoadingSpinnerComponent } from '../../loader/loading-spinner.component';
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
          { field: 'action', headerName: 'Action' },
          { field: 'timestamp', headerName: 'Timestamp' },
          { field: 'details', headerName: 'Details' }
      ];
  
      ActivityReport = {
          title: 'Activity Report',
          subtitle: 'Overview of team member activities and relevant metrics.',
          metrics: {
              metric_1: 'Average activities per member: ',
              metric_2: 'Unique action types: ',
              metric_3: 'Latest activity: ',
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
  
              const getUserCommand = new GetUserCommand({
                  AccessToken: session.tokens?.accessToken.toString(),
              });
              const getUserResponse = await cognitoClient.send(getUserCommand);
  
              const tenantId = getUserResponse.UserAttributes?.find(
                  (attr: AttributeType) => attr.Name === 'custom:tenentId'
              )?.Value;
  
              const invokeCommand = new InvokeCommand({
                  FunctionName: 'userActivity-getItems',
                  Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
              });
  
              const lambdaResponse = await lambdaClient.send(invokeCommand);
              const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
              if (responseBody.statusCode === 200) {
                  const activities = JSON.parse(responseBody.body);
                  console.log('Activities received from Lambda:', activities);
  
                  this.rowData = activities.map((activity: any) => ({
                      tenentId: activity.tenantId,
                      memberID: activity.memberId,
                      name: activity.name,
                      role: activity.role,
                      action: activity.task,
                      timestamp: new Date(activity.createdAt).toLocaleString(),
                      details: JSON.stringify(activity.details)
                  }));
  
                  this.updateCharts();
                  this.updateMetrics();
              } else {
                  console.error('Error fetching activities:', responseBody.body);
                  this.rowData = [];
              }
          } catch (error) {
              console.error('Error fetching activities:', error);
          } finally {
              this.isLoading = false;
          }
      }
  
      updateCharts() {
          const actionsByMember = new Map();
          this.rowData.forEach(row => {
              if (!actionsByMember.has(row.name)) {
                  actionsByMember.set(row.name, 0);
              }
              actionsByMember.set(row.name, actionsByMember.get(row.name) + 1);
          });
          this.options1 = this.chartDataService.setPieData(actionsByMember, 'Actions by Member');
  
          const actionTypes = new Map();
          this.rowData.forEach(row => {
              if (!actionTypes.has(row.action)) {
                  actionTypes.set(row.action, 0);
              }
              actionTypes.set(row.action, actionTypes.get(row.action) + 1);
          });
          this.options2 = this.chartDataService.setPieData(actionTypes, 'Action Types');
      }
  
      updateMetrics() {
          const totalActivities = this.rowData.length;
          const uniqueMembers = new Set(this.rowData.map(row => row.memberID)).size;
          const avgActivities = totalActivities / uniqueMembers;
          this.ActivityReport.metrics.metric_1 = `Average activities per member: ${avgActivities.toFixed(2)}`;
  
          const actionTypes = new Set(this.rowData.map(row => row.action)).size;
          this.ActivityReport.metrics.metric_2 = `Unique action types: ${actionTypes}`;
  
          const latestActivity = new Date(Math.max(...this.rowData.map(row => new Date(row.timestamp).getTime())));
          this.ActivityReport.metrics.metric_3 = `Latest activity: ${latestActivity.toLocaleString()}`;
      }
  
      back() {
          this.router.navigate(['/reports']);
      }
  }