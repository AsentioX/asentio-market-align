## Goal

Remove the "Leadership" and "Sectors" inputs from the admin company edit/create form.

## Changes (src/pages/CompanyForm.tsx only)

- Delete the "Leadership (comma separated)" input block and the "Sectors" checkbox grid from the form UI.
- Remove `leadership` and `sectors` from form state, the prefill effect, and the save payload, plus the now-unused `toggleSector` helper and the `COMPANY_SECTORS` / `Checkbox` imports if nothing else uses them.

## Notes

- The database columns stay untouched, so any existing values are preserved and nothing else breaks.
- The company profile page still shows leadership when present; leave that as-is unless you also want it removed there.
