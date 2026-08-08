/**
 * Spreadsheet Moment - Advanced Analytics Dashboard Examples
 * Round 13: Usage examples and demonstrations
 */

import {
  MetricsCollector,
  PredictiveAnalyticsEngine,
  DashboardBuilder,
  ReportGenerator,
  AnalyticsDashboardManager
} from './AdvancedAnalyticsDashboard';
import {
  AnalyticsApiHandler,
  createAnalyticsApiHandler
} from './api';

/**
 * Example 1: Basic Metrics Collection
 */
export async function example1_BasicMetrics() {
  console.log('=== Example 1: Basic Metrics Collection ===');

  const collector = new MetricsCollector();

  // Record some metrics
  const now = new Date();

  // Record website traffic
  collector.recordMetric('website.page_views', 1520, now);
  collector.recordMetric('website.unique_visitors', 892, now);
  collector.recordMetric('website.avg_session_duration', 245, now);

  // Record sales data
  collector.recordMetric('sales.revenue', 45230.50, now);
  collector.recordMetric('sales.orders', 142, now);
  collector.recordMetric('sales.conversion_rate', 3.2, now);

  // Get latest metrics
  const pageViews = collector.getLatestData('website.page_views');
  console.log('Latest page views:', pageViews);

  // Get time series data
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
  const timeSeries = collector.getTimeSeries('website.page_views', startTime, now, 'hour');
  console.log('Time series data points:', timeSeries.length);

  // Get aggregated metrics
  const aggregated = collector.getAggregatedMetrics(
    ['website.page_views', 'website.unique_visitors'],
    'sum'
  );
  console.log('Aggregated metrics:', aggregated);
}

/**
 * Example 2: Predictive Analytics and Forecasting
 */
export async function example2_PredictiveAnalytics() {
  console.log('=== Example 2: Predictive Analytics and Forecasting ===');

  const collector = new MetricsCollector();
  const engine = new PredictiveAnalyticsEngine();

  // Generate historical data
  const now = new Date();
  const metricId = 'sales.daily_revenue';

  for (let i = 30; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const value = 4000 + Math.random() * 2000 + (i * 50); // Trending up
    collector.recordMetric(metricId, value, timestamp);
  }

  // Get historical data for training
  const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const historicalData = collector.getTimeSeries(metricId, startTime, now, 'day');

  // Train model
  const modelId = await engine.trainModel(metricId, historicalData);
  console.log('Trained model:', modelId);

  // Generate forecast
  const forecast = await engine.forecast(metricId, 7); // 7-day forecast
  console.log('7-day forecast:');
  forecast.forecast.forEach((f, i) => {
    console.log(`  Day ${i + 1}: ${f.value.toFixed(2)} (range: ${f.confidence.min.toFixed(2)} - ${f.confidence.max.toFixed(2)})`);
  });

  // Detect anomalies
  const anomalies = await engine.detectAnomalies(metricId, historicalData, 2.5);
  console.log('Detected anomalies:', anomalies.length);

  // Analyze trend
  const trend = engine.analyzeTrend(metricId, historicalData);
  console.log('Trend analysis:', trend);
}

/**
 * Example 3: Dashboard Building
 */
