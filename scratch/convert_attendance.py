import pandas as pd
import json
import os

file_path = r'C:\Users\petrm\Downloads\Dochazka\Docházka 2026.xlsx'

def parse_attendance(file_path):
    xl = pd.ExcelFile(file_path)
    all_data = []
    
    months_map = {
        'LEDEN ': 1, 'NOR': 2, 'BEZEN': 3, 'DUBEN': 4, 'KVTEN': 5, 
        'ERVEN': 6, 'ERVENEC': 7, 'SRPEN': 8, 'Z': 9, 'JEN': 10, 
        'LISTOPAD': 11, 'PROSINEC': 12
    }
    
    for sheet in xl.sheet_names:
        if sheet == 'SUMARIZACE': continue
        month = months_map.get(sheet, 0)
        if month == 0: continue
        
        df = pd.read_excel(file_path, sheet_name=sheet)
        
        current_name = None
        for i in range(len(df)):
            val = df.iloc[i, 0]
            # Potential name block start
            if pd.notna(val) and not str(val).isdigit() and str(df.iloc[i, 1]) == 'nan':
                if i + 1 < len(df) and 'chod' in str(df.iloc[i+1, 1]).lower():
                    current_name = str(val)
                    continue
            
            if current_name and pd.notna(val) and str(val).isdigit():
                day = int(val)
                check_in = df.iloc[i, 1]
                check_out = df.iloc[i, 2]
                
                if pd.notna(check_in) and pd.notna(check_out):
                    # Convert to strings/ISO format
                    try:
                        # Sometimes pandas reads times as datetime or time objects
                        if hasattr(check_in, 'strftime'): check_in = check_in.strftime('%H:%M:%S')
                        if hasattr(check_out, 'strftime'): check_out = check_out.strftime('%H:%M:%S')
                        
                        all_data.append({
                            'name': current_name,
                            'date': f"2026-{month:02d}-{day:02d}",
                            'check_in': str(check_in),
                            'check_out': str(check_out)
                        })
                    except:
                        pass
    return all_data

if os.path.exists(file_path):
    data = parse_attendance(file_path)
    with open('attendance_history.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Parsed {len(data)} attendance records.")
else:
    print("File not found.")
