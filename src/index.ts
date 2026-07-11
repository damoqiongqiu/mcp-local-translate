#!/usr/bin/env node

// Entry point for mcp-local-translate MCP server.

import { startServer } from './server-main.js'

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

startServer()
