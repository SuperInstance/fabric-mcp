# Advanced Analytics Dashboard

Spreadsheet Moment - Round 13: Comprehensive analytics and monitoring dashboard for real-time metrics, predictive analytics, and business intelligence.

## Features

- **Real-Time Metrics Collection**: Record and track metrics with automatic aggregation
- **Predictive Analytics**: Forecast trends and detect anomalies using time series analysis
- **Custom Dashboards**: Build custom dashboards with various widget types
- **Report Generation**: Generate PDF reports and schedule recurring exports
- **Alert System**: Set up custom alert rules for monitoring
- **API Integration**: RESTful API handlers for easy integration

## Installation

```bash
npm install @spreadsheet-moment/analytics
```

## Quick Start

```typescript
import {
  AnalyticsDashboardManager,
  MetricsCollector,
  PredictiveAnalyticsEngine,
  DashboardBuilder
} from '@spreadsheet-moment/analytics';

// Create a manager
const manager = new AnalyticsDashboardManager();

// Access components
const collector = manager.getCollector();
const engine = manager.getPredictiveEngine();
const builder = manager.getDashboardBuilder();

// Record metrics
collector.recordMetric('website.page_views', 1520);
collector.recordMetric('sales.revenue', 45230.50);

// Generate forecast
const forecast = await engine.forecast('sales.revenue', 7);

// Build dashboard
builder.addMetricCard({
  title: 'Total Revenue',
  metricId: 'sales.revenue',
  position: { row: 0, column: 0 },
  showTrend: true
});
```

## Core Components

### MetricsCollector

Collect, store, and aggregate time-series metrics.

```typescript
const collector = new MetricsCollector();

// Record a metric
collector.recordMetric('metric.id', 100, new Date());

// Get latest value
const latest = collector.getLatestData('metric.id');

// Get time series
const timeSeries = collector.getTimeSeries(
  'metric.id',
  startDate,
  endDate,
  'hour'
);

// Aggregate metrics
const aggregated = collector.getAggregatedMetrics(
  ['metric1', 'metric2'],
  'avg'
);

// Add alert rule
collector.addAlertRule({
  metricId: 'metric.id',
  condition: (metric) => {
    if (metric.value > threshold) {
      return { /* alert config */ };
    }
    return null;
  }
});
```

### PredictiveAnalyticsEngine

Analyze trends, generate forecasts, and detect anomalies.

```typescript
const engine = new PredictiveAnalyticsEngine();

// Train forecasting model
const modelId = await engine.trainModel(
  'metric.id',
  historicalData
);

// Generate forecast
const forecast = await engine.forecast('metric.id', 7);
console.log(forecast.forecast);
// [
//   { timestamp: Date, value: 100, confidence: { min: 90, max: 110 } },
//   ...
// ]

// Detect anomalies
const anomalies = await engine.detectAnomalies(
  'metric.id',
  data,
  2.5 // sensitivity
);

// Analyze trend
const trend = engine.analyzeTrend('metric.id', data);
// { direction: 'increasing', strength: 0.85, ... }
```

### DashboardBuilder

Create custom dashboards with various widgets.

```typescript
const builder = new DashboardBuilder();

// Add metric card
const cardId = builder.addMetricCard({
  title: 'Total Revenue',
  metricId: 'sales.revenue',
  position: { row: 0, column: 0 },
  showTrend: true,
  thresholds: [
    { value: 0, color: '#ff4444', label: 'Low' },
    { value: 50000, color: '#44cc44', label: 'High' }
  ]
});

// Add line chart
const chartId = builder.addLineChart({
  title: 'Revenue Trend',
  metricIds: ['sales.revenue', 'sales.costs'],
  position: { row: 0, column: 1, rowSpan: 2, colSpan: 2 },
  timeRange: { start: startDate, end: endDate },
  colorScheme: ['#1E88E5', '#43A047']
});

// Add gauge
const gaugeId = builder.addGauge({
  title: 'Conversion Rate',
  metricId: 'sales.conversion_rate',
  min: 0,
  max: 10,
  position: { row: 1, column: 0 }
});

// Add heatmap
const heatmapId = builder.addHeatmap({
  title: 'Activity Heatmap',
  spreadsheetId: 'sheet123',
  range: 'A1:Z20',
  position: { row: 2, column: 0 }
});

// Add funnel chart
const funnelId = builder.addFunnel({
  title: 'Sales Funnel',
  stages: [
    { name: 'Visitors', value: 10000 },
    { name: 'Leads', value: 5000 },
    { name: 'Customers', value: 500 }
  ],
  position: { row: 2, column: 1 }
});

// Get layout
const layout = builder.getDashboardLayout();

// Auto-arrange
builder.autoArrange(4, 3); // 4 rows, 3 columns

// Remove widget
builder.removeWidget(widgetId);
```

