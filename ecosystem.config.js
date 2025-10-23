module.exports = {
  apps: [{
    name: "whatsapp-baileys",
    script: "./start.sh",
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    max_restarts: 5,
    watch: false,
    env: {
      NODE_ENV: "development"
    }
  }]
};