export async function example3_DashboardBuilding() {
  console.log('=== Example 3: Dashboard Building ===');

  const builder = new DashboardBuilder();

  // Add metric cards
  const revenueCard = builder.addMetricCard({
    title: 'Total Revenue',
    metricId: 'sales.revenue',
    position: { row: 0, column: 0 },
    showTrend: true,
    showSparkline: true,
    thresholds: [
      { value: 0, color: '#ff4444', label: 'Low' },
      { value: 30000, color: '#ffaa00', label: 'Medium' },
      { value: 50000, color: '#44cc44', label: 'High' }
    ]
  });
  console.log('Created revenue card:', revenueCard);

  // Add line chart
  const trafficChart = builder.addLineChart({
    title: 'Website Traffic',
    metricIds: ['website.page_views', 'website.unique_visitors'],
    position: { row: 0, column: 1 },
    timeRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    colorScheme: ['#1E88E5', '#43A047'],
    showLegend: true
  });
  console.log('Created traffic chart:', trafficChart);

  // Add gauge
  const conversionGauge = builder.addGauge({
    title: 'Conversion Rate',
    metricId: 'sales.conversion_rate',
    min: 0,
    max: 10,
    position: { row: 1, column: 0 },
    thresholds: [
      { value: 2, color: '#ff4444', label: 'Poor' },
      { value: 4, color: '#ffaa00', label: 'Good' },
      { value: 6, color: '#44cc44', label: 'Excellent' }
    ]
  });
  console.log('Created conversion gauge:', conversionGauge);

  // Add funnel
  const funnelChart = builder.addFunnel({
    title: 'Sales Funnel',
    stages: [
      { name: 'Visitors', value: 10000 },
      { name: 'Product Views', value: 5000 },
      { name: 'Add to Cart', value: 2000 },
      { name: 'Checkout', value: 1000 },
      { name: 'Purchase', value: 500 }
    ],
    position: { row: 2, column: 0 }
  });
  console.log('Created funnel chart:', funnelChart);

  // Get dashboard layout
  const layout = builder.getDashboardLayout();
  console.log('Dashboard layout:', layout.length, 'widgets');

  // Auto-arrange widgets
  builder.autoArrange(4, 3);
  console.log('Auto-arranged dashboard in 4x3 grid');
}

/**
 * Example 4: Alert Rules and Monitoring
 */
export async function example4_AlertRules() {
  console.log('=== Example 4: Alert Rules and Monitoring ===');

  const collector = new MetricsCollector();

  // Add alert rule for low page views
  class LowPageViewsAlertRule {
    constructor(public metricId: string) {}

    condition = (metric: import('./AdvancedAnalyticsDashboard').MetricData) => {
      if (metric.value < 100) {
        return {
          id: `alert-${Date.now()}`,
          severity: 'warning' as const,
          metric: this.metricId,
          currentValue: metric.value,
          expectedRange: { min: 100, max: 10000 },
          deviation: Math.abs((metric.value - 100) / 100),
          timestamp: new Date(),
          description: 'Page views below minimum threshold',
          suggestedAction: 'Check website availability and marketing campaigns'
        };
      }
      return null;
    };

    evaluate(metric: import('./AdvancedAnalyticsDashboard').MetricData) {
      return this.condition(metric);
    }
  }

  collector.addAlertRule(new LowPageViewsAlertRule('website.page_views') as any);

  // Add alert rule for revenue spike
  class RevenueSpikeAlertRule {
    constructor(public metricId: string) {}

    condition = (metric: import('./AdvancedAnalyticsDashboard').MetricData) => {
      const expectedMax = metric.previousValue * 1.5;
      if (metric.value > expectedMax && metric.previousValue > 0) {
        return {
          id: `alert-${Date.now()}`,
          severity: 'info' as const,
          metric: this.metricId,
          currentValue: metric.value,
          expectedRange: { min: metric.previousValue, max: expectedMax },
          deviation: (metric.value - metric.previousValue) / metric.previousValue,
          timestamp: new Date(),
          description: 'Revenue spike detected - verify data accuracy',
          suggestedAction: 'Review orders and transactions'
        };
      }
      return null;
    };

    evaluate(metric: import('./AdvancedAnalyticsDashboard').MetricData) {
      return this.condition(metric);
    }
  }

  collector.addAlertRule(new RevenueSpikeAlertRule('sales.revenue') as any);

  // Record metrics (some will trigger alerts)
  collector.recordMetric('website.page_views', 50); // Will trigger warning
  collector.recordMetric('sales.revenue', 50000);
  collector.recordMetric('sales.revenue', 150000); // Will trigger info alert
}

