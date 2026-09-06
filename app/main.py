from fastapi import FastAPI

from app.api import users, groups, expenses

app = FastAPI(title="Splitwise Clone", version="0.1.0")

app.include_router(users.router)
app.include_router(groups.router)
app.include_router(expenses.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
