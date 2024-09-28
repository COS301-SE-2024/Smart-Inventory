import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { AgCartesianChartOptions, AgChartOptions } from 'ag-charts-community';
import { AgAxisLabelFormatterParams } from 'ag-charts-community';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';

interface ForecastDataPoint {
  week: number;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

@Component({
  selector: 'app-forecast-modal',
  templateUrl: './forecast-modal.component.html',
  styleUrls: ['./forecast-modal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    AgChartsAngularModule,
    MatSnackBarModule
  ]
})
export class ForecastModalComponent implements OnInit {
  loading = true;
  error: string | null = null;
  forecastData: ForecastDataPoint[] = [];
  chartOptions: AgChartOptions;

  constructor(
    public dialogRef: MatDialogRef<ForecastModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tenentId: string; SKU: string; },
    private snackBar: MatSnackBar
  ) {
    this.chartOptions = this.createChartOptions();
  }

  ngOnInit() {
    this.invokeForecastLambda();
  }

  async invokeForecastLambda() {
    try {
      const session = await fetchAuthSession();

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      console.log(this.data.SKU);
      const payload = JSON.stringify({
        tenentId: this.data.tenentId,
        SKU: this.data.SKU,
      });

      console.log("Hello");
      console.log("Payload" + payload);
      const invokeCommand = new InvokeCommand({
        FunctionName: 'MachineLearning-Forecasts',
        Payload: new TextEncoder().encode(JSON.parse(JSON.stringify(payload))),
      });
      
      console.log("1");
      const lambdaResponse = await lambdaClient.send(invokeCommand);
      console.log("2");
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
      console.log("3");

      if (responseBody.statusCode === 200) {
        this.forecastData = this.parseForecastData(JSON.parse(responseBody.body));
        this.updateChartOptions();
      } else {
        throw new Error(responseBody.body || 'Unknown error occurred');
      }
    } catch (error: unknown) {
      console.error('Error invoking Lambda function:', error);
      let errorMessage = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      this.error = `Error generating forecast: ${errorMessage}`;
      this.snackBar.open(this.error, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } finally {
      this.loading = false;
    }
  }

  parseForecastData(data: any): ForecastDataPoint[] {
    const forecasts = data.data.forecasts[this.data.SKU];
    return forecasts.slice(0, 12).map((item: any) => ({
      week: item.week,
      yhat: item.yhat,
      yhat_lower: item.yhat_lower,
      yhat_upper: item.yhat_upper
    }));
  }

  createChartOptions(): AgChartOptions {
    return {
      title: {
        text: `Forecast for SKU: ${this.data.SKU}`,
      },
      data: this.forecastData,
      series: [
        {
          type: 'line',
          xKey: 'week',
          yKey: 'yhat',
          yName: 'Forecast',
          stroke: '#1976d2',
          marker: {
            enabled: true,
            fill: '#1976d2',
            stroke: '#1976d2',
          },
        } as any,
        {
          type: 'line',
          xKey: 'week',
          yKey: 'yhat_upper',
          yName: 'Upper Bound',
          stroke: '#4caf50',
          strokeWidth: 1,
          strokeOpacity: 0.5,
        } as any,
        {
          type: 'line',
          xKey: 'week',
          yKey: 'yhat_lower',
          yName: 'Lower Bound',
          stroke: '#f44336',
          strokeWidth: 1,
          strokeOpacity: 0.5,
        } as any,
        {
          type: 'area',
          xKey: 'week',
          yKey: 'yhat_lower',
          y1Key: 'yhat_upper',
          fill: '#1976d233',
          stroke: 'none',
          fillOpacity: 0.3,
        } as any,
      ],
      legend: { position: 'bottom' },
      axes: [
        { 
          type: 'category', 
          position: 'bottom', 
          title: { text: 'Week' },
          label: {
            formatter: (params: AgAxisLabelFormatterParams) => params.value.toString(),
          },
        } as any,
        { 
          type: 'number', 
          position: 'left', 
          title: { text: 'Quantity' },
        } as any,
      ],
    };
  }

 
  updateChartOptions() {
    this.chartOptions = {
      ...this.chartOptions,
      data: this.forecastData,
    } as AgCartesianChartOptions;
  }

  onClose() {
    this.dialogRef.close(this.error ? { error: this.error } : null);
  }

  printForecast() {
    if (this.error) {
      console.error('Cannot print forecast due to error:', this.error);
      this.snackBar.open('Cannot print forecast due to an error', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    window.print();
  }

  getTotalForecast(): number {
    return this.forecastData.reduce((sum, item) => sum + item.yhat, 0);
  }

  getAverageForecast(): number {
    return this.getTotalForecast() / this.forecastData.length;
  }

  getHighestForecast(): number {
    return Math.max(...this.forecastData.map(item => item.yhat));
  }

  getHighestForecastWeek(): number {
    const highestForecast = this.getHighestForecast();
    return this.forecastData.find(item => item.yhat === highestForecast)?.week || 0;
  }

  getLowestForecast(): number {
    return Math.min(...this.forecastData.map(item => item.yhat));
  }

  getLowestForecastWeek(): number {
    const lowestForecast = this.getLowestForecast();
    return this.forecastData.find(item => item.yhat === lowestForecast)?.week || 0;
  }
}