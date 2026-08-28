def test_project_layout():
    from pathlib import Path
    root = Path(__file__).parents[1]
    for path in ["backend/app/main.py","backend/app/db/seed.py","frontend/package.json","docker-compose.yml"]:
        assert (root/path).exists()
