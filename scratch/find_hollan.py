import pandas as pd
import os

file_path = r'C:\Users\petrm\Downloads\Dochazka\Docházka 2026.xlsx'

if os.path.exists(file_path):
    df = pd.read_excel(file_path, sheet_name='LEDEN ')
    # Search for HOLLAN
    mask = df.iloc[:, 0].astype(str).str.contains('HOLLAN', na=False)
    idx = df[mask].index
    if len(idx) > 0:
        print(f"Found HOLLAN at row {idx[0]}")
        print(df.iloc[idx[0]:idx[0]+35, :5])
    else:
        print("HOLLAN not found in LEDEN")
else:
    print("File not found.")
