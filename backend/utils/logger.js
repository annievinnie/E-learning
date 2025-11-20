import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get today's date in YYYY-MM-DD format
const getLogFileName = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}.log`;
};

// Get full log file path
const getLogFilePath = () => {
  return path.join(logsDir, getLogFileName());
};

// Format timestamp for log entries
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

// Store original console for fallback
let originalConsoleError = null;

// Write to log file
const writeToFile = (level, message, ...args) => {
  try {
    const logFilePath = getLogFilePath();
    const timestamp = getTimestamp();
    const formattedMessage = args.length > 0 
      ? `${timestamp} [${level}] ${message} ${args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')}\n`
      : `${timestamp} [${level}] ${message}\n`;
    
    fs.appendFileSync(logFilePath, formattedMessage, 'utf8');
  } catch (error) {
    // Fallback to original console if file write fails (avoid circular reference)
    if (originalConsoleError) {
      originalConsoleError('Failed to write to log file:', error);
    } else {
      // If original console not stored yet, use process.stderr
      process.stderr.write(`Failed to write to log file: ${error.message}\n`);
    }
  }
};

// Logger object to replace console methods
const logger = {
  log: (message, ...args) => {
    writeToFile('INFO', message, ...args);
    // Only show important logs in console (startup messages, errors)
    if (message.includes('✅') || message.includes('❌') || message.includes('Server running')) {
      console.log(message, ...args);
    }
  },
  
  info: (message, ...args) => {
    writeToFile('INFO', message, ...args);
    if (message.includes('✅') || message.includes('Server running')) {
      console.log(message, ...args);
    }
  },
  
  error: (message, ...args) => {
    writeToFile('ERROR', message, ...args);
    // Always show errors in console
    console.error(message, ...args);
  },
  
  warn: (message, ...args) => {
    writeToFile('WARN', message, ...args);
    // Show warnings in console
    console.warn(message, ...args);
  },
  
  debug: (message, ...args) => {
    writeToFile('DEBUG', message, ...args);
    // Don't show debug in console
  }
};

// Override console methods globally
export const setupFileLogging = () => {
  // Store original console methods BEFORE overriding
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
  };
  
  // Store for writeToFile fallback
  originalConsoleError = originalConsole.error;

  // Helper to format message
  const formatMessage = (args) => {
    return args.map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
  };

  // Override console.log
  console.log = (...args) => {
    const message = formatMessage(args);
    writeToFile('INFO', message);
    // Only show important startup messages in console
    const msg = message.toLowerCase();
    if (msg.includes('✅') || msg.includes('❌') || msg.includes('server running') || 
        msg.includes('mongodb connected') || msg.includes('checking environment')) {
      originalConsole.log(...args);
    }
  };

  // Override console.error
  console.error = (...args) => {
    const message = formatMessage(args);
    writeToFile('ERROR', message);
    // Always show errors in console
    originalConsole.error(...args);
  };

  // Override console.warn
  console.warn = (...args) => {
    const message = formatMessage(args);
    writeToFile('WARN', message);
    // Show warnings in console
    originalConsole.warn(...args);
  };

  // Override console.info
  console.info = (...args) => {
    const message = formatMessage(args);
    writeToFile('INFO', message);
    // Only show important info
    const msg = message.toLowerCase();
    if (msg.includes('✅') || msg.includes('server running')) {
      originalConsole.info(...args);
    }
  };

  // Override console.debug (if it exists)
  if (console.debug) {
    console.debug = (...args) => {
      const message = formatMessage(args);
      writeToFile('DEBUG', message);
      // Don't show debug in console
    };
  }

  // Log that file logging is enabled
  originalConsole.log('📝 File logging enabled. Logs are being saved to:', logsDir);
};

export default logger;

