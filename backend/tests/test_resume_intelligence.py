from app.services.resume_intelligence import extract_skills, extract_years, match_resume_to_job


def test_extract_skills_and_experience():
    text = "Data analyst with 3.5 years of experience using Python, SQL, Power BI and Excel."
    skills = extract_skills(text)
    assert "Python" in skills
    assert "SQL" in skills
    assert "Power Bi" in skills
    assert extract_years(text) == 3.5


def test_job_match_returns_explainable_score():
    result = match_resume_to_job(
        "Data analyst with Python SQL Power BI and Excel experience.",
        ["Python", "SQL", "Power BI", "Excel"],
        "Data Analyst",
        3.0,
    )
    assert 0 <= result["score"] <= 100
    assert result["matched_skills"]
    assert "skill_match" in result["breakdown"]
    assert result["recommendation"]
