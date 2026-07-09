const AuditLog = require("../models/AuditLog");

const logAction = async ({ actorId, actorName, action, entity, entityId, metadata }) => {
  try {
    await AuditLog.create({
      actorId,
      actorName: actorName || "System",
      action,
      entity,
      entityId,
      metadata,
    });
  } catch (error) {
    console.error("❌ Failed to write audit log:", error.message);
  }
};

module.exports = { logAction };
