/**
 * Spreadsheet Moment - Advanced Analytics Dashboard
 * Round 13: Advanced Analytics
 *
 * Comprehensive analytics and monitoring dashboard:
 * - Real-time metrics and visualizations
 * - Predictive analytics and forecasting
 * - Anomaly detection and alerting
 * - Custom dashboard builder
 * - Report generation and scheduling
 * - Business intelligence insights
 */

// Export all interfaces for external use
export interface MetricData {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  granularity: 'realtime' | 'minute' | 'hour' | 'day' | 'week' | 'month';
}

export interface AnalyticsWidget {
  id: string;
  type: 'line-chart' | 'bar-chart' | 'pie-chart' | 'metric-card' | 'table' | 'heatmap' | 'gauge' | 'funnel';
  title: string;
  description?: string;
  position: { row: number; column: number; rowSpan?: number; colSpan?: number };
  dataSource: DataSource;
  refreshInterval?: number;
  config: WidgetConfig;
}

export interface DataSource {
  type: 'query' | 'api' | 'spreadsheet' | 'database';
  connection?: string;
  query?: string;
  spreadsheetId?: string;
  range?: string;
  apiEndpoint?: string;
  refreshInterval?: number;
}

export interface WidgetConfig {
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltips?: boolean;
  showTrend?: boolean;
  showSparkline?: boolean;
  colorScheme?: string[];
  yAxis?: { min: number; max: number; label: string };
  xAxis?: { label: string; categories: string[] };
  thresholds?: { value: number; color: string; label: string }[];
  metricId?: string;
  metricIds?: string[];
  timeRange?: { start: Date; end: Date };
  min?: number;
  max?: number;
  spreadsheetId?: string;
  range?: string;
  colorScale?: { min: string; max: string };
  stages?: Array<{ name: string; value: number }>;
}

export interface AnomalyAlert {
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

export interface ForecastResult {
  metric: string;
  forecast: Array<{ timestamp: Date; value: number; confidence: { min: number; max: number } }>;
  model: string;
  accuracy: number;
  methodology: string;
}

/**
 * Real-Time Metrics Collector
 */
export class MetricsCollector {
  private metrics: Map<string, MetricData[]> = new Map();
  private aggregators: Map<string, Aggregator> = new Map();
  private alertRules: AlertRule[] = [];

  /**
   * Record metric value
   */
  recordMetric(metricId: string, value: number, timestamp: Date = new Date()): void {
    const previousData = this.getLatestData(metricId);

    const metric: MetricData = {
      id: metricId,
      name: this.getMetricName(metricId),
      value,
      previousValue: previousData?.value || 0,
      change: previousData ? value - previousData.value : 0,
      changePercent: previousData ? ((value - previousData.value) / previousData.value) * 100 : 0,
      timestamp,
      granularity: 'realtime'
    };

    if (!this.metrics.has(metricId)) {
      this.metrics.set(metricId, []);
    }

    this.metrics.get(metricId)!.push(metric);
    this.trimData(metricId);

    // Check for anomalies
    this.checkAnomalies(metricId);

    // Update aggregators
    this.updateAggregators(metricId, value);
  }

  /**
   * Get time series data for metric
   */
  getTimeSeries(metricId: string, startTime: Date, endTime: Date, granularity: string = 'hour'): MetricData[] {
    const data = this.metrics.get(metricId) || [];

    return data.filter(m =>
      m.timestamp >= startTime &&
      m.timestamp <= endTime &&
      m.granularity === granularity
    );
  }

