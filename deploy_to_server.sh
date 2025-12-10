#!/bin/bash

# ===============================================================
# Deployment Script for Mela SIM Sell Portal on dwhnode02
# Server: 192.168.61.203
# User: dwhadmin
# Database: dwhdb02
# ===============================================================

echo "======================================"
echo "Mela SIM Sell Portal - Server Deployment"
echo "======================================"
echo ""

# Oracle Environment Variables
PATH=$PATH:$HOME/.local/bin:$HOME/bin
export PATH
export TMP=/tmp
export TMPDIR=$TMP
export ORACLE_HOSTNAME=dwhnode02
export ORACLE_UNQNAME=dwhdb02
export ORACLE_BASE=/data01/app/oracle
export ORACLE_HOME=$ORACLE_BASE/product/19.0.0/dbhome_1
export ORA_INVENTORY=/data01/app/oraInventory
export ORACLE_SID=dwhdb02
export DATA_DIR=/data01/oradata
export PATH=/usr/sbin:/usr/local/bin:$PATH
export PATH=$ORACLE_HOME/bin:$PATH
export LD_LIBRARY_PATH=$ORACLE_HOME/lib:/lib:/usr/lib
export CLASSPATH=$ORACLE_HOME/jlib:$ORACLE_HOME/rdbms/jlib

# Database credentials
USERNAME="dwh_user"
PASSWORD="dwh_user_123"

# Log setup
LOGDIR="/home/dwhadmin/mela_sim_portal/logs"
LOGFILE="$LOGDIR/deployment.log"
TIMESTAMP=$(date '+%F %T')

mkdir -p "$LOGDIR"
touch "$LOGFILE"

echo "$TIMESTAMP | INFO | Starting Mela SIM Sell Portal deployment..." | tee -a "$LOGFILE"

# Create table
echo "$TIMESTAMP | INFO | Creating Mela_SIM_sell_crm_cnl_T table..." | tee -a "$LOGFILE"

sqlplus -s <<EOF | tee -a "$LOGFILE"
${USERNAME}/${PASSWORD}
SET echo on
SET feedback on
WHENEVER SQLERROR EXIT SQL.SQLCODE

-- Drop table if exists (for redeployment)
-- DROP TABLE Mela_SIM_sell_crm_cnl_T CASCADE CONSTRAINTS;

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
CREATE INDEX idx_msisdn ON Mela_SIM_sell_crm_cnl_T(MSISDN);

COMMIT;

-- Display table structure
DESC Mela_SIM_sell_crm_cnl_T;

-- Show row count
SELECT COUNT(*) as TOTAL_ROWS FROM Mela_SIM_sell_crm_cnl_T;

EXIT;
EOF

STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "$TIMESTAMP | SUCCESS | Table Mela_SIM_sell_crm_cnl_T created successfully." | tee -a "$LOGFILE"
  echo "======================================"
  echo "Deployment completed successfully!"
  echo "======================================"
else
  echo "$TIMESTAMP | ERROR $STATUS | Failed to create table." | tee -a "$LOGFILE"
  echo "======================================"
  echo "Deployment failed! Check logs at $LOGFILE"
  echo "======================================"
fi

exit $STATUS
