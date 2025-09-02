alter table family_members add column spouse_id uuid references family_members(id);
