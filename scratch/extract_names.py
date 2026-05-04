import pandas as pd
import os

file_path = r'C:\Users\petrm\Downloads\Dochazka\Docházka 2026.xlsx'

def get_names_from_sheet(df):
    names = []
    # Names seem to be in Unnamed: 0 and are followed by 'Pchod' in Unnamed: 1 in the next row or so
    for i in range(len(df)):
        val = str(df.iloc[i, 0])
        # If it's a name (all caps usually, not a number, not NaN)
        if pd.notna(df.iloc[i, 0]) and not str(df.iloc[i, 0]).isdigit() and str(df.iloc[i, 1]) == 'nan':
            # Check if next row has 'Pchod' or similar
            if i + 1 < len(df) and ('chod' in str(df.iloc[i+1, 1]).lower() or 'chod' in str(df.iloc[i+2, 1]).lower()):
                names.append(val)
    return names

if os.path.exists(file_path):
    xl = pd.ExcelFile(file_path)
    all_names = set()
    for sheet in xl.sheet_names:
        if sheet == 'SUMARIZACE': continue
        df = pd.read_excel(file_path, sheet_name=sheet)
        names = get_names_from_sheet(df)
        all_names.update(names)
    
    print("--- Found Names in Excel ---")
    for name in sorted(all_names):
        print(name)
else:
    print(f"File not found: {file_path}")
