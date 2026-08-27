import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared import authz


def event(groups=None, school_id=None, sub="user-1"):
    claims = {"sub": sub}
    if groups is not None:
        claims["cognito:groups"] = groups
    if school_id is not None:
        claims["custom:school_id"] = school_id
    return {"requestContext": {"authorizer": {"jwt": {"claims": claims}}}}


class AuthzTests(unittest.TestCase):
    def test_group_parsing_from_string(self):
        self.assertEqual(authz.caller_groups(event("SchoolAdmin Teacher")), ("SchoolAdmin", "Teacher"))


    def test_group_parsing_from_json_string(self):
        self.assertEqual(authz.caller_groups(event('["PlatformAdmin", "SchoolAdmin"]')), ("PlatformAdmin", "SchoolAdmin"))

    def test_group_parsing_from_bracket_string(self):
        self.assertEqual(authz.caller_groups(event('[PlatformAdmin]')), ("PlatformAdmin",))

    def test_platform_admin_can_manage_any_school(self):
        self.assertTrue(authz.can_manage_school(event(["PlatformAdmin"]), "sch_any"))

    def test_school_admin_must_match_school(self):
        self.assertTrue(authz.can_manage_school(event(["SchoolAdmin"], "sch_acme"), "sch_acme"))
        self.assertFalse(authz.can_manage_school(event(["SchoolAdmin"], "sch_other"), "sch_acme"))

    def test_teacher_cannot_manage_school(self):
        self.assertFalse(authz.can_manage_school(event(["Teacher"], "sch_acme"), "sch_acme"))


if __name__ == "__main__":
    unittest.main()
