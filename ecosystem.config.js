module.exports = {
  apps: [
    {
      name: "chakra",
      // Must be a Node script PM2 can fork directly. With "npm start", npm
      // spawns next as a child and exits — PM2 reads that as the app
      // stopping and restarts it, forever, with no error output.
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/var/www/chakra/app",
      instances: 2,
      exec_mode: "cluster",
      env: { NODE_ENV: "production", PORT: 3000 },
      max_memory_restart: "1G",
      error_file: "/var/log/chakra/error.log",
      out_file: "/var/log/chakra/out.log",
      time: true,
    },
  ],
};
