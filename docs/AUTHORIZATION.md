# Authorization Model

## Cognito groups

The initial Terraform auth module creates these groups:

- `PlatformAdmin`
- `SchoolAdmin`
- `Teacher`
- `Student`
- `ParentGuardian`
- `FinanceOfficer`

Groups identify broad capability. They are not enough by themselves. The application must also check school membership.

## Tenant membership

A user may belong to one or more schools over time:

```text
USER#{cognito_sub} / SCHOOL#{school_id}
```

The membership item stores the school role and optional linked profile ID.

## Enforcement examples

### SchoolAdmin

Can manage setup and users only for their own `school_id`.

### Teacher

Can access only assigned classes and subjects within their `school_id`.

### ParentGuardian

Can view only linked children.

### FinanceOfficer

Can manage fee structures, invoices and payments within their `school_id`.

## Non-negotiable rule

Do not authorize a request only because a token contains a Cognito group. Always also verify tenant ownership/membership for school-owned resources.