### ReportGenerator

Generate reports and schedule recurring exports.

```typescript
const generator = new ReportGenerator();

// Generate PDF report
const pdf = await generator.generatePDFReport({
  title: 'Monthly Report',
  timeRange: { start: startDate, end: endDate },
  widgets: dashboardLayout,
  includeData: true
});

// Schedule recurring report
const reportId = generator.scheduleReport({
  name: 'Weekly Analytics',
  recipients: ['admin@example.com'],
  schedule: 'weekly',
  widgets: dashboardLayout,
  format: 'pdf'
});

// Export dashboard
const exported = generator.exportDashboard('json');
```

### AnalyticsDashboardManager

Unified interface for all components.

```typescript
const manager = new AnalyticsDashboardManager();

// Access components
const collector = manager.getCollector();
const engine = manager.getPredictiveEngine();
const builder = manager.getDashboardBuilder();
const generator = manager.getReportGenerator();
```

## API Integration

### Using the API Handler

```typescript
import {
  createAnalyticsApiHandler,
  AnalyticsRouteHandlers
} from '@spreadsheet-moment/analytics';

// Create handler
const api = createAnalyticsApiHandler();

// Record metric
const result = await api.recordMetric({
  metricId: 'website.page_views',
  value: 1520
});

// Get latest metric
const latest = await api.getLatestMetric('website.page_views');

// Generate forecast
const forecast = await api.generateForecast({
  metricId: 'sales.revenue',
  horizon: 7
});

// Create widget
const widget = await api.createWidget({
  type: 'metric-card',
  title: 'Revenue',
  position: { row: 0, column: 0 },
  config: { metricId: 'sales.revenue' }
});

// Get dashboard layout
const layout = await api.getDashboardLayout();

// Generate report
const report = await api.generateReport({
  title: 'Analytics Report',
  timeRange: { start: startDate, end: endDate },
  includeData: true
});
```

### REST API Endpoints

#### Metrics

```
POST   /api/analytics/metrics                    Record metric
GET    /api/analytics/metrics/:id/latest          Get latest value
GET    /api/analytics/metrics/:id/timeseries     Get time series
POST   /api/analytics/metrics/aggregate          Aggregate metrics
```

#### Predictive Analytics

```
POST   /api/analytics/forecast                   Generate forecast
POST   /api/analytics/anomalies                  Detect anomalies
GET    /api/analytics/metrics/:id/trend          Analyze trend
```

#### Dashboard

```
GET    /api/analytics/dashboard/layout           Get layout
POST   /api/analytics/dashboard/widgets          Create widget
DELETE /api/analytics/dashboard/widgets/:id      Remove widget
POST   /api/analytics/dashboard/auto-arrange     Auto-arrange
```

#### Reports

```
POST   /api/analytics/reports/generate           Generate report
POST   /api/analytics/reports/schedule           Schedule report
GET    /api/analytics/dashboard/export           Export dashboard
```

## Type Reference

### MetricData

```typescript
interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  granularity: 'realtime' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}
```

### AnalyticsWidget

```typescript
interface AnalyticsWidget {
  id: string;
  type: 'line-chart' | 'bar-chart' | 'pie-chart' | 'metric-card' |
        'table' | 'heatmap' | 'gauge' | 'funnel';
  title: string;
  description?: string;
  position: {
    row: number;
    column: number;
    rowSpan?: number;
    colSpan?: number;
  };
  dataSource: DataSource;
  config: WidgetConfig;
}
```