  /**
   * Get latest data point
   */
  getLatestData(metricId: string): MetricData | undefined {
    const data = this.metrics.get(metricId);
    return data ? data[data.length - 1] : undefined;
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(metricIds: string[], aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'): Map<string, number> {
    const result = new Map<string, number>();

    for (const metricId of metricIds) {
      const data = this.metrics.get(metricId);
      if (!data || data.length === 0) continue;

      const values = data.map(m => m.value);
      let aggregated: number;

      switch (aggregation) {
        case 'sum':
          aggregated = values.reduce((sum, v) => sum + v, 0);
          break;
        case 'avg':
          aggregated = values.reduce((sum, v) => sum + v, 0) / values.length;
          break;
        case 'min':
          aggregated = Math.min(...values);
          break;
        case 'max':
          aggregated = Math.max(...values);
          break;
        case 'count':
          aggregated = values.length;
          break;
      }

      result.set(metricId, aggregated);
    }

    return result;
  }

  /**
   * Create time series aggregator
   */
  createAggregator(metricId: string, windowSize: number, aggregation: 'sum' | 'avg' | 'min' | 'max'): string {
    const aggregatorId = `${metricId}-${aggregation}-${windowSize}`;

    this.aggregators.set(aggregatorId, new Aggregator(metricId, windowSize, aggregation));

    return aggregatorId;
  }

  /**
   * Add alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  /**
   * Check for anomalies
   */
  private checkAnomalies(metricId: string): void {
    const latest = this.getLatestData(metricId);
    if (!latest) return;

    for (const rule of this.alertRules) {
      if (rule.metricId === metricId || rule.metricId === '*') {
        const anomaly = rule.evaluate(latest);
        if (anomaly) {
          this.triggerAlert(anomaly);
        }
      }
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(alert: AnomalyAlert): void {
    // Send to notification system
    console.warn(`[ALERT] ${alert.severity}: ${alert.description}`);
  }

  /**
   * Update aggregators
   */
  private updateAggregators(metricId: string, value: number): void {
    const aggregators = Array.from(this.aggregators.values());
    for (const aggregator of aggregators) {
      if (aggregator.metricId === metricId) {
        aggregator.update(value);
      }
    }
  }

  /**
   * Trim old data
   */
  private trimData(metricId: string): void {
    const data = this.metrics.get(metricId);
    if (data && data.length > 10000) {
      data.splice(0, data.length - 10000);
    }
  }

  /**
   * Get metric name
   */
  private getMetricName(metricId: string): string {
    return metricId.split('.').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

/**
 * Time Series Aggregator
 */
class Aggregator {
  private window: number[] = [];
  public metricId: string;
  private windowSize: number;
  private aggregation: 'sum' | 'avg' | 'min' | 'max';

  constructor(metricId: string, windowSize: number, aggregation: 'sum' | 'avg' | 'min' | 'max') {
    this.metricId = metricId;
    this.windowSize = windowSize;
    this.aggregation = aggregation;
  }

  update(value: number): void {
    this.window.push(value);

    if (this.window.length > this.windowSize) {
      this.window.shift();
    }
  }

  getValue(): number {
    if (this.window.length === 0) return 0;

    switch (this.aggregation) {
      case 'sum':
        return this.window.reduce((sum, v) => sum + v, 0);
      case 'avg':
        return this.window.reduce((sum, v) => sum + v, 0) / this.window.length;
      case 'min':
        return Math.min(...this.window);
      case 'max':
        return Math.max(...this.window);
    }
  }
}

/**
 * Alert Rule
 */
class AlertRule {
  constructor(
    public metricId: string,
    public condition: (metric: MetricData) => AnomalyAlert | null
  ) {}

  evaluate(metric: MetricData): AnomalyAlert | null {
    return this.condition(metric);
  }
}

/**
 * Prediction Model Interface
 */
interface PredictionModel {
  metricId: string;
  algorithm: string;
  accuracy: number;
  methodology: string;
  predict(horizon: number): Promise<Array<{ timestamp: Date; value: number; confidence: { min: number; max: number } }>>;
}

/**
 * Predictive Analytics Engine
 */
export class PredictiveAnalyticsEngine {
  private models: Map<string, PredictionModel> = new Map();

  /**
   * Train forecasting model
   */
  async trainModel(metricId: string, historicalData: MetricData[]): Promise<string> {
    const model = new TimeSeriesForecastModel(metricId);
    await model.train(historicalData);

    const modelId = `model-${metricId}-${Date.now()}`;
    this.models.set(modelId, model);

    return modelId;
  }

  /**
   * Generate forecast
   */
  async forecast(metricId: string, horizon: number): Promise<ForecastResult> {
    const model = Array.from(this.models.values()).find(m => m.metricId === metricId);

    if (!model) {
      throw new Error(`No model found for metric: ${metricId}`);
    }

    const forecast = await model.predict(horizon);

    return {
      metric: metricId,
      forecast,
      model: model.algorithm,
      accuracy: model.accuracy,
      methodology: model.methodology
    };
  }

  /**
   * Detect anomalies
   */
  async detectAnomalies(metricId: string, data: MetricData[], sensitivity: number = 2.5): Promise<AnomalyAlert[]> {
    const anomalies: AnomalyAlert[] = [];

    // Calculate mean and standard deviation
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);

    // Detect anomalies using z-score
    for (let i = 0; i < data.length; i++) {
      const zScore = Math.abs((data[i].value - mean) / stdDev);

      if (zScore > sensitivity) {
        anomalies.push({
          id: `anomaly-${metricId}-${i}`,
          severity: zScore > 5 ? 'critical' : zScore > 3 ? 'warning' : 'info',
          metric: metricId,
          currentValue: data[i].value,
          expectedRange: {
            min: mean - stdDev * sensitivity,
            max: mean + stdDev * sensitivity
          },
          deviation: zScore,
          timestamp: data[i].timestamp,
          description: `${metricId} is ${zScore.toFixed(2)}σ from mean`,
          suggestedAction: zScore > 5 ? 'Investigate immediately' : 'Monitor closely'
        });
      }
    }

    return anomalies;
  }

  /**
   * Trend analysis
   */
  analyzeTrend(metricId: string, data: MetricData[]): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number; // 0-1
    seasonality: boolean;
    changepoints: number[];
  } {
    const values = data.map(d => d.value);

    // Linear regression for trend
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Calculate R²
    const predictions = values.map((_, i) => slope * i + intercept);
    const ssRes = values.reduce((sum, v, i) => sum + Math.pow(v - predictions[i], 2), 0);
    const ssTot = values.reduce((sum, v) => sum + Math.pow(v - yMean, 2), 0);
    const rSquared = 1 - ssRes / ssTot;

    // Determine direction and strength
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 0.001 * yMean) {
      direction = 'stable';
    } else {
      direction = slope > 0 ? 'increasing' : 'decreasing';
    }

    return {
      direction,
      strength: rSquared,
      seasonality: false, // Would need seasonal decomposition
      changepoints: []
    };
  }
}

/**
 * Time Series Forecasting Model
 */
class TimeSeriesForecastModel {
  public metricId: string;
  public algorithm = 'exponential-smoothing';
  public accuracy = 0;
  public methodology = 'Holt-Winters Exponential Smoothing';

  private alpha = 0.3; // Level smoothing
  private beta = 0.2; // Trend smoothing
  private gamma = 0.3; // Seasonal smoothing
  private seasonality = 7;
  private level = 0;
  private trend = 0;
  private seasonal: number[] = [];

  constructor(metricId: string) {
    this.metricId = metricId;
  }

  async train(data: MetricData[]): Promise<void> {
    const values = data.map(d => d.value);

    // Initialize
    this.level = values[0];
    this.trend = values[1] - values[0];
    this.seasonal = Array(this.seasonality).fill(0);

    // Fit model
    for (let i = 1; i < values.length; i++) {
      this.update(values[i]);
    }

    // Calculate accuracy (MAPE)
    const predictions = values.map((_, i) => this.oneStepAhead(i));
    const errors = values.map((v, i) => Math.abs((v - predictions[i]) / v));
    this.accuracy = 1 - (errors.reduce((sum, e) => sum + e, 0) / errors.length);
  }

  async predict(horizon: number): Promise<Array<{ timestamp: Date; value: number; confidence: { min: number; max: number } }>> {
    const forecast: Array<{ timestamp: Date; value: number; confidence: { min: number; max: number } }> = [];

    let currentLevel = this.level;
    let currentTrend = this.trend;

    const startDate = new Date();

    for (let i = 1; i <= horizon; i++) {
      // Forecast
      const value = currentLevel + currentTrend * i;

      // Confidence intervals (simplified)
      const confidence = 0.95;
      const error = value * (1 - confidence);

      const timestamp = new Date(startDate);
      timestamp.setDate(timestamp.getDate() + i);

      forecast.push({
        timestamp,
        value,
        confidence: {
          min: value - error,
          max: value + error
        }
      });

      // Update for next iteration
      currentLevel += currentTrend;
    }

    return forecast;
  }

  private update(value: number): void {
    const prevLevel = this.level;
    const prevTrend = this.trend;

    // Holt-Winters equations
    this.level = this.alpha * value + (1 - this.alpha) * (prevLevel + prevTrend);
    this.trend = this.beta * (this.level - prevLevel) + (1 - this.beta) * prevTrend;

    // Seasonal update would go here
  }

  private oneStepAhead(index: number): number {
    return this.level + this.trend;
  }
}

/**
 * Custom Dashboard Builder
 */
export class DashboardBuilder {
  private widgets: AnalyticsWidget[] = [];
  private widgetIdCounter = 0;

  /**
   * Add metric card widget
   */
  addMetricCard(config: {
    title: string;
    metricId: string;
    position: { row: number; column: number };
    showTrend?: boolean;
    showSparkline?: boolean;
    thresholds?: WidgetConfig['thresholds'];
  }): string {
    const widget: AnalyticsWidget = {
      id: `widget-metric-${this.widgetIdCounter++}`,
      type: 'metric-card',
      title: config.title,
      position: config.position,
      dataSource: {
        type: 'query',
        connection: 'metrics',
        query: `SELECT * FROM metrics WHERE id = '${config.metricId}'`
      },
      config: {
        showTrend: true,
        thresholds: config.thresholds
      }
    };

    this.widgets.push(widget);
    return widget.id;
  }

  /**
   * Add line chart widget
   */
  addLineChart(config: {
    title: string;
    metricIds: string[];
    position: { row: number; column: number };
    timeRange: { start: Date; end: Date };
    colorScheme?: string[];
    showLegend?: boolean;
  }): string {
    const widget: AnalyticsWidget = {
      id: `widget-line-${this.widgetIdCounter++}`,
      type: 'line-chart',
      title: config.title,
      position: config.position,
      dataSource: {
        type: 'query',
        connection: 'metrics',
        query: `SELECT * FROM timeseries WHERE metric_id IN (${config.metricIds.map(id => `'${id}'`).join(',')})`
      },
      config: {
        colorScheme: config.colorScheme || ['#1E88E5', '#43A047', '#FB8C00'],
        showLegend: config.showLegend !== false
      }
    };

    this.widgets.push(widget);
    return widget.id;
  }

  /**
   * Add heatmap widget
   */
  addHeatmap(config: {
    title: string;
    spreadsheetId: string;
    range: string;
    position: { row: number; column: number };
    colorScale?: { min: string; max: string };
  }): string {
    const widget: AnalyticsWidget = {
      id: `widget-heatmap-${this.widgetIdCounter++}`,
      type: 'heatmap',
      title: config.title,
      position: config.position,
      dataSource: {
        type: 'spreadsheet',
        spreadsheetId: config.spreadsheetId,
        range: config.range
      },
      config: {}
    };

    this.widgets.push(widget);
    return widget.id;
  }

  /**
   * Add gauge widget
   */
  addGauge(config: {
    title: string;
    metricId: string;
    min: number;
    max: number;
    position: { row: number; column: number };
    thresholds?: Array<{ value: number; color: string; label: string }>;
  }): string {
    const widget: AnalyticsWidget = {
      id: `widget-gauge-${this.widgetIdCounter++}`,
      type: 'gauge',
      title: config.title,
      position: config.position,
      dataSource: {
        type: 'query',
        connection: 'metrics',
        query: `SELECT * FROM metrics WHERE id = '${config.metricId}' LIMIT 1`
      },
      config: {
        yAxis: { min: config.min, max: config.max, label: config.title },
        thresholds: config.thresholds
      }
    };

    this.widgets.push(widget);
    return widget.id;
  }

  /**
   * Add funnel chart widget
   */
  addFunnel(config: {
    title: string;
    stages: Array<{ name: string; value: number }>;
    position: { row: number; column: number };
  }): string {
    const widget: AnalyticsWidget = {
      id: `widget-funnel-${this.widgetIdCounter++}`,
      type: 'funnel',
      title: config.title,
      position: config.position,
      dataSource: {
        type: 'query',
        connection: 'metrics',
        query: 'SELECT * FROM funnel_data'
      },
      config: {}
    };

    this.widgets.push(widget);
    return widget.id;
  }

  /**
   * Remove widget
   */
  removeWidget(widgetId: string): void {
    const index = this.widgets.findIndex(w => w.id === widgetId);
    if (index >= 0) {
      this.widgets.splice(index, 1);
    }
  }

  /**
   * Get dashboard layout
   */
  getDashboardLayout(): AnalyticsWidget[] {
    return [...this.widgets];
  }

  /**
   * Auto-arrange widgets
   */
  autoArrange(rows: number, columns: number): void {
    for (let i = 0; i < this.widgets.length; i++) {
      const widget = this.widgets[i];

      if (!widget.position.rowSpan) widget.position.rowSpan = 1;
      if (!widget.position.colSpan) widget.position.colSpan = 1;

      const position = this.findAvailablePosition(rows, columns, widget.position.rowSpan!, widget.position.colSpan!);

      widget.position.row = position.row;
      widget.position.column = position.column;
    }
  }

  private findAvailablePosition(rows: number, columns: number, rowSpan: number, colSpan: number): { row: number; column: number } {
    for (let row = 0; row <= rows - rowSpan; row++) {
      for (let col = 0; col <= columns - colSpan; col++) {
        if (this.isPositionAvailable(row, col, rowSpan, colSpan)) {
          return { row, column: col };
        }
      }
    }

    return { row: 0, column: 0 };
  }

  private isPositionAvailable(row: number, col: number, rowSpan: number, colSpan: number): boolean {
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        const occupied = this.widgets.some(w =>
          r >= w.position.row && r < w.position.row + (w.position.rowSpan || 1) &&
          c >= w.position.column && c < w.position.column + (w.position.colSpan || 1)
        );
        if (occupied) return false;
      }
    }
    return true;
  }
}

/**
 * Report Generator
 */
export class ReportGenerator {
  private widgets: AnalyticsWidget[] = [];

