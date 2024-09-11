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


type ReportType = {
    icon: string;
    title: string;
    subtitle: string;
};

type ReportsObject = {
    [key: string]: ReportType;
};
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
    ) { }
    reportOrder: (keyof ReportsObject)[] = ['InventoryReport', 'OrderReport', 'SupplierReport', 'ActivityReport'];

    reports: ReportsObject = {
        InventoryReport: {
            icon: 'inventory_2',
            title: 'Inventory Report',
            subtitle: 'The Inventory Report provides a holistic view of your inventory status, movements, and forecasts. By leveraging advanced analytics and predictive modeling, this powerful tool offers actionable insights to optimize inventory levels, automate ordering processes, and enhance overall supply chain efficiency.',
        },
        OrderReport: {
            icon: 'assignment',
            title: 'Order Report',
            subtitle: 'The Order Report provides a holistic view of your ordering system, encompassing both manual and automated orders. This powerful tool offers insights into order quality, processing times, and associated analytics, enabling data-driven decisions to optimize your order fulfillment process.',
        },
        SupplierReport: {
            icon: 'local_shipping',
            title: 'Supplier Report',
            subtitle: 'The Supplier Report provides a holistic view of your supplier network, their activities, performance metrics, and associated analytics. This powerful tool offers insights into supplier reliability, quality, cost-effectiveness, overall impact on your supply chain and enabling data-driven decisions to optimize supplier relationships.',
        },
        ActivityReport: {
            icon: 'people',
            title: 'Activity Report',
            subtitle: "The Team Activity Report provides a holistic view of your team's performance, activities, and associated analytics. This powerful tool streamlines team management by offering actionable insights through intuitive visualizations and detailed metrics.",
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

            const givenName = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'given_name')?.Value || '';
            const familyName = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'family_name')?.Value || '';
            this.userName = `${givenName} ${familyName}`.trim();

            this.tenantId =
                getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value || '';

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

            const currentUser = users.find(
                (user: any) =>
                    user.Attributes.find((attr: any) => attr.Name === 'email')?.Value ===
                    session.tokens?.accessToken.payload['username'],
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

    async viewFullReport(report: keyof ReportsObject) {
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