/**
 * Example 5: Report Generation
 */
export async function example5_ReportGeneration() {
  console.log('=== Example 5: Report Generation ===');

  const builder = new DashboardBuilder();
  const generator = new ReportGenerator();

  // Create some widgets
  builder.addMetricCard({
    title: 'Monthly Revenue',
    metricId: 'sales.monthly_revenue',
    position: { row: 0, column: 0 }
  });

  builder.addLineChart({
    title: 'Revenue Trend',
    metricIds: ['sales.daily_revenue'],
    position: { row: 0, column: 1 },
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  });

  // Generate PDF report
  const pdfReport = await generator.generatePDFReport({
    title: 'Monthly Sales Report',
    timeRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    widgets: builder.getDashboardLayout(),
    includeData: true
  });
  console.log('Generated PDF report:', pdfReport.size, 'bytes');

  // Schedule recurring report
  const reportId = generator.scheduleReport({
    name: 'Weekly Analytics Report',
    recipients: ['admin@example.com', 'manager@example.com'],
    schedule: 'weekly',
    widgets: builder.getDashboardLayout(),
    format: 'pdf'
  });
  console.log('Scheduled report:', reportId);

  // Export dashboard
  const exported = generator.exportDashboard('json');
  console.log('Exported dashboard:', exported.length, 'characters');
}

/**
 * Example 6: Using the Analytics Manager
 */
export async function example6_AnalyticsManager() {
  console.log('=== Example 6: Using the Analytics Manager ===');

  const manager = new AnalyticsDashboardManager();

  // Access components
  const collector = manager.getCollector();
  const predictiveEngine = manager.getPredictiveEngine();
  const dashboardBuilder = manager.getDashboardBuilder();
  const reportGenerator = manager.getReportGenerator();

  // Record metrics
  const now = new Date();
  collector.recordMetric('app.active_users', 1250, now);
  collector.recordMetric('app.new_signups', 45, now);
  collector.recordMetric('app.churn_rate', 2.1, now);

  // Create dashboard
  dashboardBuilder.addMetricCard({
    title: 'Active Users',
    metricId: 'app.active_users',
    position: { row: 0, column: 0 }
  });

  dashboardBuilder.addGauge({
    title: 'Churn Rate',
    metricId: 'app.churn_rate',
    min: 0,
    max: 10,
    position: { row: 0, column: 1 },
    thresholds: [
      { value: 3, color: '#44cc44', label: 'Good' },
      { value: 5, color: '#ffaa00', label: 'Warning' },
      { value: 7, color: '#ff4444', label: 'Critical' }
    ]
  });

  // Generate report
  const report = await reportGenerator.generatePDFReport({
    title: 'App Performance Report',
    timeRange: {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now
    },
    widgets: dashboardBuilder.getDashboardLayout(),
    includeData: true
  });

  console.log('Report generated:', report.size, 'bytes');
}

/**
 * Example 7: API Handler Usage
 */
export async function example7_ApiHandler() {
  console.log('=== Example 7: API Handler Usage ===');

  const api = createAnalyticsApiHandler();

  // Record metric via API
  const recordResult = await api.recordMetric({
    metricId: 'api.requests_per_second',
    value: 245,
    timestamp: new Date()
  });
  console.log('Record metric:', recordResult.success, recordResult.message);

  // Get latest metric via API
  const latestResult = await api.getLatestMetric('api.requests_per_second');
  console.log('Latest metric:', latestResult.success, latestResult.data);

  // Create widget via API
  const widgetResult = await api.createWidget({
    type: 'metric-card',
    title: 'API Requests',
    position: { row: 0, column: 0 },
    config: {
      metricId: 'api.requests_per_second',
      showTrend: true
    }
  });
  console.log('Created widget:', widgetResult.success, widgetResult.data);

  // Get dashboard layout via API
  const layoutResult = await api.getDashboardLayout();
  console.log('Dashboard layout:', layoutResult.success, layoutResult.data?.length, 'widgets');

  // Generate forecast via API
  const forecastResult = await api.generateForecast({
    metricId: 'api.requests_per_second',
    horizon: 5
  });
  console.log('Forecast:', forecastResult.success);

  // Detect anomalies via API
  const anomalyResult = await api.detectAnomalies('api.requests_per_second', 2.5);
  console.log('Anomalies:', anomalyResult.success, anomalyResult.data?.length);
}

