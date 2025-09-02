-- Initialize additional databases for testing
CREATE DATABASE muditor_test OWNER muditor;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE muditor_dev TO muditor;
GRANT ALL PRIVILEGES ON DATABASE muditor_test TO muditor;