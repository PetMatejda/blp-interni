import pandas as pd
import os

file_path = r'C:\Users\petrm\Downloads\Dochazka\Docházka 2026.xlsx'

if os.path.exists(file_path):
    # Try to read the first sheet
    df = pd.read_excel(file_path)
    print("--- Columns ---")
    print(df.columns.tolist())
    print("--- First 5 rows ---")
    print(df.head())
    
    # Check if there are multiple sheets
    xl = pd.ExcelFile(file_path)
    print("--- Sheets ---")
    print(xl.sheet_names)
else:
    print(f"File not found: {file_path}")
