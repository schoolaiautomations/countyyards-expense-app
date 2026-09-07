# Supabase Database Setup Guide for Country Yards

This guide explains the exact tables and columns created in Supabase for the **Country Yards Landscaping & Finance Tracker**.

---

## ⚡ Quick 1-Minute Setup

1. Open your Supabase Dashboard:
   👉 **[https://supabase.com/dashboard/project/zlnydbmcahgssfipepui](https://supabase.com/dashboard/project/zlnydbmcahgssfipepui)**
2. In the left navigation sidebar, click on **SQL Editor** (icon with `>_`).
3. Click on **+ New Query**.
4. Open the file [`supabase_schema.sql`](file:///d:/countryyards-mobile-app/supabase_schema.sql) in this project, copy the entire SQL script, and paste it into the editor.
5. Click the green **Run** button at the bottom right.
6. ✅ All 6 tables, indexes, row level security policies, and the storage bucket are created instantly!

---

## 📋 Tables to Create

If you want to view or create the tables manually via Table Editor, here are the exact table specifications:

### 1. `projects`
Tracks every landscaping site project and client quote.
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` (Primary Key) | `uuid_generate_v4()` | Unique project ID |
| `name` | `text` | *Required* | Project name (e.g. Palm Grove Villa) |
| `client_name` | `text` | `''` | Client's full name |
| `client_phone` | `text` | `''` | Client's phone number |
| `location` | `text` | `''` | Site location / address |
| `quoted_amount`| `numeric(12, 2)` | `0.00` | Quoted amount to client |
| `status` | `text` | `'Active'` | `'Active'`, `'Completed'`, `'On Hold'` |
| `notes` | `text` | `''` | Project scope & notes |
| `created_at` | `timestamptz` | `now()` | Date created |
| `updated_at` | `timestamptz` | `now()` | Last updated timestamp |

---

### 2. `expenses`
Stores itemized expenses across the 11 categories.
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` (Primary Key) | `uuid_generate_v4()` | Unique expense ID |
| `project_id` | `uuid` (Foreign Key) | References `projects(id)` | Cascades on delete |
| `type` | `text` | *Required* | Categories: `Soil`, `Plants`, `Pots`, `Fertilizer`, `Transport`, `Fuel`, `Food`, `Stay`, `Miscellaneous`, `Workers Cost`, `Design` |
| `amount` | `numeric(12, 2)` | `0.00` | Expense amount in ₹ |
| `description` | `text` | `''` | Optional detailed description |
| `date` | `date` | `CURRENT_DATE` | Date expense occurred |
| `created_at` | `timestamptz` | `now()` | Creation timestamp |

---

### 3. `salaries`
Tracks worker, horticulturist, and supervisor payouts.
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` (Primary Key) | `uuid_generate_v4()` | Unique salary ID |
| `project_id` | `uuid` (Foreign Key) | References `projects(id)` | Cascades on delete |
| `person_name` | `text` | *Required* | Name of worker/person paid |
| `amount` | `numeric(12, 2)` | `0.00` | Salary paid in ₹ |
| `date` | `date` | `CURRENT_DATE` | Date salary paid |
| `notes` | `text` | `''` | Role or phase notes |
| `created_at` | `timestamptz` | `now()` | Timestamp |

---

### 4. `client_payments`
Tracks payments received from clients towards the quoted amount.
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` (Primary Key) | `uuid_generate_v4()` | Unique payment ID |
| `project_id` | `uuid` (Foreign Key) | References `projects(id)` | Cascades on delete |
| `amount` | `numeric(12, 2)` | `0.00` | Payment received in ₹ |
| `date` | `date` | `CURRENT_DATE` | Payment date |
| `payment_method` | `text` | `'UPI'` | `UPI`, `Bank Transfer`, `Cash`, `Cheque`, `RTGS / NEFT` |
| `notes` | `text` | `''` | Milestone details / transaction ref |
| `created_at` | `timestamptz` | `now()` | Timestamp |

---

### 5. `project_photos`
Tracks before/during/after site gallery photos.
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` (Primary Key) | `uuid_generate_v4()` | Unique photo ID |
| `project_id` | `uuid` (Foreign Key) | References `projects(id)` | Cascades on delete |
| `stage` | `text` | *Required* | Stage: `'Before Work'`, `'Work in Progress'`, `'After Completion'` |
| `image_url` | `text` | *Required* | Image data URI or Supabase public URL |
| `description` | `text` | `''` | Description of the photo |
| `date` | `date` | `CURRENT_DATE` | Photo capture date |
| `created_at` | `timestamptz` | `now()` | Timestamp |

---

### 6. `project_documents`
Stores contracts, blueprints, and proposals.
| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` (Primary Key) | `uuid_generate_v4()` | Unique document ID |
| `project_id` | `uuid` (Foreign Key) | References `projects(id)` | Cascades on delete |
| `file_name` | `text` | *Required* | Name of document (e.g. `Quote_v1.pdf`) |
| `file_url` | `text` | *Required* | File data URL or download link |
| `file_type` | `text` | `'document'` | MIME type |
| `file_size` | `numeric(10, 2)`| `0.00` | Size in KB |
| `uploaded_at` | `timestamptz` | `now()` | Timestamp |

---

## 🗄️ Storage Bucket

- **Bucket Name**: `project-media`
- **Access**: Public
- Stores photos and uploaded project blueprints.
- Created automatically in `supabase_schema.sql` lines 97-106.
