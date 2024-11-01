from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection

class Command(BaseCommand):
    help = 'Migrate data from SQLite dump to PostgreSQL'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting PostgreSQL data migration...')
        
        try:
            # First, make sure we're using PostgreSQL
            if 'postgresql' not in connection.vendor:
                raise Exception('This command should be run with PostgreSQL database configured')

            # Apply migrations first
            self.stdout.write('Applying migrations...')
            call_command('migrate')

            # Load the data
            self.stdout.write('Loading data from dump...')
            call_command('loaddata', 'db_dump.json')

            self.stdout.write(self.style.SUCCESS('Data migration completed successfully!'))
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'Error during migration: {str(e)}'
                )
            )