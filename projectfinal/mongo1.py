import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()  # loads .env (from current working dir)

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB = os.getenv("MONGODB_DB", "sample_mflix")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set. Put it in your .env")

_client = MongoClient(MONGODB_URI)
db = _client[MONGODB_DB]