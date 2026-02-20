// Calculate effective start time by adding grace minutes to start time
// Example: start_time "06:00" with grace_minutes 60 = effective_start_time "07:00"
const calculateEffectiveStartTime = (startTime, graceMinutes) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + graceMinutes;

  // Handle day wrap-around
  const adjustedMinutes = totalMinutes % (24 * 60);
  const adjustedHours = Math.floor(adjustedMinutes / 60);
  const adjustedMins = adjustedMinutes % 60;

  return `${String(adjustedHours).padStart(2, "0")}:${String(adjustedMins).padStart(2, "0")}`;
};

module.exports = {
  calculateEffectiveStartTime,
};