  /**
   * Set widgets for report generation
   */
  setWidgets(widgets: AnalyticsWidget[]): void {
    this.widgets = widgets;
  }

  /**
   * Generate PDF report
   */
  async generatePDFReport(config: {
    title: string;
    timeRange: { start: Date; end: Date };
    widgets: AnalyticsWidget[];
    includeData: boolean;
  }): Promise<Blob> {
    // In production, would use PDF generation library
    // For now, return placeholder
    const reportData = {
      title: config.title,
      generatedAt: new Date(),
      timeRange: config.timeRange,
      widgets: config.widgets,
      data: config.includeData ? {} : null
    };

    return new Blob([JSON.stringify(reportData)], { type: 'application/pdf' });
  }

  /**
   * Schedule recurring report
   */
  scheduleReport(config: {
    name: string;
    recipients: string[];
    schedule: 'daily' | 'weekly' | 'monthly';
    widgets: AnalyticsWidget[];
    format: 'pdf' | 'html' | 'csv';
  }): string {
    // In production, would integrate with scheduling system
    const reportId = `report-${Date.now()}`;

    console.log(`Scheduled report: ${config.name} (${config.schedule})`);

    return reportId;
  }

  /**
   * Export dashboard
   */
  exportDashboard(format: 'json' | 'pdf' | 'png', widgets?: AnalyticsWidget[]): string {
    const dashboard = {
      widgets: widgets || this.widgets,
      exportedAt: new Date()
    };

    return JSON.stringify(dashboard);
  }
}

/**
 * Advanced Analytics Dashboard Manager
 */
export class AnalyticsDashboardManager {
  private collector: MetricsCollector;
  private predictiveEngine: PredictiveAnalyticsEngine;
  private dashboardBuilder: DashboardBuilder;
  private reportGenerator: ReportGenerator;

  constructor() {
    this.collector = new MetricsCollector();
    this.predictiveEngine = new PredictiveAnalyticsEngine();
    this.dashboardBuilder = new DashboardBuilder();
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Get metrics collector
   */
  getCollector(): MetricsCollector {
    return this.collector;
  }

  /**
   * Get predictive engine
   */
  getPredictiveEngine(): PredictiveAnalyticsEngine {
    return this.predictiveEngine;
  }

  /**
   * Get dashboard builder
   */
  getDashboardBuilder(): DashboardBuilder {
    return this.dashboardBuilder;
  }

  /**
   * Get report generator
   */
  getReportGenerator(): ReportGenerator {
    return this.reportGenerator;
  }
}
