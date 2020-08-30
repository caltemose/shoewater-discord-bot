testing notes

$data backup
- admin succeeds
- a non-admin fails

$help, $help all, $help [command]
- admin succeeds
- limit to admins? or don't show admin commands to non-admins?

$members
- non-admin fails
- admin succeeds

$user
- non-admin fails

$psn
- non-admin fails all commands
- displays users with different PSNs

$psn all
- all members with mapping

$psn unset
- all members with unset PSN

$psn set [discord] [psn]
- works with discord users who don't have spaces in their name
- ISSUE: discord names with spaces will fail?

$psn setsame [discord]
- works, see issues in `set` command

$psn clear
- wipes all discord->psn mappings

$mypsn
- works for all roles on all commands
- shows user their psn
- works for users with a nickname

$mypsn set [psn]
- works with any user, any PSN

$mypsn setsame
- works with any user, any PSN
- ISSUE: doesn't fail if Discord name is not a valid PSN (illegal chars)


/////// helpers
xGrimReaper_TM
Mrs__Deadvolt


Hello guardians. I need some volunteers to help test the new bot I'm working on. You won't have to do much but I'll need you to be fairly responsive so this doesn't take forever. Anyone on this Discord server can help. However, I will need some volunteers who meet one of these requirements:

+ you have an `_` (underscore) in your Discord name or PSN
+ you have changed your original Discord name

If you can help, please send me a DM.



"double__underscores single_underscore more__doubles"
