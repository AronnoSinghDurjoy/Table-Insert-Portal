#!/bin/bash

# ===============================================================
# Script to deploy Mela_SIM_sell_crm_cnl_T table
# Developed for: Teletalk Mela SIM Sell CRM Portal
# ===============================================================

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
DATABASE="dwhdb02"

# Log setup
LOGDIR="/home/dwhadmin/mela_sim_portal/logs"
LOGFILE="$LOGDIR/table_deployment.log"
TIMESTAMP=$(date '+%F %T')

mkdir -p "$LOGDIR"
touch "$LOGFILE"

echo "$TIMESTAMP | INFO | Starting table deployment..." | tee -a "$LOGFILE"

# Execute SQL script
sqlplus -s ${USERNAME}/${PASSWORD}@${DATABASE} <<EOF | tee -a "$LOGFILE"
SET echo on
SET feedback on
@/path/to/create_table.sql
EXIT
EOF

STATUS=$?

if [ $STATUS -eq 0 ]; then
  echo "$TIMESTAMP | SUCCESS | Table Mela_SIM_sell_crm_cnl_T created successfully." | tee -a "$LOGFILE"
else
  echo "$TIMESTAMP | ERROR $STATUS | Failed to create table." | tee -a "$LOGFILE"
fi

exit $STATUS
