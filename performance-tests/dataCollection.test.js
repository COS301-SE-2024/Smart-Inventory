import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuration
const API_ENDPOINT = 'https://37xay8kw21.execute-api.us-east-1.amazonaws.com/default/deleteSupplier';
const TENANT_ID = '1727536990262-y7kitc';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    },
};

export default function () {
    const headers = {
        'Content-Type': 'application/json',
        'X-Tenant-ID': TENANT_ID,
    };

    // Test fetchInventorySummary
    {
        const res = http.get(`${API_ENDPOINT}/inventory-summary`, { headers });
        check(res, {
            'fetchInventorySummary status is 200': (r) => r.status === 200,
            'fetchInventorySummary duration is < 200ms': (r) => r.timings.duration < 200,
        });
    }

    // Test fetchStockRequests
    {
        const res = http.get(`${API_ENDPOINT}/stock-requests`, { headers });
        check(res, {
            'fetchStockRequests status is 200': (r) => r.status === 200,
            'fetchStockRequests duration is < 200ms': (r) => r.timings.duration < 200,
        });
    }

    // Test fetchSupplierQuotePrices
    {
        const res = http.get(`${API_ENDPOINT}/supplier-quote-prices`, { headers });
        check(res, {
            'fetchSupplierQuotePrices status is 200': (r) => r.status === 200,
            'fetchSupplierQuotePrices duration is < 200ms': (r) => r.timings.duration < 200,
        });
    }

    sleep(1);
}