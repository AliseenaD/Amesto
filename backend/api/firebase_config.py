import json
import firebase_admin
from firebase_admin import credentials, storage
from django.conf import settings

# Load the firebase credentials
cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)

# Initialize app if not done already    
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_dict)
    firebase_admin.initialize_app(cred, {
        'storageBucket': f"{cred_dict['project_id']}.appspot.com"
    })

bucket = storage.bucket()