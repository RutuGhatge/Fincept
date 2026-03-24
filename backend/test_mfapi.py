import requests

funds = [
    "HDFC BANKING AND PSU DEBT FUND - DIRECT PLAN",
    "HDFC FLEXI CAP FUND - DIRECT PLAN",
    "AXIS LARGE & MID CAP FUND",
    "ICICI PRUDENTIAL GOLD ETF FOF"
]

for fund in funds:
    print(f"\nSearching for: {fund}")
    res = requests.get(f"https://api.mfapi.in/mf/search?q={fund}")
    if res.status_code == 200:
        data = res.json()
        print(f"Total results: {len(data)}")
        for d in data[:5]:
            print(f"   {d['schemeCode']} - {d['schemeName']}")
