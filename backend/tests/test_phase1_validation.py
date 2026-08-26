import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.validation import validate_guardian_profile, validate_subject, validate_teacher_profile, validate_term


class Phase1ValidationTests(unittest.TestCase):
    def test_term_validation(self):
        clean, errors = validate_term({"school_id": "sch_acme", "academic_year_id": "ayr_001", "name": "Term 1"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["status"], "planned")

    def test_subject_validation_normalizes_code(self):
        clean, errors = validate_subject({"school_id": "sch_acme", "name": "English Language", "code": "eng lang"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["code"], "ENG-LANG")

    def test_teacher_validation(self):
        clean, errors = validate_teacher_profile({"school_id": "sch_acme", "first_name": "Kojo", "last_name": "Mensah", "email": "T@SCHOOL.EDU"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["email"], "t@school.edu")

    def test_guardian_requires_phone(self):
        _, errors = validate_guardian_profile({"school_id": "sch_acme", "first_name": "Esi", "last_name": "Mensah"})
        self.assertTrue(any("phone" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
