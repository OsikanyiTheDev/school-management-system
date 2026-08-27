import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.domain import build_academic_year, build_class, build_person, build_school, build_subject, build_teacher_assignment, build_term


class DomainItemTests(unittest.TestCase):
    def test_school_item_shape(self):
        item = build_school({"name": "Accra Model School", "code": "AMS"}, created_by="user-1")
        self.assertTrue(item["school_id"].startswith("sch_ams_"))
        self.assertEqual(item["PK"], f"SCHOOL#{item['school_id']}")
        self.assertEqual(item["SK"], "PROFILE")
        self.assertEqual(item["GSI1PK"], "SCHOOL")

    def test_academic_year_item_is_tenant_scoped(self):
        item = build_academic_year({"school_id": "sch_acme_ghana", "label": "2026/2027"}, created_by="user-1")
        self.assertEqual(item["PK"], "SCHOOL#sch_acme_ghana#ACADEMIC_YEAR")
        self.assertEqual(item["school_id"], "sch_acme_ghana")
        self.assertEqual(item["GSI1PK"], "SCHOOL#sch_acme_ghana#ACADEMIC_YEAR")

    def test_term_class_subject_items(self):
        term = build_term({"school_id": "sch_acme_ghana", "academic_year_id": "ayr_001", "name": "Term 1"}, created_by="user-1")
        klass = build_class({"school_id": "sch_acme_ghana", "academic_year_id": "ayr_001", "name": "JHS 2A"}, created_by="user-1")
        subject = build_subject({"school_id": "sch_acme_ghana", "name": "Mathematics", "code": "MATH"}, created_by="user-1")
        self.assertEqual(term["entity_type"], "term")
        self.assertEqual(klass["entity_type"], "class")
        self.assertEqual(subject["entity_type"], "subject")
        self.assertTrue(term["term_id"].startswith("term_"))
        self.assertTrue(klass["class_id"].startswith("cls_"))
        self.assertTrue(subject["subject_id"].startswith("subj_"))

    def test_people_items_are_separate_entities(self):
        student = build_person(
            {
                "school_id": "sch_acme_ghana",
                "class_id": "cls_jhs2a",
                "first_name": "Ama",
                "last_name": "Mensah",
                "gender": "female",
            },
            person_type="student",
            id_prefix="stu",
            created_by="user-1",
        )
        teacher = build_person(
            {"school_id": "sch_acme_ghana", "first_name": "Kofi", "last_name": "Owusu"},
            person_type="teacher",
            id_prefix="tch",
            created_by="user-1",
        )
        guardian = build_person(
            {"school_id": "sch_acme_ghana", "first_name": "Esi", "last_name": "Mensah", "phone": "+233241234567"},
            person_type="guardian",
            id_prefix="gdn",
            created_by="user-1",
        )
        self.assertEqual(student["PK"], "SCHOOL#sch_acme_ghana#STUDENT")
        self.assertEqual(teacher["PK"], "SCHOOL#sch_acme_ghana#TEACHER")
        self.assertEqual(guardian["PK"], "SCHOOL#sch_acme_ghana#GUARDIAN")

    def test_teacher_assignment_item_is_tenant_scoped(self):
        item = build_teacher_assignment(
            {
                "school_id": "sch_acme_ghana",
                "academic_year_id": "ayr_001",
                "term_id": "term_001",
                "class_id": "cls_jhs2a",
                "subject_id": "subj_math",
                "teacher_id": "tch_001",
            },
            created_by="user-1",
        )
        self.assertEqual(item["PK"], "SCHOOL#sch_acme_ghana#TEACHER_ASSIGNMENT")
        self.assertEqual(item["entity_type"], "teacher_assignment")
        self.assertTrue(item["assignment_id"].startswith("asg_"))
        self.assertEqual(item["GSI1PK"], "SCHOOL#sch_acme_ghana#TEACHER_ASSIGNMENT")
        self.assertEqual(item["GSI3PK"], "SCHOOL#sch_acme_ghana#TEACHING_LOAD")


if __name__ == "__main__":
    unittest.main()
