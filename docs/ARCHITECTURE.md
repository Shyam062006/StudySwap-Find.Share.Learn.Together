# StudySwap — System Architecture

> **Find. Share. Learn. Together.**
> Full-Stack Student Academic Resource Sharing and Discovery Platform

---

## 1. Overall System Architecture

```mermaid
flowchart TD
    A[StudySwap] --> B[React Frontend]
    B --> C[API Services]
    C --> D[Express REST API]
    D --> E[Authentication Middleware]
    E --> F[Controllers and Services]
    F --> G[MongoDB]
    F --> H[File Storage]
```

---

## 2. Project File Flow

```mermaid
flowchart TD
    A[StudySwap Root] --> B[Existing React Frontend]
    A --> C[Express Backend]
    A --> D[Documentation]
    B --> E[React Pages and Components]
    B --> F[API Service Modules]
    F --> C
    C --> G[Routes]
    G --> H[Controllers]
    H --> I[MongoDB Driver]
    I --> J[(MongoDB Database)]
    H --> K[File Storage]
```

---

## 3. Student Registration Flow

```mermaid
flowchart TD
    A[Registration Form] --> B[React API Request]
    B --> C[Express Validation]
    C --> D[Hash Password]
    D --> E[Save User in MongoDB]
    E --> F[Return Safe User Data]
    F --> G[Update Frontend Authentication State]
```

---

## 4. Academic Resource Upload Flow

```mermaid
flowchart TD
    A[Student Upload Form] --> B[Multipart Request]
    B --> C[Express Authentication]
    C --> D[Validate File and Metadata]
    D --> E[Save File to Storage]
    E --> F[Save Metadata in MongoDB]
    F --> G[Mark Resource Pending]
    G --> H[Notify Student]
```

---

## 5. Administrative Moderation Flow

```mermaid
flowchart TD
    A[Pending Resource] --> B[Admin Reviews Upload]
    B --> C{Decision}
    C -->|Approve| D[Mark Approved]
    C -->|Reject| E[Mark Rejected]
    D --> F[Publish in Material Hub]
    E --> G[Record Rejection Reason]
    F --> H[Notify Uploader]
    G --> H
```

---

## 6. Secure Resource Download Flow

```mermaid
flowchart TD
    A[Student Selects Resource] --> B[Request Download]
    B --> C[Validate Resource and Permission]
    C --> D[Resolve Safe File Path]
    D --> E[Return Actual File]
    E --> F[Record Download Activity]
```

---

## Architectural Principles & Decisions

| Decision | Implementation | Rationale |
|---|---|---|
| **Frontend Root** | `studyswap-frontend-claude/` | Preserves the complete Claude-generated Red Noir interface without regression. |
| **Authentication** | JWT stored in `httpOnly` cookie (`token`) | Prevents token theft via XSS; credentials sent via `credentials: 'include'`. |
| **Database Access** | Official MongoDB Node.js Driver (no Mongoose) | Direct, performant, standards-compliant query functions conforming to FSD exam syllabus. |
| **Single Material Hub** | `GET /api/resources` with query filters | Exactly one hub where branches, semesters, and types are filters within the same view. |
| **File Storage** | Safe local disk storage in `server/uploads/` | Unique timestamps and sanitized filenames prevent path traversal and collisions. |
| **Moderation Engine** | Two-tier lifecycle: `pending` → `approved` / `rejected` | Only verified academic resources are published into the Material Hub. |
| **Automated Testing** | Jest + Supertest with `mongodb-memory-server` | 100% isolated, reliable in-memory test suite that passes anywhere without pre-running services. |
