#!/bin/sh
echo 'Do mysqldump'

# printconf() {
# cat <<-EOF
#     [mysql]
#     user=$DATABASE_USERNAME
#     password=$DATABASE_PASSWORD
# EOF
# }
# mysqldump --databases --defaults-extra-file=<(printconf) teamtedtile-api > mysql_dump.sql
mysqldump --databases --no-tablespaces --user=$DATABASE_USERNAME --password=$DATABASE_PASSWORD teamtedtile-api > mysql_dump.sql

# mysqldump --defaults-extra-file=<(printconf) $db > $db.sql

# mysql --defaults-extra-file=<(printconf) -e "show databases" | while read db; do
#     echo "Backing up $db"
#     mysqldump --defaults-extra-file=<(printconf) $db > $db.sql
done