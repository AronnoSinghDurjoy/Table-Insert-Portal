# Bulk Upload Feature - User Guide

## Overview
The Mela SIM Sell Portal now supports bulk data upload via Excel files, along with individual manual entry.

## New Features Added

### 1. Date Entry Field
- **Format**: YYYY-MM-DD (e.g., 2025-12-09)
- **Required**: Yes
- **Location**: Between MSISDN and New SIM fields in the form

### 2. Download Excel Template
- **Button**: "📥 Download Excel Template"
- **Location**: Top of the form, in the Bulk Upload section
- **Template Includes**:
  - Pre-formatted headers with green styling
  - Column: Date (YYYY-MM-DD) - clearly marked format
  - Sample data row for reference
  - Proper column widths for easy data entry

### 3. Bulk Upload from Excel
- **Button**: "📤 Upload Excel File"
- **Supported Formats**: .xlsx, .xls
- **Validation**:
  - MSISDN must be 10 digits starting with 15
  - Date must be in YYYY-MM-DD format
  - Duplicate MSISDN checks before insertion
  - Retailer count must be 0-99
- **Features**:
  - Shows selected filename
  - Reports number of successful insertions
  - Lists any errors encountered during upload
  - Automatically refreshes the recent submissions table

### 4. Updated Table Display
- **New Column**: Date (YYYY-MM-DD)
- **Position**: Between MSISDN and New SIM columns
- **Shows**: The entry date for each record

## How to Use

### Manual Entry (Single Record)
1. Fill in all required fields including the new Date field
2. Click "Submit"
3. Record will be inserted into database

### Bulk Upload (Multiple Records)
1. Click "📥 Download Excel Template"
2. Open the downloaded Excel file
3. Fill in your data:
   - **Zone**: Select from available zones (Barisal, Bogura, Chattogram, etc.)
   - **Field Officer**: Enter field officer name
   - **BTS ID**: Enter BTS identifier
   - **MSISDN**: 10-digit number starting with 15 (e.g., 1534567890)
   - **Date (YYYY-MM-DD)**: Enter date in format 2025-12-09
   - **New SIM**: YES or NO
   - **Replace**: YES or NO
   - **New Retailer Count**: Number between 0-99
4. Save the Excel file
5. Click "📤 Upload Excel File"
6. Select your filled Excel file
7. Wait for confirmation message
8. Check the Recent Submissions table for your uploaded records

## Excel Template Structure

```
| Zone   | Field Officer | BTS ID  | MSISDN     | Date (YYYY-MM-DD) | New SIM | Replace | New Retailer Count |
|--------|---------------|---------|------------|-------------------|---------|---------|-------------------|
| Dhaka  | John Doe      | DHK001  | 1534567890 | 2025-12-09        | YES     | NO      | 5                 |
```

## Validation Rules

### Date Field
- **Format**: YYYY-MM-DD
- **Example Valid Dates**:
  - 2025-12-09
  - 2025-01-15
  - 2024-11-30
- **Example Invalid Dates**:
  - 12/09/2025 (wrong format)
  - 2025-12-9 (missing leading zero)
  - 09-12-2025 (wrong order)

### MSISDN
- Must be exactly 10 digits
- Must start with 15
- Examples: 1534567890, 1566123456, 1500000015

### Other Fields
- **New SIM & Replace**: Must be YES or NO
- **New Retailer Count**: Must be 0-99
- All fields are required

## Error Handling

### Bulk Upload Errors
The system will report specific errors for each row that fails:
- "Row 5: Invalid MSISDN '1234567890'" - MSISDN doesn't start with 15
- "Row 7: MSISDN '1534567890' already exists" - Duplicate MSISDN
- "Row 10: Invalid date format '12/09/2025'. Use YYYY-MM-DD" - Wrong date format

### Duplicate MSISDN
- The system checks for duplicate MSISDNs before insertion
- Both manual entry and bulk upload will be rejected if MSISDN already exists
- Warning appears in real-time for manual entry

## Database Changes

### New Column Added
```sql
ALTER TABLE Mela_SIM_sell_crm_cnl_T ADD ENTRY_DATE DATE;
```

**Note**: Run the SQL script `database/add_entry_date_column.sql` on your database before using the new features.

## Technical Details

### Dependencies
- **openpyxl**: For Excel file generation and reading
- **Flask**: Backend framework
- **oracledb**: Oracle database connectivity

### API Endpoints
- `GET /api/download-template` - Downloads Excel template
- `POST /api/bulk-upload` - Handles Excel file upload

### File Size Limits
- Excel files should contain reasonable number of rows (recommended < 1000 rows per upload)
- Large files may take longer to process

## Tips for Efficient Bulk Upload

1. **Use the Template**: Always start with the downloaded template
2. **Validate Data First**: Check your data in Excel before uploading
3. **Date Format**: Copy the date format from the sample row (YYYY-MM-DD)
4. **Avoid Duplicates**: Check existing MSISDNs before uploading
5. **Small Batches**: Upload in smaller batches (100-200 rows) for faster processing
6. **Review Errors**: If errors occur, fix them and re-upload only failed rows

## Troubleshooting

### Template Download Not Working
- Check browser download settings
- Try different browser
- Ensure sufficient disk space

### Upload Fails
- Verify file format is .xlsx or .xls
- Check file is not corrupted
- Ensure all required columns are present
- Validate date format in Excel

### Date Not Showing in Table
- Run the database migration script: `add_entry_date_column.sql`
- Refresh the page
- Check database connection

## Support
For issues or questions, contact the system administrator.
