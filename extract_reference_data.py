"""
Extract distinct Zones and Field Officers from CSV
"""
import csv
import json

csv_file = 'csv.csv'
output_file = 'reference_data.json'

zones = set()
officers = set()

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row.get('S_AND_D_ZONE'):
            zones.add(row['S_AND_D_ZONE'].strip())
        if row.get('FIELD_OFFICER_NAME'):
            officers.add(row['FIELD_OFFICER_NAME'].strip())

reference_data = {
    'zones': sorted(list(zones)),
    'field_officers': sorted(list(officers))
}

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(reference_data, f, indent=2, ensure_ascii=False)

print(f"Extracted {len(zones)} zones and {len(officers)} field officers")
print(f"Data saved to {output_file}")
