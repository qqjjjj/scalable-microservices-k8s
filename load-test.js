// Simple load test using autocannon via npx
const { spawn } = require("child_process");

// Simple UUID generator
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const url = process.env.TASK_SERVICE_URL || "http://192.168.0.119/tasks";
const payload = JSON.stringify({
  title: `Load Test Task ${Math.random().toString(36).substring(7)}`,
  description: `Load test task created at ${new Date().toISOString()}`,
  userId: uuidv4(),
});

console.log(`🚀 Load testing: ${url}`);
console.log("📊 Creating tasks → RabbitMQ → Notifications");

const connections = process.env.CONNECTIONS || "500";
const duration = process.env.DURATION || "120";

console.log(`⚡ ${connections} connections for ${duration} seconds`);

const autocannon = spawn(
  "npx",
  [
    "autocannon",
    "-c",
    connections,
    "-d",
    duration,
    "-m",
    "POST", // POST method
    "-H",
    "Content-Type=application/json",
    "-b",
    payload,
    url,
  ],
  { stdio: "inherit" }
);

autocannon.on("close", (code) => {
  if (code === 0) {
    console.log("\n✅ Load test completed!");
  } else {
    console.log(`\n❌ Load test failed with code ${code}`);
  }
});
