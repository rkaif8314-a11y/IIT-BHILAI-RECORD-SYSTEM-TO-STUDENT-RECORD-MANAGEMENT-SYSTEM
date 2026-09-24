# ASRS Role Access Matrix

ASRS has three application roles: `student`, `faculty`, and `admin`.

| Area | Student | Faculty | Admin |
|---|---|---|---|
| Own profile | Read/update allowed fields | Read own profile | Manage according to policy |
| Courses | Read | Read/manage assigned data | Manage |
| Enrollments | Read own | Read relevant students | Manage |
| Attendance | Read own | Record/manage assigned sessions | Administrative oversight |
| Marks | Read own | Enter/manage assigned marks | Administrative oversight |
| User roles | No | No | Manage through controlled workflow |

This matrix describes intended application behavior. Firestore security rules remain the authoritative enforcement layer.
