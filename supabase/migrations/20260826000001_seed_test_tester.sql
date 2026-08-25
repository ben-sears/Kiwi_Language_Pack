insert into kiwi_testers (slug, name)
values ('ben-test', 'Ben (internal test)')
on conflict (slug) do nothing;
