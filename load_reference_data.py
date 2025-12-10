"""
Data Loading Script - Load CSV reference data for dropdowns
This script loads Zone and Field Officer data from CSV
Run this once to populate reference data
"""

import csv
import cx_Oracle
from config import DB_CONFIG

def load_csv_data(csv_file_path):
    """Load data from CSV file"""
    zones = set()
    officers = set()
    
    with open(csv_file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Extract zone and field officer from CSV
            # Adjust column names based on your CSV structure
            if 'zone' in row or 'Zone' in row:
                zones.add(row.get('zone') or row.get('Zone'))
            if 'field_officer' in row or 'Field Officer' in row:
                officers.add(row.get('field_officer') or row.get('Field Officer'))
    
    return list(zones), list(officers)


def insert_reference_data(zones, officers):
    """Insert sample records to populate dropdowns"""
    try:
        connection = cx_Oracle.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print(f"Loading {len(zones)} zones and {len(officers)} field officers...")
        
        # Insert sample records with each zone/officer combination
        # This ensures dropdowns have data even before real submissions
        for zone in zones[:5]:  # Limit to first 5 to avoid too many records
            for officer in officers[:5]:
                try:
                    insert_query = """
                        INSERT INTO Mela_SIM_sell_crm_cnl_T 
                        (ZONE, FIELD_OFFICER, BTSID, MSISDN, NEW_SIM, 
                         REPLACE_SIM, NEW_RETAILER_COUNT, CREATED_BY)
                        VALUES (:zone, :officer, :btsid, :msisdn, :new_sim, 
                                :replace, :retailer_count, :created_by)
                    """
                    
                    cursor.execute(insert_query, {
                        'zone': zone,
                        'officer': officer,
                        'btsid': 'SAMPLE',
                        'msisdn': '0000000000',
                        'new_sim': 'NO',
                        'replace': 'NO',
                        'retailer_count': 0,
                        'created_by': 'DATA_LOADER'
                    })
                except cx_Oracle.IntegrityError:
                    # Skip if duplicate
                    continue
        
        connection.commit()
        print("✓ Reference data loaded successfully!")
        
        cursor.close()
        connection.close()
        
    except cx_Oracle.Error as error:
        print(f"Database error: {error}")
    except Exception as e:
        print(f"Error: {e}")


def main():
    """Main function"""
    # Option 1: Load from CSV
    csv_file = input("Enter CSV file path (or press Enter to skip): ").strip()
    
    if csv_file:
        try:
            zones, officers = load_csv_data(csv_file)
            print(f"\nFound {len(zones)} zones and {len(officers)} field officers in CSV")
            
            choice = input("Insert reference data into database? (y/n): ").lower()
            if choice == 'y':
                insert_reference_data(zones, officers)
        except FileNotFoundError:
            print("CSV file not found!")
        except Exception as e:
            print(f"Error loading CSV: {e}")
    else:
        # Option 2: Manual entry
        print("\nManual data entry:")
        zones_input = input("Enter zones (comma-separated): ").strip()
        officers_input = input("Enter field officers (comma-separated): ").strip()
        
        zones = [z.strip() for z in zones_input.split(',') if z.strip()]
        officers = [o.strip() for o in officers_input.split(',') if o.strip()]
        
        if zones and officers:
            insert_reference_data(zones, officers)
        else:
            print("No data entered. Exiting.")


if __name__ == "__main__":
    main()
