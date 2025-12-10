-- ===============================================================
-- Table Creation Script for Mela SIM Sell Portal
-- Database: dwhdb02
-- Developed for: Teletalk Mela SIM Sell CRM Portal
-- ===============================================================

-- Drop table if exists (optional - comment out for production)
-- DROP TABLE Mela_SIM_sell_crm_cnl_T;

-- Create table for Mela SIM sell data
CREATE TABLE Mela_SIM_sell_crm_cnl_T (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ZONE VARCHAR2(100) NOT NULL,
    FIELD_OFFICER VARCHAR2(200) NOT NULL,
    BTSID VARCHAR2(100) NOT NULL,
    MSISDN VARCHAR2(10) NOT NULL,
    NEW_SIM VARCHAR2(3) NOT NULL CHECK (NEW_SIM IN ('YES', 'NO')),
    REPLACE_SIM VARCHAR2(3) NOT NULL CHECK (REPLACE_SIM IN ('YES', 'NO')),
    NEW_RETAILER_COUNT NUMBER(2) NOT NULL CHECK (NEW_RETAILER_COUNT BETWEEN 0 AND 99),
    CREATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CREATED_BY VARCHAR2(100),
    CONSTRAINT chk_msisdn_length CHECK (LENGTH(MSISDN) = 10)
);

-- Create indexes for better query performance
CREATE INDEX idx_zone ON Mela_SIM_sell_crm_cnl_T(ZONE);
CREATE INDEX idx_field_officer ON Mela_SIM_sell_crm_cnl_T(FIELD_OFFICER);
CREATE INDEX idx_created_date ON Mela_SIM_sell_crm_cnl_T(CREATED_DATE);

-- Grant permissions (adjust as needed)
GRANT SELECT, INSERT ON Mela_SIM_sell_crm_cnl_T TO dwh_user;

COMMIT;

-- Display table structure
DESC Mela_SIM_sell_crm_cnl_T;
