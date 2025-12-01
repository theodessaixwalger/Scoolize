-- Enable RLS on the table (if not already enabled)
alter table "public"."applications" enable row level security;

-- Policy to allow students to delete their own applications
create policy "Enable delete for users based on student_id"
on "public"."applications"
for delete
using (auth.uid() = student_id);

-- Policy to allow students to view their own applications (if not already present)
create policy "Enable select for users based on student_id"
on "public"."applications"
for select
using (auth.uid() = student_id);

-- Policy to allow students to insert applications (if not already present)
create policy "Enable insert for users based on student_id"
on "public"."applications"
for insert
with check (auth.uid() = student_id);
