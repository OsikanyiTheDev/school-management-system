import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.validation import validate_academic_year, validate_school, validate_student_profile


class SchoolValidationTests(unittest.TestCase):
    def test_valid_school_payload(self):
        clean, errors = validate_school({"name": "Accra Model School", "code": "ams", "email": "ADMIN@SCHOOL.EDU", "phone": "+233241234567"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["code"], "AMS")
        self.assertEqual(clean["email"], "admin@school.edu")

    def test_invalid_phone_rejected(self):
        _, errors = validate_school({"name": "Accra Model School", "code": "AMS", "phone": "abc"})
        self.assertTrue(any("phone" in error for error in errors))


class AcademicYearValidationTests(unittest.TestCase):
    def test_valid_academic_year(self):
        clean, errors = validate_academic_year({"school_id": "sch_acme_ghana", "label": "2026/2027"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["label"], "2026/2027")

    def test_year_must_advance_by_one(self):
        _, errors = validate_academic_year({"school_id": "sch_acme_ghana", "label": "2026/2028"})
        self.assertTrue(any("next calendar year" in error for error in errors))


class StudentProfileValidationTests(unittest.TestCase):
    def test_valid_student_profile(self):
        clean, errors = validate_student_profile(
            {
                "school_id": "sch_acme_ghana",
                "class_id": "cls_jhs2a",
                "first_name": "Ama",
                "last_name": "Mensah",
                "gender": "female",
                "email": "ama@example.com",
            }
        )
        self.assertEqual(errors, [])
        self.assertEqual(clean["status"], "active")

    def test_gender_is_constrained(self):
        _, errors = validate_student_profile(
            {
                "school_id": "sch_acme_ghana",
                "class_id": "cls_jhs2a",
                "first_name": "Ama",
                "last_name": "Mensah",
                "gender": "unknown",
            }
        )
        self.assertTrue(any("gender" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
