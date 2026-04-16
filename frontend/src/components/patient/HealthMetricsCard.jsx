import "./HealthMetricsCard.css";

function HealthMetricsCard({ title, value, unit, icon, trend, status = "normal" }) {
  const getStatusClass = (status) => {
    switch (status) {
      case "good":
        return "status-good";
      case "warning":
        return "status-warning";
      case "critical":
        return "status-critical";
      default:
        return "status-normal";
    }
  };

  return (
    <div className={`health-metrics-card ${getStatusClass(status)}`}>
      <div className="metrics-header">
        <h4 className="metrics-title">{title}</h4>
        <span className="metrics-icon">{icon}</span>
      </div>

      <div className="metrics-content">
        <div className="metrics-value">
          <span className="value-number">{value}</span>
          {unit && <span className="value-unit">{unit}</span>}
        </div>

        {trend && (
          <div className={`metrics-trend ${trend.direction}`}>
            <span className="trend-icon">
              {trend.direction === "up" ? "📈" : "📉"}
            </span>
            <span className="trend-text">
              {Math.abs(trend.value)}% {trend.direction === "up" ? "up" : "down"}
            </span>
          </div>
        )}
      </div>

      <div className="metrics-footer">
        <span className="metrics-status">{status.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default HealthMetricsCard;
