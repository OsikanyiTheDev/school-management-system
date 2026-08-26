import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.tenant import entity_sk, is_valid_school_id, membership_pk, membership_sk, role_is_known, tenant_pk


class TenantKeyTests(unittest.TestCase):
    def test_school_id_validation(self):
        self.assertTrue(is_valid_school_id("sch_acme_ghana"))
        self.assertFalse(is_valid_school_id("school one"))
        self.assertFalse(is_valid_school_id("sch"))

    def test_tenant_keys_scope_entities_by_school(self):
        self.assertEqual(tenant_pk("sch_acme_ghana", "student"), "SCHOOL#sch_acme_ghana#STUDENT")
        self.assertEqual(entity_sk("stu_001"), "ID#stu_001")

    def test_membership_keys(self):
        self.assertEqual(membership_pk("user-123"), "USER#user-123")
        self.assertEqual(membership_sk("sch_acme_ghana"), "SCHOOL#sch_acme_ghana")

    def test_known_roles(self):
        self.assertTrue(role_is_known("SchoolAdmin"))
        self.assertTrue(role_is_known("FinanceOfficer"))
        self.assertFalse(role_is_known("SuperTeacher"))


if __name__ == "__main__":
    unittest.main()
