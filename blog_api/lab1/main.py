from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def hello_world():
    return {"message": "Привет, мир!"}

@app.get("/about")
def about_page():
    return {"name": "Мой блог", "version": "1.0"}
