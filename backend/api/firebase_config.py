import json
import firebase_admin
from firebase_admin import credentials, storage
from django.conf import settings

def initialize_firebase():
    if not firebase_admin._apps:
        cred_dict = json.loads(settings.FIREBASE_CREDENTIALS)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred, {
            'storageBucket': f"{cred_dict['project_id']}.appspot.com"
        })
    return storage.bucket()

# Initialize
bucket = initialize_firebase()