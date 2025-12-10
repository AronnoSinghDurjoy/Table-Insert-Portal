"""
Configuration file for Mela SIM Sell Portal
Database and application settings
"""

import os

# Database Configuration
DB_CONFIG = {
    'user': os.getenv('DB_USER', 'dwh_user'),
    'password': os.getenv('DB_PASSWORD', 'dwh_user_123'),
    'dsn': os.getenv('DB_DSN', 'dwhdb02'),
    'encoding': 'UTF-8'
}

# Oracle Client Library Path (if needed)
# Uncomment and set the path if Oracle Instant Client is not in system PATH
# ORACLE_CLIENT_LIB = '/path/to/instantclient_19_x'

# Application Configuration
APP_CONFIG = {
    'host': '0.0.0.0',
    'port': 5000,
    'debug': False  # Set to False in production
}

# Logging Configuration
LOG_CONFIG = {
    'level': 'INFO',
    'format': '%(asctime)s | %(levelname)s | %(message)s',
    'log_dir': 'logs',
    'log_file': 'api.log'
}

# CORS Configuration
CORS_CONFIG = {
    'origins': '*',  # In production, specify allowed origins
    'methods': ['GET', 'POST', 'OPTIONS'],
    'allow_headers': ['Content-Type']
}
