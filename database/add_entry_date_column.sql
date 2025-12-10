-- Add ENTRY_DATE column to existing Mela_SIM_sell_crm_cnl_T table
-- Execute this script to update the table structure

-- Add the ENTRY_DATE column
ALTER TABLE Mela_SIM_sell_crm_cnl_T 
ADD ENTRY_DATE DATE;

-- Add comment to describe the column
COMMENT ON COLUMN Mela_SIM_sell_crm_cnl_T.ENTRY_DATE IS 'Date of entry in YYYY-MM-DD format';

-- Create index on ENTRY_DATE for better query performance
CREATE INDEX idx_mela_sim_entry_date ON Mela_SIM_sell_crm_cnl_T(ENTRY_DATE);

-- Display success message
SELECT 'ENTRY_DATE column added successfully!' AS STATUS FROM DUAL;
