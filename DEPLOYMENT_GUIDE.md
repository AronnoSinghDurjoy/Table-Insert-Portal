# ===============================================================
# Step-by-Step Deployment Guide for Mela SIM Sell Portal
# Server: 192.168.61.203 (dwhnode02)
# User: dwhadmin
# Password: dwhadmin
# ===============================================================

## Step 1: Connect to Server

From your local machine (Windows PowerShell):

```powershell
ssh dwhadmin@192.168.61.203
# Password: dwhadmin
```

## Step 2: Create Application Directory

```bash
mkdir -p /home/dwhadmin/mela_sim_portal
cd /home/dwhadmin/mela_sim_portal
mkdir -p logs static database
```

## Step 3: Upload Files to Server

From your local machine (in a new PowerShell window):

```powershell
# Navigate to your project directory
cd "G:\Projects for Git\Table Insert Portal"

# Upload files using SCP
scp app.py dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/
scp config.py dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/
scp requirements.txt dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/
scp reference_data.json dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/
scp deploy_to_server.sh dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/

# Upload static files
scp static/index.html dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/static/
scp static/styles.css dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/static/
scp static/script.js dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/static/
scp static/teletalk-logo.png dwhadmin@192.168.61.203:/home/dwhadmin/mela_sim_portal/static/
```

## Step 4: Create Database Table

Back on the server (SSH session):

```bash
cd /home/dwhadmin/mela_sim_portal
chmod +x deploy_to_server.sh
./deploy_to_server.sh
```

OR manually create table:

```bash
sqlplus -s <<EOF
dwh_user/dwh_user_123
SET echo on
SET feedback on

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

CREATE INDEX idx_zone ON Mela_SIM_sell_crm_cnl_T(ZONE);
CREATE INDEX idx_field_officer ON Mela_SIM_sell_crm_cnl_T(FIELD_OFFICER);
CREATE INDEX idx_created_date ON Mela_SIM_sell_crm_cnl_T(CREATED_DATE);

COMMIT;
DESC Mela_SIM_sell_crm_cnl_T;
EXIT;
EOF
```

## Step 5: Install Python Dependencies

```bash
cd /home/dwhadmin/mela_sim_portal

# Install Python packages (same as Call Drop Report Portal)
pip3 install --user flask flask-cors oracledb

# OR if pip3 doesn't work
python3 -m pip install --user flask flask-cors oracledb
```

## Step 6: Test the Application

```bash
# Test database connection (same method as Call Drop Report Portal)
python3 <<EOF
import oracledb
try:
    dsn = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.61.203)(PORT=1521))(CONNECT_DATA=(SID=dwhdb02)))"
    conn = oracledb.connect(user='dwh_user', password='dwh_user_123', dsn=dsn)
    print("✓ Database connection successful!")
    conn.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")
EOF

# Start the application in test mode
python3 app.py
```

You should see:
```
Starting Mela SIM Sell Portal - Oracle Database Mode
 * Running on http://0.0.0.0:5000
```

Test from your browser: http://192.168.61.203:5000

Press Ctrl+C to stop.

## Step 7: Create Systemd Service (Production)

Create service file:

```bash
sudo nano /etc/systemd/system/mela-sim-portal.service
```

Add this content:

```ini
[Unit]
Description=Mela SIM Sell Portal
After=network.target

[Service]
Type=simple
User=dwhadmin
WorkingDirectory=/home/dwhadmin/mela_sim_portal
Environment="PATH=/data01/app/oracle/product/19.0.0/dbhome_1/bin:/usr/local/bin:/usr/bin"
Environment="ORACLE_HOME=/data01/app/oracle/product/19.0.0/dbhome_1"
Environment="LD_LIBRARY_PATH=/data01/app/oracle/product/19.0.0/dbhome_1/lib"
Environment="ORACLE_SID=dwhdb02"
ExecStart=/usr/bin/python3 /home/dwhadmin/mela_sim_portal/app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mela-sim-portal
sudo systemctl start mela-sim-portal
sudo systemctl status mela-sim-portal
```

## Step 8: Check Logs

```bash
# Application logs
tail -f /home/dwhadmin/mela_sim_portal/logs/api.log

# Deployment logs
tail -f /home/dwhadmin/mela_sim_portal/logs/deployment.log

# System service logs
sudo journalctl -u mela-sim-portal -f
```

## Step 9: Test Insert Data

From your browser or using curl:

```bash
curl -X POST http://192.168.61.203:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "zone": "Khulna",
    "field_officer": "Md. Saiful Islam",
    "btsid": "BOG0082",
    "msisdn": "1712345678",
    "new_sim": "YES",
    "replace": "NO",
    "new_retailer_count": 5
  }'
```

## Step 10: Verify Data in Database

```bash
sqlplus -s <<EOF
dwh_user/dwh_user_123
SET pagesize 100
SET linesize 200
SELECT * FROM Mela_SIM_sell_crm_cnl_T ORDER BY CREATED_DATE DESC;
EXIT;
EOF
```

## Troubleshooting

### If port 5000 is in use:
```bash
# Find process using port 5000
sudo netstat -tlnp | grep 5000
# Kill the process
sudo kill -9 <PID>
```

### If Oracle connection fails:
```bash
# Check tnsnames.ora
cat $ORACLE_HOME/network/admin/tnsnames.ora | grep -A 5 dwhdb02

# Test with sqlplus
sqlplus dwh_user/dwh_user_123@dwhdb02
```

### If Python modules not found:
```bash
# Check installed packages
pip3 list | grep -i flask
pip3 list | grep -i oracledb

# Reinstall if needed
pip3 install --user --force-reinstall flask flask-cors oracledb
```

## Access the Portal

Once deployed, access the portal at:
- From server: http://localhost:5000
- From your network: http://192.168.61.203:5000

## Stopping the Service

```bash
sudo systemctl stop mela-sim-portal
```

## Updating the Application

```bash
# Stop service
sudo systemctl stop mela-sim-portal

# Upload new files via SCP
# ... (same as Step 3)

# Restart service
sudo systemctl start mela-sim-portal
```
