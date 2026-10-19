# StudySwap Database Schema

Database: `studyswap` (MongoDB)

---

## Collections Overview

| Collection | Purpose |
|---|---|
| users | Student and admin accounts |
| resources | Uploaded academic materials |
| bookmarks | User-saved resource references |
| ratings | Per-user star ratings |
| reviews | Text reviews for resources |
| downloads | Download activity log |
| reports | Student-submitted content reports |
| notifications | In-app notifications |
| contributionTransactions | Points award ledger |
| badges | Badge definitions |
| userBadges | Awarded badges per user |

---

## users

```json
{
  "_id": "ObjectId",
  "name": "Shyam Kumar",
  "email": "shyam@example.com",
  "passwordHash": "$2b$12$...",
  "role": "student | admin",
  "college": "REC Chennai",
  "degree": "B.E",
  "branch": "CSE",
  "semester": 5,
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `email` — unique
- `createdAt` — ascending

---

## resources

```json
{
  "_id": "ObjectId",
  "title": "DBMS Unit 3 Notes",
  "description": "Comprehensive notes covering relational algebra...",
  "college": "REC Chennai",
  "degree": "B.E",
  "branch": "CSE",
  "semester": 5,
  "subject": "Database Management Systems",
  "unit": "Unit 3 - SQL",
  "resourceType": "notes | previousPaper | labRecord | labManual | questionBank | presentation | studyGuide | reference | other",
  "tags": ["dbms", "sql", "relational"],
  "originalFilename": "DBMS_Unit3.pdf",
  "storedFilename": "1697620000000-uuid-DBMS_Unit3.pdf",
  "storagePath": "uploads/1697620000000-uuid-DBMS_Unit3.pdf",
  "mimeType": "application/pdf",
  "fileSize": 2457600,
  "uploaderId": "ObjectId (ref: users)",
  "moderationStatus": "pending | published | rejected",
  "moderationReason": "...",
  "approvedBy": "ObjectId (ref: users)",
  "approvedAt": "ISODate",
  "downloadCount": 0,
  "averageRating": 0,
  "ratingCount": 0,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `moderationStatus`
- `uploaderId`
- `branch`, `semester`, `subject`
- Text index on `title`, `description`, `subject`, `tags`

---

## bookmarks

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "resourceId": "ObjectId (ref: resources)",
  "createdAt": "ISODate"
}
```

**Indexes:**
- `{ userId, resourceId }` — unique compound

---

## ratings

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "resourceId": "ObjectId (ref: resources)",
  "rating": 4,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `{ userId, resourceId }` — unique compound
- `resourceId`

**Constraint:** rating must be integer 1–5

---

## reviews

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "resourceId": "ObjectId (ref: resources)",
  "comment": "Very helpful notes!",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `resourceId`
- `userId`

---

## downloads

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "resourceId": "ObjectId (ref: resources)",
  "createdAt": "ISODate"
}
```

**Indexes:**
- `userId`
- `resourceId`

---

## reports

```json
{
  "_id": "ObjectId",
  "reporterId": "ObjectId (ref: users)",
  "resourceId": "ObjectId (ref: resources)",
  "reason": "incorrectMaterial | duplicate | inappropriateContent | copyright | brokenFile | other",
  "description": "More detail about the issue...",
  "status": "open | underReview | resolved | dismissed",
  "resolution": "Admin resolution note...",
  "resolvedBy": "ObjectId (ref: users)",
  "resolvedAt": "ISODate",
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

**Indexes:**
- `status`
- `resourceId`

---

## notifications

```json
{
  "_id": "ObjectId",
  "recipientId": "ObjectId (ref: users)",
  "type": "resourceApproved | resourceRejected | reviewReceived | badgeEarned | reportResolved",
  "title": "Resource Approved",
  "message": "Your resource 'DBMS Notes' has been approved and is now live.",
  "relatedResourceId": "ObjectId (ref: resources)",
  "isRead": false,
  "createdAt": "ISODate"
}
```

**Indexes:**
- `recipientId`
- `{ recipientId, isRead }`

---

## contributionTransactions

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "actionType": "resourceApproved | reviewReceived | endorsement | validReport",
  "points": 10,
  "uniqueReference": "resource_approved_resourceId",
  "relatedResourceId": "ObjectId (ref: resources)",
  "createdAt": "ISODate"
}
```

**Indexes:**
- `userId`
- `uniqueReference` — unique (prevents duplicate awards)

---

## badges

```json
{
  "_id": "ObjectId",
  "name": "first_contribution | knowledge_sharer | helpful_student | top_contributor",
  "description": "Earned your first approved resource",
  "criteria": "1 approved resource",
  "createdAt": "ISODate"
}
```

---

## userBadges

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: users)",
  "badgeId": "ObjectId (ref: badges)",
  "awardedAt": "ISODate"
}
```

**Indexes:**
- `{ userId, badgeId }` — unique compound
- `userId`

---

## Contribution Points Rules

| Action | Points | Duplicate Prevention |
|---|---|---|
| Resource approved | +10 | `resource_approved_{resourceId}` |
| Positive review received on own resource | +2 | `review_received_{reviewId}` |
| Valid report confirmed by admin | +2 | `valid_report_{reportId}` |

## Badge Award Criteria

| Badge | Name | Criteria |
|---|---|---|
| 🌱 First Contribution | first_contribution | 1+ approved resource |
| 📚 Knowledge Sharer | knowledge_sharer | 5+ approved resources |
| 🤝 Helpful Student | helpful_student | 10+ reviews received on own resources |
| 🏆 Top Contributor | top_contributor | 100+ total contribution points |

---

## Data Consistency Notes

MongoDB does not provide multi-document transactions by default (though they are available with replica sets). StudySwap handles consistency as follows:

1. **Ratings:** `averageRating` and `ratingCount` on the resource document are updated atomically using `$inc` and recalculated after each rating upsert.
2. **Downloads:** `downloadCount` on the resource is incremented with `$inc` after a successful file stream.
3. **Contribution points:** A `uniqueReference` unique index prevents duplicate point awards. Awards are attempted after the primary operation succeeds.
4. **File upload:** If the MongoDB insert fails after the file is stored, the file is deleted (best-effort cleanup).
