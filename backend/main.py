from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pydantic import BaseModel, field_validator
from datetime import datetime

app = FastAPI()

# Allow React frontend to connect to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
connection = sqlite3.connect(
    "appointments.db",
    check_same_thread=False
)


# Appointment data model
class Appointment(BaseModel):
    title: str
    description: str
    date: str
    start_time: str
    end_time: str

    # Validate required fields
    @field_validator(
        "title",
        "description",
        "date",
        "start_time",
        "end_time"
    )
    @classmethod
    def validate_not_empty(cls, value):
        if not value.strip():
            raise ValueError("This field is required")

        return value.strip()

    # Validate date format
    @field_validator("date")
    @classmethod
    def validate_date(cls, value):
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError:
            raise ValueError(
                "Date must be in YYYY-MM-DD format"
            )

        return value

    # Validate time format
    @field_validator("start_time", "end_time")
    @classmethod
    def validate_time(cls, value):
        try:
            datetime.strptime(value, "%H:%M")
        except ValueError:
            raise ValueError(
                "Time must be in HH:MM format"
            )

        return value


# Create appointments table
connection.execute("""
CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL
)
""")

connection.commit()


# Home API
@app.get("/")
def home():
    return {
        "message": "Appointment Board API is running"
    }


# Get appointments
@app.get("/appointments")
def get_appointments(
    date: str = None,
    status: str = None
):
    query = "SELECT * FROM appointments WHERE 1=1"
    parameters = []

    if date:
        query += " AND date = ?"
        parameters.append(date)

    if status:
        query += " AND status = ?"
        parameters.append(status)

    query += " ORDER BY date, start_time"

    cursor = connection.execute(
        query,
        parameters
    )

    appointments = cursor.fetchall()

    result = []

    for appointment in appointments:
        result.append({
            "id": appointment[0],
            "title": appointment[1],
            "description": appointment[2],
            "date": appointment[3],
            "start_time": appointment[4],
            "end_time": appointment[5],
            "status": appointment[6]
        })

    return result


# Create appointment
@app.post("/appointments")
def create_appointment(
    appointment: Appointment
):
    # End time must be after start time
    if appointment.end_time <= appointment.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    # Check appointments on the same date
    existing_appointments = connection.execute(
        """
        SELECT start_time, end_time
        FROM appointments
        WHERE date = ?
        AND status != 'cancelled'
        """,
        (appointment.date,)
    ).fetchall()

    # Check overlapping slots
    for existing in existing_appointments:
        existing_start = existing[0]
        existing_end = existing[1]

        if (
            appointment.start_time < existing_end
            and appointment.end_time > existing_start
        ):
            raise HTTPException(
                status_code=400,
                detail="Time slot overlaps with an existing appointment"
            )

    # Insert appointment
    connection.execute(
        """
        INSERT INTO appointments
        (
            title,
            description,
            date,
            start_time,
            end_time,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            appointment.title,
            appointment.description,
            appointment.date,
            appointment.start_time,
            appointment.end_time,
            "scheduled"
        )
    )

    connection.commit()

    return {
        "message": "Appointment created successfully"
    }


# Edit appointment
@app.put("/appointments/{appointment_id}")
def edit_appointment(
    appointment_id: int,
    appointment: Appointment
):
    cursor = connection.execute(
        "SELECT * FROM appointments WHERE id = ?",
        (appointment_id,)
    )

    existing = cursor.fetchone()

    if existing is None:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    if appointment.end_time <= appointment.start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )

    # Check overlap with other appointments
    existing_appointments = connection.execute(
        """
        SELECT id, start_time, end_time
        FROM appointments
        WHERE date = ?
        AND status != 'cancelled'
        AND id != ?
        """,
        (
            appointment.date,
            appointment_id
        )
    ).fetchall()

    for existing_appointment in existing_appointments:
        existing_start = existing_appointment[1]
        existing_end = existing_appointment[2]

        if (
            appointment.start_time < existing_end
            and appointment.end_time > existing_start
        ):
            raise HTTPException(
                status_code=400,
                detail="Time slot overlaps with an existing appointment"
            )

    connection.execute(
        """
        UPDATE appointments
        SET title = ?,
            description = ?,
            date = ?,
            start_time = ?,
            end_time = ?
        WHERE id = ?
        """,
        (
            appointment.title,
            appointment.description,
            appointment.date,
            appointment.start_time,
            appointment.end_time,
            appointment_id
        )
    )

    connection.commit()

    return {
        "message": "Appointment updated successfully"
    }


# Cancel appointment
@app.put("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int
):
    cursor = connection.execute(
        "SELECT * FROM appointments WHERE id = ?",
        (appointment_id,)
    )

    appointment = cursor.fetchone()

    if appointment is None:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    connection.execute(
        """
        UPDATE appointments
        SET status = ?
        WHERE id = ?
        """,
        ("cancelled", appointment_id)
    )

    connection.commit()

    return {
        "message": "Appointment cancelled successfully"
    }


# Mark appointment as completed
@app.put("/appointments/{appointment_id}/complete")
def complete_appointment(
    appointment_id: int
):
    cursor = connection.execute(
        "SELECT * FROM appointments WHERE id = ?",
        (appointment_id,)
    )

    appointment = cursor.fetchone()

    if appointment is None:
        raise HTTPException(
            status_code=404,
            detail="Appointment not found"
        )

    connection.execute(
        """
        UPDATE appointments
        SET status = ?
        WHERE id = ?
        """,
        ("completed", appointment_id)
    )

    connection.commit()

    return {
        "message": "Appointment marked as completed"
    }
