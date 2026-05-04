import pandas as pd
import os

file_path = r'C:\Users\petrm\Downloads\Dochazka\Docházka 2026.xlsx'

if os.path.exists(file_path):
    df = pd.read_excel(file_path, sheet_name='LEDEN ')
    print("--- LEDEN Rows 40-100 ---")
    print(df.iloc[40:100, :10])
else:
    print(f"File not found: {file_path}")