/**
 * Example 8: Complete Analytics Workflow
 */
export async function example8_CompleteWorkflow() {
  console.log('=== Example 8: Complete Analytics Workflow ===');

  const api = createAnalyticsApiHandler();

  // Step 1: Collect metrics
  console.log('Step 1: Collecting metrics...');
  for (let i = 0; i < 10; i++) {
    await api.recordMetric({
      metricId: 'workflow.step_duration',
      value: 100 + Math.random() * 50,
      timestamp: new Date(Date.now() - (10 - i) * 60000)
    });
  }

  // Step 2: Analyze trends
  console.log('Step 2: Analyzing trends...');
  const trendResult = await api.analyzeTrend('workflow.step_duration');
  console.log('Trend:', trendResult.data);

  // Step 3: Generate forecast
  console.log('Step 3: Generating forecast...');
  const forecastResult = await api.generateForecast({
    metricId: 'workflow.step_duration',
    horizon: 5
  });
  console.log('Forecast:', forecastResult.data?.forecast.map(f => ({ value: f.value, confidence: f.confidence })));

  // Step 4: Build dashboard
  console.log('Step 4: Building dashboard...');
  await api.createWidget({
    type: 'metric-card',
    title: 'Step Duration',
    position: { row: 0, column: 0 },
    config: { metricId: 'workflow.step_duration' }
  });

  await api.createWidget({
    type: 'line-chart',
    title: 'Duration Trend',
    position: { row: 0, column: 1 },
    config: {
      metricIds: ['workflow.step_duration'],
      timeRange: {
        start: new Date(Date.now() - 60 * 60 * 1000),
        end: new Date()
      }
    }
  });

  // Step 5: Generate report
  console.log('Step 5: Generating report...');
  const reportResult = await api.generateReport({
    title: 'Workflow Analytics Report',
    timeRange: {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    },
    includeData: true
  });
  console.log('Report:', reportResult.success, reportResult.data?.size, 'bytes');

  // Step 6: Schedule recurring report
  console.log('Step 6: Scheduling report...');
  const scheduleResult = await api.scheduleReport({
    name: 'Daily Workflow Report',
    recipients: ['team@example.com'],
    schedule: 'daily',
    format: 'pdf'
  });
  console.log('Scheduled:', scheduleResult.success, scheduleResult.data);

  console.log('Workflow complete!');
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║   Spreadsheet Moment - Advanced Analytics Dashboard         ║');
  console.log('║   Round 13: Usage Examples                                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  await example1_BasicMetrics();
  console.log('\n');

  await example2_PredictiveAnalytics();
  console.log('\n');

  await example3_DashboardBuilding();
  console.log('\n');

  await example4_AlertRules();
  console.log('\n');

  await example5_ReportGeneration();
  console.log('\n');

  await example6_AnalyticsManager();
  console.log('\n');

  await example7_ApiHandler();
  console.log('\n');

  await example8_CompleteWorkflow();
  console.log('\n');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('All examples completed successfully!');
  console.log('═══════════════════════════════════════════════════════════════');
}

// Export examples for individual testing
export default {
  example1_BasicMetrics,
  example2_PredictiveAnalytics,
  example3_DashboardBuilding,
  example4_AlertRules,
  example5_ReportGeneration,
  example6_AnalyticsManager,
  example7_ApiHandler,
  example8_CompleteWorkflow,
  runAllExamples
};
