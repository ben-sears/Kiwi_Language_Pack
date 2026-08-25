-- Clear out any messages logged during internal dev testing so real test
-- transcripts start clean. Safe to run anytime pre-launch.
delete from kiwi_messages where tester_id in (select id from kiwi_testers where slug = 'ben-test');
