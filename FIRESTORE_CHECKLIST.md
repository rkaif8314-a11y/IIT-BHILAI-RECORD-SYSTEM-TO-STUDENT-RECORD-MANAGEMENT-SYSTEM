# Firestore Security Checklist

Before deploying ASRS data-model changes:

- [ ] Every new collection has explicit read/write rules.
- [ ] Student reads are scoped to the authenticated student's own records.
- [ ] Faculty writes are limited to records they are authorized to manage.
- [ ] Administrative operations are explicitly role-gated.
- [ ] Unauthenticated reads and writes are denied unless intentionally public.
- [ ] New fields are reviewed for accidental exposure of private student data.
- [ ] Authorized and unauthorized paths are tested after rule changes.
- [ ] The deployed rules match the version reviewed with the application change.
