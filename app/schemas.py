from pydantic import BaseModel, EmailStr

# ---- Auth payloads ----
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

# ---- Token response ----
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
