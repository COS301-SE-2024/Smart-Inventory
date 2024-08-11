import { TitleService } from '../../components/header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../components/material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { InventoryReportComponent } from '../../components/reports/inventory-report/inventory-report.component';
import { Router } from '@angular/router';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        MatCardModule,
        MatGridListModule,
        MaterialModule,
        CommonModule,
        MatProgressSpinnerModule,
        InventoryReportComponent,
    ],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
    ) {}

    reports = {
        InventoryReport: {
            title: 'Inventory Report',
            subtitle:
                'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
            metric_1: 'Total Low Stock Items: ',
            metric_2: 'Inventory Accuracy: ',
            metric_3: 'Stock to Request Ratio: ',
            metric_4: 'Total monthly requests: ',
            metric_5: 'Fulfilled requests: ',
            metric_6: 'Pending/Failed requests: ',
            metric_7: 'Backorder to time ratio: ',
            metric_8: 'Safety stock: ',
            graphs: [],
        },
        ActivityReport: {
            title: 'Activity Report',
            subtitle:
                'Have an overall view of the team, their performance, activities and analytics associated with it making team management easier.',
            metric_1: 'Average completed activities: ',
            metric_2: 'Idle users: ',
            metric_3: 'Average time to complete a task: ',
            graphs: [],
        },
        OrderReport: {
            title: 'Order Report',
            subtitle:
                'Have an overall view of the orders, the quality, time it takes and analytics associated with it.',
            metric_1: 'Total orders: ',
            metric_2: 'Order placement frequency: ',
            metric_3: 'Order picking accuracy: ',
            metric_4: 'Total amount of automated orders: ',
            metric_5: 'Average order trips reduced: ',
            metric_6: 'Automated order frequency: ',
            graphs: [],
        },
        SupplierReport: {
            title: 'Supplier Report',
            subtitle:
                'Have an overall view of the suppliers, their activities, how well they performed and analytics associated with them.',
            metric_1: 'Average supplier performance: ',
            metric_2: 'Overall product defect rate: ',
            metric_3: 'Worst performer: ',
            graphs: [],
        },
    };

    tenantId: string = '';
    userName: string = '';
    userRole: string = '';

    async ngOnInit() {
        this.titleService.updateTitle('Reports');
        await this.getUserInfo();
        await this.logActivity('Viewed reports', 'Reports page navigated');
    }

    async getUserInfo() {
        try {
            const session = await fetchAuthSession();

            const cognitoClient = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await cognitoClient.send(getUserCommand);

            const givenName = getUserResponse.UserAttributes?.find(attr => attr.Name === 'given_name')?.Value || '';
            const familyName = getUserResponse.UserAttributes?.find(attr => attr.Name === 'family_name')?.Value || '';
            this.userName = `${givenName} ${familyName}`.trim();

            this.tenantId = getUserResponse.UserAttributes?.find(attr => attr.Name === 'custom:tenentId')?.Value || '';

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                userPoolId: outputs.auth.user_pool_id,
                username: session.tokens?.accessToken.payload['username'],
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getUsersV2',
                Payload: new TextEncoder().encode(payload),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const users = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            const currentUser = users.find((user: any) => 
                user.Attributes.find((attr: any) => attr.Name === 'email')?.Value === session.tokens?.accessToken.payload['username']
            );

            if (currentUser && currentUser.Groups.length > 0) {
                this.userRole = this.getRoleDisplayName(currentUser.Groups[0].GroupName);
            }

        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    async logActivity(task: string, details: string) {
        try {
            const session = await fetchAuthSession();
    
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });
    
            const payload = JSON.stringify({
                tenentId: this.tenantId,
                memberId: this.tenantId,
                name: this.userName,
                role: this.userRole || 'Admin',
                task: task,
                timeSpent: 0,
                idleTime: 0,
                details: details,
            });
    
            const invokeCommand = new InvokeCommand({
                FunctionName: 'userActivity-createItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });
    
            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
    
            if (responseBody.statusCode === 201) {
                console.log('Activity logged successfully');
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    async viewFullReport(report: string) {
        let reportDetails = '';
        switch (report) {
            case 'InventoryReport':
                this.router.navigate(['/inventoryReport']);
                reportDetails = 'Viewed full Inventory Report';
                break;
            case 'ActivityReport':
                this.router.navigate(['/activityReport']);
                reportDetails = 'Viewed full Activity Report';
                break;
            case 'OrderReport':
                this.router.navigate(['/orderReport']);
                reportDetails = 'Viewed full Order Report';
                break;
            case 'SupplierReport':
                this.router.navigate(['/supplierReport']);
                reportDetails = 'Viewed full Supplier Report';
                break;
            default:
                console.warn(`Unknown report type: ${report}`);
                return;
        }
        await this.logActivity('Viewed full report', reportDetails);
    }

    private getRoleDisplayName(roleName: string): string {
        switch (roleName) {
            case 'admin':
                return 'Admin';
            case 'enduser':
                return 'End User';
            case 'inventorycontroller':
                return 'Inventory Controller';
            default:
                return '';
        }
    }
}