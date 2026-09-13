const { t } = require("./i18n");

function keyedError(key, vars = {}, extra = {}) {
  const err = new Error(key);
  err.vars = vars;
  Object.assign(err, extra);
  return err;
}

function resolveMessage(req, errorOrKey, fallbackKey = "errors.server") {
  if (!errorOrKey) return t(req, fallbackKey);
  if (typeof errorOrKey === "string") {
    return t(req, errorOrKey);
  }
  const raw = errorOrKey.message || fallbackKey;
  return t(req, raw, errorOrKey.vars || {});
}

function sendError(req, res, status, key, extra = {}) {
  return res.status(status).json({ message: t(req, key, extra.vars || {}), ...extra });
}

function sendCaught(req, res, error, fallbackStatus = 400) {
  const raw = error?.message || "errors.server";
  const key =
    typeof raw === "string" && (raw.startsWith("errors.") || raw.startsWith("success."))
      ? raw
      : raw;
  const status = error.status || error.statusCode || fallbackStatus;
  const payload = { message: resolveMessage(req, error, key) };
  if (error.code) payload.error = error.code;
  return res.status(status).json(payload);
}

function cookieOpts() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
}

function localizeResult(req, result) {
  if (!result || typeof result !== "object") return result;
  if (typeof result.message !== "string") return result;
  const vars = result.vars || {
    count: result.modifiedCount ?? result.deletedCount,
  };
  const { vars: _ignored, ...rest } = result;
  return { ...rest, message: t(req, result.message, vars) };
}

module.exports = {
  keyedError,
  resolveMessage,
  sendError,
  sendCaught,
  cookieOpts,
  localizeResult,
};
