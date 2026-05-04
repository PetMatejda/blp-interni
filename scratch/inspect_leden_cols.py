import pandas as pd
import os

file_path = r'C:\Users\petrm\Downloads\Dochazka\Docházka 2026.xlsx'

if os.path.exists(file_path):
    df = pd.read_excel(file_path, sheet_name='LEDEN ')
    print("--- LEDEN Columns 20-40 ---")
    print(df.iloc[:5, 20:40])
else:
    print(f"File not found: {file_path}")
