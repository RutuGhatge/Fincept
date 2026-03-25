try:
    from app.main import app
    print("Backend imported successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
    print(f"Error importing backend: {e}")
