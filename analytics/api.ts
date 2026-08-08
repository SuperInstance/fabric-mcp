/**
 * Spreadsheet Moment - Advanced Analytics API Handlers
 * Round 13: API endpoints for analytics dashboard
 */

import type {
  MetricData,
  AnalyticsWidget,
  ForecastResult,
  AnomalyAlert
} from './AdvancedAnalyticsDashboard';
import {
  MetricsCollector,
  PredictiveAnalyticsEngine,
  DashboardBuilder,
  ReportGenerator,
  AnalyticsDashboardManager
} from './AdvancedAnalyticsDashboard';

/**
 * API request/response types
 */
export interface MetricRequest {
  metricId: string;
  value: number;
  timestamp?: Date;
}

export interface TimeSeriesRequest {
  metricId: string;
  startTime: Date;
  endTime: Date;
  granularity?: string;
}

export interface ForecastRequest {
  metricId: string;
  horizon: number;
}

export interface DashboardWidgetRequest {
  type: 'line-chart' | 'bar-chart' | 'pie-chart' | 'metric-card' | 'table' | 'heatmap' | 'gauge' | 'funnel';
  title: string;
  position: { row: number; column: number; rowSpan?: number; colSpan?: number };
  config?: Record<string, unknown>;
}

export interface AlertRuleRequest {
  metricId: string;
  condition: string;
  threshold?: number;
  severity?: 'info' | 'warning' | 'critical';
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Analytics API Handler class
 */
export class AnalyticsApiHandler {
  private manager: AnalyticsDashboardManager;
  private collector: MetricsCollector;
  private predictiveEngine: PredictiveAnalyticsEngine;
  private dashboardBuilder: DashboardBuilder;
  private reportGenerator: ReportGenerator;

  constructor() {
    this.manager = new AnalyticsDashboardManager();
    this.collector = this.manager.getCollector();
    this.predictiveEngine = this.manager.getPredictiveEngine();
    this.dashboardBuilder = this.manager.getDashboardBuilder();
    this.reportGenerator = this.manager.getReportGenerator();
  }

