from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine,Column,Integer,String,Float
from sqlalchemy.orm import declarative_base,sessionmaker
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
DATABASE_URL= "postgresql+psycopg2://postgres:rami25@localhost:5432/student_management"
engine=create_engine(DATABASE_URL)
SessionLocal= sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)
Base=declarative_base()
class StudentDB(Base):
    __tablename__="students"
    id=Column(Integer,primary_key=True,index=True)
    name=Column(String)
    age=Column(Integer)
    grade=Column(Float)
Base.metadata.create_all(bind=engine)    
    
class Student(BaseModel):
    name:str
    age:int
    grade:float
@app.get("/")
def home():
    return{"message":"student management is working!"}
@app.get("/students")
def stud(): 
    db=SessionLocal()
    students=db.query(StudentDB).all()
    result=[]
    for student in students:
        result.append({
            "id":student.id,
            "name":student.name,
            "age":student.age,
            "grade":student.grade,
        })
    db.close()          
    return result
@app.post("/students")
def add_students(student:Student):
    db=SessionLocal()
    new_student=StudentDB(
        name=student.name,
        age=student.age,
        grade=student.grade,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student) 
    result={
       "id":new_student.id,
       "name":new_student.name,
       "age":new_student.age,
       "grade":new_student.grade  

    }
    db.close()
    return(result)
@app.delete("/students/{student_id}")
def delete_students(student_id:int):
    db=SessionLocal()
    student=db.query(StudentDB).filter(StudentDB.id == student_id).first()
    if student is None:
        return{"message":"invalid student"}
    else:
        db.delete(student)
        db.commit()
        db.close()
        return{"message":"deleted successfully"}
@app.put("/students/{student_id}")
def update_students(new_student:Student,student_id:int):
    db=SessionLocal()
    student=db.query(StudentDB).filter(StudentDB.id==student_id).first()
    if student is None:
       return{"message":"invalid student"}
    else:
       student.name=new_student.name
       student.age=new_student.age
       student.grade=new_student.grade
       db.commit()
       db.close()
       return{"message":"student updated successfully"}