const MAX_PENDING_SCANS = 20;
const SCAN_TTL_MS = 5 * 60 * 1000;

const pendingScans = [];

function removeExpired(now = Date.now()) {
  while (pendingScans.length && now - pendingScans[0].createdAt > SCAN_TTL_MS) {
    pendingScans.shift();
  }
}

function enqueueScan(qrPayload, now = Date.now()) {
  removeExpired(now);
  pendingScans.push({ qrPayload, createdAt: now });

  if (pendingScans.length > MAX_PENDING_SCANS) {
    pendingScans.splice(0, pendingScans.length - MAX_PENDING_SCANS);
  }

  return pendingScans.length;
}

function dequeueScan(now = Date.now()) {
  removeExpired(now);
  return pendingScans.shift()?.qrPayload || null;
}

function clearScans() {
  pendingScans.length = 0;
}

module.exports = { clearScans, dequeueScan, enqueueScan };