### ForecastResult

```typescript
interface ForecastResult {
  metric: string;
  forecast: Array<{
    timestamp: Date;
    value: number;
    confidence: { min: number; max: number };
  }>;
  model: string;
  accuracy: number;
  methodology: string;
}
```

### AnomalyAlert

```typescript
interface AnomalyAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  metric: string;
  currentValue: number;
  expectedRange: { min: number; max: number };
  deviation: number;
  timestamp: Date;
  description: string;
  suggestedAction?: string;
}
```

## Examples

See `examples.ts` for comprehensive usage examples:

1. **Basic Metrics Collection**: Recording and retrieving metrics
2. **Predictive Analytics**: Training models and generating forecasts
3. **Dashboard Building**: Creating custom dashboards with widgets
4. **Alert Rules**: Setting up monitoring and alerts
5. **Report Generation**: Generating and scheduling reports
6. **Analytics Manager**: Using the unified manager interface
7. **API Handler**: RESTful API integration
8. **Complete Workflow**: End-to-end analytics pipeline

```typescript
import { runAllExamples } from '@spreadsheet-moment/analytics';

// Run all examples
await runAllExamples();
```

## Best Practices

### Metric Naming

Use dot notation for hierarchical naming:

```typescript
// Good
collector.recordMetric('website.traffic.page_views', 1520);
collector.recordMetric('sales.revenue.monthly', 45230);

// Avoid
collector.recordMetric('pageViews', 1520);
collector.recordMetric('revenue', 45230);
```

### Data Granularity

Choose appropriate granularity for your use case:

- `realtime`: For live monitoring and alerts
- `minute`: For short-term analysis
- `hour`: For daily operations
- `day`: For weekly/monthly reports
- `week`/`month`: For long-term trends

### Alert Thresholds

Set realistic thresholds based on historical data:

```typescript
// Calculate threshold from historical data
const historicalData = collector.getTimeSeries(metricId, startDate, endDate);
const values = historicalData.map(d => d.value);
const mean = values.reduce((a, b) => a + b) / values.length;
const stdDev = Math.sqrt(values.map(v => Math.pow(v - mean, 2)).reduce((a, b) => a + b) / values.length);

collector.addAlertRule({
  metricId,
  condition: (metric) => {
    const zScore = Math.abs((metric.value - mean) / stdDev);
    if (zScore > 3) {
      return { /* alert */ };
    }
    return null;
  }
});
```

### Dashboard Layout

Organize widgets logically:

```typescript
// Row 0: High-level KPIs
builder.addMetricCard({ title: 'Revenue', position: { row: 0, column: 0 } });
builder.addMetricCard({ title: 'Users', position: { row: 0, column: 1 } });

// Row 1: Trends and comparisons
builder.addLineChart({ title: 'Revenue Trend', position: { row: 1, column: 0, colSpan: 2 } });

// Row 2: Detailed breakdowns
builder.addFunnel({ title: 'Conversion Funnel', position: { row: 2, column: 0 } });
```

## Performance Considerations

### Data Retention

- Metrics are automatically trimmed to 10,000 data points per metric
- Use appropriate time ranges when querying
- Consider aggregation for long-term storage

### Forecasting

- Training requires at least 30 data points
- More historical data improves accuracy
- Re-train models periodically for best results

### Dashboard Updates

- Use appropriate refresh intervals for widgets
- Consider using aggregators for real-time dashboards
- Cache expensive computations

## Error Handling

All API methods return structured responses:

```typescript
const result = await api.recordMetric({ metricId: 'test', value: 100 });

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

## License

MIT

## Contributing

Contributions welcome! Please see CONTRIBUTING.md for guidelines.

## Support

- GitHub Issues: https://github.com/spreadsheet-moment/analytics/issues
- Documentation: https://docs.spreadsheet-moment.com/analytics
- Email: support@spreadsheet-moment.com
