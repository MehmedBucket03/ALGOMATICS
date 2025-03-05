#mongodb connection

from pymongo import MongoClient
import os

# Load environment variables if using .env
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/algomatics")

client = MongoClient(MONGO_URI)
db = client.algomatics  # Database name
users_collection = db.users  # Example users collection