  /**
   * Record a metric value
   * POST /api/analytics/metrics
   */
  async recordMetric(request: MetricRequest): Promise<ApiResponse<MetricData>> {
    try {
      const timestamp = request.timestamp || new Date();
      this.collector.recordMetric(request.metricId, request.value, timestamp);

      const latestData = this.collector.getLatestData(request.metricId);

      return {
        success: true,
        data: latestData,
        message: 'Metric recorded successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get time series data for a metric
   * GET /api/analytics/metrics/:metricId/timeseries
   */
  async getTimeSeries(request: TimeSeriesRequest): Promise<ApiResponse<MetricData[]>> {
    try {
      const data = this.collector.getTimeSeries(
        request.metricId,
        request.startTime,
        request.endTime,
        request.granularity
      );

      return {
        success: true,
        data,
        message: `Retrieved ${data.length} data points`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get latest metric value
   * GET /api/analytics/metrics/:metricId/latest
   */
  async getLatestMetric(metricId: string): Promise<ApiResponse<MetricData | undefined>> {
    try {
      const data = this.collector.getLatestData(metricId);

      if (!data) {
        return {
          success: false,
          error: 'No data found for metric'
        };
      }

      return {
        success: true,
        data,
        message: 'Latest metric retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get aggregated metrics
   * POST /api/analytics/metrics/aggregate
   */
  async getAggregatedMetrics(
    metricIds: string[],
    aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'
  ): Promise<ApiResponse<Map<string, number>>> {
    try {
      const data = this.collector.getAggregatedMetrics(metricIds, aggregation);

      return {
        success: true,
        data,
        message: `Aggregated ${data.size} metrics`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate forecast for a metric
   * POST /api/analytics/forecast
   */
  async generateForecast(request: ForecastRequest): Promise<ApiResponse<ForecastResult>> {
    try {
      const forecast = await this.predictiveEngine.forecast(
        request.metricId,
        request.horizon
      );

      return {
        success: true,
        data: forecast,
        message: `Generated ${request.horizon} period forecast`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Detect anomalies in metric data
   * POST /api/analytics/anomalies
   */
  async detectAnomalies(
    metricId: string,
    sensitivity?: number
  ): Promise<ApiResponse<AnomalyAlert[]>> {
    try {
      // Get historical data for the metric
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days

      const data = this.collector.getTimeSeries(metricId, startTime, endTime);

      if (data.length === 0) {
        return {
          success: false,
          error: 'No data available for anomaly detection'
        };
      }

      const anomalies = await this.predictiveEngine.detectAnomalies(
        metricId,
        data,
        sensitivity
      );

      return {
        success: true,
        data: anomalies,
        message: `Detected ${anomalies.length} anomalies`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze trend for a metric
   * GET /api/analytics/metrics/:metricId/trend
   */
  async analyzeTrend(metricId: string): Promise<ApiResponse<{
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    seasonality: boolean;
    changepoints: number[];
  }>> {
    try {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days

      const data = this.collector.getTimeSeries(metricId, startTime, endTime);

      if (data.length === 0) {
        return {
          success: false,
          error: 'No data available for trend analysis'
        };
      }

      const trend = this.predictiveEngine.analyzeTrend(metricId, data);

      return {
        success: true,
        data: trend,
        message: 'Trend analysis completed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create dashboard widget
   * POST /api/analytics/dashboard/widgets
   */
  async createWidget(request: DashboardWidgetRequest): Promise<ApiResponse<{ widgetId: string }>> {
    try {
      let widgetId: string;

      switch (request.type) {
        case 'metric-card':
          widgetId = this.dashboardBuilder.addMetricCard({
            title: request.title,
            metricId: request.config?.metricId as string,
            position: request.position,
            showTrend: request.config?.showTrend as boolean,
            showSparkline: request.config?.showSparkline as boolean,
            thresholds: request.config?.thresholds as any
          });
          break;

        case 'line-chart':
          widgetId = this.dashboardBuilder.addLineChart({
            title: request.title,
            metricIds: request.config?.metricIds as string[],
            position: request.position,
            timeRange: request.config?.timeRange as { start: Date; end: Date },
            colorScheme: request.config?.colorScheme as string[],
            showLegend: request.config?.showLegend as boolean
          });
          break;

        case 'heatmap':
          widgetId = this.dashboardBuilder.addHeatmap({
            title: request.title,
            spreadsheetId: request.config?.spreadsheetId as string,
            range: request.config?.range as string,
            position: request.position,
            colorScale: request.config?.colorScale as { min: string; max: string }
          });
          break;

        case 'gauge':
          widgetId = this.dashboardBuilder.addGauge({
            title: request.title,
            metricId: request.config?.metricId as string,
            min: request.config?.min as number,
            max: request.config?.max as number,
            position: request.position,
            thresholds: request.config?.thresholds as any[]
          });
          break;

        case 'funnel':
          widgetId = this.dashboardBuilder.addFunnel({
            title: request.title,
            stages: request.config?.stages as Array<{ name: string; value: number }>,
            position: request.position
          });
          break;

        default:
          return {
            success: false,
            error: `Unsupported widget type: ${request.type}`
          };
      }

      return {
        success: true,
        data: { widgetId },
        message: 'Widget created successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get dashboard layout
   * GET /api/analytics/dashboard/layout
   */
  async getDashboardLayout(): Promise<ApiResponse<AnalyticsWidget[]>> {
    try {
      const widgets = this.dashboardBuilder.getDashboardLayout();

      return {
        success: true,
        data: widgets,
        message: `Retrieved ${widgets.length} widgets`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Remove dashboard widget
   * DELETE /api/analytics/dashboard/widgets/:widgetId
   */
  async removeWidget(widgetId: string): Promise<ApiResponse<void>> {
    try {
      this.dashboardBuilder.removeWidget(widgetId);

      return {
        success: true,
        message: 'Widget removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Auto-arrange dashboard widgets
   * POST /api/analytics/dashboard/auto-arrange
   */
  async autoArrangeDashboard(
    rows: number,
    columns: number
  ): Promise<ApiResponse<void>> {
    try {
      this.dashboardBuilder.autoArrange(rows, columns);

      return {
        success: true,
        message: `Dashboard arranged in ${rows}x${columns} grid`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate PDF report
   * POST /api/analytics/reports/generate
   */
  async generateReport(config: {
    title: string;
    timeRange: { start: Date; end: Date };
    includeData: boolean;
  }): Promise<ApiResponse<Blob>> {
    try {
      const widgets = this.dashboardBuilder.getDashboardLayout();

      const report = await this.reportGenerator.generatePDFReport({
        ...config,
        widgets
      });

      return {
        success: true,
        data: report,
        message: 'Report generated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Schedule recurring report
   * POST /api/analytics/reports/schedule
   */
  async scheduleReport(config: {
    name: string;
    recipients: string[];
    schedule: 'daily' | 'weekly' | 'monthly';
    format: 'pdf' | 'html' | 'csv';
  }): Promise<ApiResponse<{ reportId: string }>> {
    try {
      const widgets = this.dashboardBuilder.getDashboardLayout();

      const reportId = this.reportGenerator.scheduleReport({
        ...config,
        widgets
      });

      return {
        success: true,
        data: { reportId },
        message: 'Report scheduled successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export dashboard
   * GET /api/analytics/dashboard/export
   */
  async exportDashboard(format: 'json' | 'pdf' | 'png'): Promise<ApiResponse<string>> {
    try {
      const exported = this.reportGenerator.exportDashboard(format);

      return {
        success: true,
        data: exported,
        message: `Dashboard exported as ${format}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add alert rule
   * POST /api/analytics/alerts/rules
   */
  async addAlertRule(request: AlertRuleRequest): Promise<ApiResponse<void>> {
    try {
      const rule = {
        metricId: request.metricId,
        condition: (metric: MetricData) => {
          const deviation = Math.abs((metric.value - (request.threshold || 0)) / (request.threshold || 1));
          if (deviation > 2) {
            return {
              id: `alert-${Date.now()}`,
              severity: request.severity || 'warning',
              metric: request.metricId,
              currentValue: metric.value,
              expectedRange: { min: request.threshold || 0, max: request.threshold || 0 },
              deviation,
              timestamp: new Date(),
              description: `Metric ${request.metricId} exceeded threshold`,
              suggestedAction: 'Review metric data'
            };
          }
          return null;
        }
      };

      this.collector.addAlertRule(rule as any);

      return {
        success: true,
        message: 'Alert rule added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

/**
 * Factory function to create API handler
 */
export function createAnalyticsApiHandler(): AnalyticsApiHandler {
  return new AnalyticsApiHandler();
}

/**
 * Express/Hono route handler helpers
 */
export class AnalyticsRouteHandlers {
  private api: AnalyticsApiHandler;

  constructor() {
    this.api = new AnalyticsApiHandler();
  }

  /**
   * POST /api/analytics/metrics
   */
  recordMetric = async (req: { body: MetricRequest }) => {
    return await this.api.recordMetric(req.body);
  };

  /**
   * GET /api/analytics/metrics/:metricId/latest
   */
  getLatestMetric = async (req: { params: { metricId: string } }) => {
    return await this.api.getLatestMetric(req.params.metricId);
  };

  /**
   * GET /api/analytics/metrics/:metricId/timeseries
   */
  getTimeSeries = async (req: {
    params: { metricId: string };
    query: { start: string; end: string; granularity?: string };
  }) => {
    return await this.api.getTimeSeries({
      metricId: req.params.metricId,
      startTime: new Date(req.query.start),
      endTime: new Date(req.query.end),
      granularity: req.query.granularity
    });
  };

  /**
   * POST /api/analytics/forecast
   */
  generateForecast = async (req: { body: ForecastRequest }) => {
    return await this.api.generateForecast(req.body);
  };

  /**
   * POST /api/analytics/anomalies
   */
  detectAnomalies = async (req: {
    body: { metricId: string; sensitivity?: number };
  }) => {
    return await this.api.detectAnomalies(req.body.metricId, req.body.sensitivity);
  };

  /**
   * GET /api/analytics/dashboard/layout
   */
  getDashboardLayout = async () => {
    return await this.api.getDashboardLayout();
  };

  /**
   * POST /api/analytics/dashboard/widgets
   */
  createWidget = async (req: { body: DashboardWidgetRequest }) => {
    return await this.api.createWidget(req.body);
  };

  /**
   * DELETE /api/analytics/dashboard/widgets/:widgetId
   */
  removeWidget = async (req: { params: { widgetId: string } }) => {
    return await this.api.removeWidget(req.params.widgetId);
  };
}

export default AnalyticsApiHandler;
