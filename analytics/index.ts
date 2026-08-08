/**
 * Spreadsheet Moment - Advanced Analytics Module
 * Round 13: Comprehensive analytics and monitoring
 */

// Main classes
export {
  MetricsCollector,
  PredictiveAnalyticsEngine,
  DashboardBuilder,
  ReportGenerator,
  AnalyticsDashboardManager
} from './AdvancedAnalyticsDashboard.js';

// Interfaces/Types
export type {
  MetricData,
  AnalyticsWidget,
  DataSource,
  WidgetConfig,
  AnomalyAlert,
  ForecastResult
} from './AdvancedAnalyticsDashboard.js';

// API Handlers
export {
  AnalyticsApiHandler,
  createAnalyticsApiHandler,
  AnalyticsRouteHandlers,
  type ApiResponse,
  type MetricRequest,
  type TimeSeriesRequest,
  type ForecastRequest,
  type DashboardWidgetRequest,
  type AlertRuleRequest
} from './api.js';

// Examples
export {
  example1_BasicMetrics,
  example2_PredictiveAnalytics,
  example3_DashboardBuilding,
  example4_AlertRules,
  example5_ReportGeneration,
  example6_AnalyticsManager,
  example7_ApiHandler,
  example8_CompleteWorkflow,
  runAllExamples
} from './examples.js';
