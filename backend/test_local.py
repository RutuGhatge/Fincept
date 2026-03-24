import requests

login_data = {
    "email": "portfolio_tester@example.com",
    "password": "testpassword123"
}
r = requests.post("http://127.0.0.1:8000/users/login", json=login_data)
user_id = r.json().get("user_id")

with open(r"c:\Users\Rutu Mahesh Ghatge\OneDrive\Desktop\Projects\Investment_Intelligence\Holdings_Statement_2026-03-24.xlsx", "rb") as f:
    r2 = requests.post(
        "http://127.0.0.1:8000/api/v1/portfolio/upload",
        files={"file": ('Holdings_Statement_2026-03-24.xlsx', f, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')},
        data={"portfolio_name": "My Zerodha Import", "user_id": user_id}
    )
    with open("error6.txt", "w") as out:
        out.write(str(r2.status_code) + "\n" + r2.text)
