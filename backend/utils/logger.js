const fs = require('fs');
const path = require('path');

class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...(data && { data })
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(filename, content) {
    const filepath = path.join(this.logDir, filename);
    fs.appendFileSync(filepath, content + '\n');
  }

  info(message, data = null) {
    const logEntry = this.formatMessage('INFO', message, data);
    console.log(`ℹ️ ${message}`);
    this.writeToFile('info.log', logEntry);
  }

  error(message, error = null) {
    const logEntry = this.formatMessage('ERROR', message, {
      error: error?.message,
      stack: error?.stack
    });
    console.error(`❌ ${message}`, error);
    this.writeToFile('error.log', logEntry);
  }

  warn(message, data = null) {
    const logEntry = this.formatMessage('WARN', message, data);
    console.warn(`⚠️ ${message}`);
    this.writeToFile('warn.log', logEntry);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      const logEntry = this.formatMessage('DEBUG', message, data);
      console.debug(`🐛 ${message}`);
      this.writeToFile('debug.log', logEntry);
    }
  }

  // API request logging
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };
      
      if (res.statusCode >= 400) {
        this.error(`API Request Failed: ${req.method} ${req.originalUrl}`, logData);
      } else {
        this.info(`API Request: ${req.method} ${req.originalUrl}`, logData);
      }
    });
    
    next();
  }

  // Database operation logging
  logDbOperation(operation, collection, duration, success = true) {
    const message = `DB ${operation} on ${collection}`;
    const data = {
      operation,
      collection,
      duration: `${duration}ms`,
      success
    };
    
    if (success) {
      this.info(message, data);
    } else {
      this.error(message, data);
    }
  }

  // Authentication logging
  logAuth(action, userId = null, success = true) {
    const message = `Auth ${action}`;
    const data = {
      action,
      userId,
      success,
      timestamp: this.getTimestamp()
    };
    
    if (success) {
      this.info(message, data);
    } else {
      this.warn(message, data);
    }
  }
}

module.exports = new Logger(); 