import {
    CognitoIdentityProviderClient,
    GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { AttributeType } from "@aws-sdk/client-cognito-identity-provider";
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { MatCard, MatCardContent, MatCardModule } from '@angular/material/card';
import { MatGridTile, MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
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
        MatGridListModule,
        MatToolbarModule,
        MatGridTile,
        MatCardModule,
        MatIconModule,
    ],
    templateUrl: './activity-report.component.html',
    styleUrls: ['./activity-report.component.css'],
})
export class ActivityReportComponent implements OnInit, AfterViewInit {
    @ViewChild('gridComponent') gridComponent!: GridComponent;

    isLoading = true;
    rowData: any[] = [];
    options1!: AgChartOptions;
    options2!: AgChartOptions;
    optionsActivitiesByMember!: AgChartOptions;

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
        metrics: [
            {
                name: 'Total Activities',
                icon: 'assessment',
                value: '0',
                percentage: 0,
                trend: 'up',
                tooltip: 'Total number of activities recorded.'
            },
            {
                name: 'Unique Members',
                icon: 'group',
                value: '0',
                percentage: 0,
                trend: 'up',
                tooltip: 'Number of unique members with activities.'
            },
            {
                name: 'Avg Activities/Member',
                icon: 'person',
                value: '0',
                percentage: 0,
                trend: 'up',
                tooltip: 'Average number of activities per member.'
            },
            {
                name: 'Latest Activity',
                icon: 'update',
                value: 'N/A',
                percentage: 0,
                trend: 'neutral',
                tooltip: 'Most recent activity timestamp.'
            }
        ],
    };

    constructor(
        private titleService: TitleService, 
        private dialog: MatDialog,
        private router: Router,
        private chartDataService: ChartDataService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        console.log('ActivityReportComponent constructed');
    }

    async ngOnInit() {
        console.log('ngOnInit called');
        this.titleService.updateTitle('Activity Report');
        await this.fetchActivities();
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit called');
        if (this.gridComponent) {
            console.log('Grid component initialized');
            console.log('Current rowData:', this.rowData);
            this.gridComponent.refreshGrid(this.rowData);
        } else {
            console.error('Grid component not initialized');
        }
        this.changeDetectorRef.detectChanges();
    }

    async fetchActivities() {
        console.log('Fetching activities...');
        this.isLoading = true;
        try {
            const session = await fetchAuthSession();
            console.log('Session fetched:', session);

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
            console.log('User response:', getUserResponse);

            const tenantId = getUserResponse.UserAttributes?.find(
                (attr: AttributeType) => attr.Name === 'custom:tenentId'
            )?.Value;
            console.log('TenantId:', tenantId);

            const invokeCommand = new InvokeCommand({
                FunctionName: 'userActivity-getItems',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
            });

            console.log('Invoking Lambda function...');
            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Lambda response:', responseBody);

            if (responseBody.statusCode === 200) {
                const activities = JSON.parse(responseBody.body);
                console.log('Activities received from Lambda:', activities);

                this.rowData = activities.map((activity: any) => ({
                    memberID: activity.memberId,
                    name: activity.name,
                    role: activity.role,
                    action: activity.task,
                    timestamp: new Date(activity.createdAt).toLocaleString(),
                    details: activity.details
                }));

                console.log('Processed rowData:', this.rowData);

                this.updateCharts();
                this.updateMetrics();

                if (this.gridComponent) {
                    console.log('Refreshing grid with new data');
                    this.gridComponent.refreshGrid(this.rowData);
                } else {
                    console.error('Grid component not found');
                }
            } else {
                console.error('Error fetching activities:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
        }
    }

    updateCharts() {
        console.log('Updating charts');
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

        this.optionsActivitiesByMember = this.chartDataService.setPieData(actionsByMember, 'Activities by Member');
        console.log('Charts updated');
    }

    updateMetrics() {
        console.log('Updating metrics');
        const totalActivities = this.rowData.length;
        const uniqueMembers = new Set(this.rowData.map(row => row.memberID)).size;
        const avgActivities = totalActivities / uniqueMembers;
        const latestActivity = new Date(Math.max(...this.rowData.map(row => new Date(row.timestamp).getTime())));

        this.ActivityReport.metrics[0].value = totalActivities.toString();
        this.ActivityReport.metrics[1].value = uniqueMembers.toString();
        this.ActivityReport.metrics[2].value = avgActivities.toFixed(2);
        this.ActivityReport.metrics[3].value = latestActivity.toLocaleString();

        // You can calculate percentage changes if you have previous data to compare
        // For now, we'll set them to 0
        this.ActivityReport.metrics.forEach(metric => metric.percentage = 0);

        console.log('Metrics updated:', this.ActivityReport.metrics);
    }

    back() {
        this.router.navigate(['/reports']);
    }
}