module.exports = {
    apps: [
      {
        name: "oracle-backend",
        script: "ts-node",
        args: "--transpile-only /home/azureuser/API-2023.2-Back-End/src/index.ts --env /home/azureuser/API-2023.2-Back-End/.env",
        cwd: "/home/azureuser/API-2023.2-Back-End/",
        instances: 1,
        autorestart: true,
        watch: true,
        max_memory_restart: "1G",
        output: "/dev/null",
        error: "/dev/null", 
      },
    ],
  };