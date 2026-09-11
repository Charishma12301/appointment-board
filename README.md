# appointment-board
Full Stack Appointment Board using React and FastAPI
# Appointment Board

A full-stack Appointment Board application that allows users to create, view, edit, cancel, complete, and filter appointments through a simple and user-friendly interface.

## Features

* Add new appointments
* Edit existing appointments
* Cancel appointments
* Mark appointments as completed
* View all appointments in a board-style layout
* Filter appointments by date
* Filter appointments by status
* Validate required fields
* Validate date and time formats
* Ensure end time is after start time
* Prevent overlapping appointments on the same date
* Keep cancelled appointments visible with a clear cancelled status
* Display success and error messages
* Includes sample appointment data

## Tech Stack

### Frontend

* React
* TypeScript
* CSS
* Vite

### Backend

* Python
* FastAPI
* Pydantic

### Database

* SQLite for local development

> Note: The current development version uses SQLite for simplicity. The application can be migrated to PostgreSQL or MySQL for deployment.

## Project Structure

```text
appointment-board/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── demo/
│   └── demo-video.mp4
│
└── README.md
```

## How the Application Works

The React frontend provides the user interface for managing appointments.

The FastAPI backend handles the application logic and API requests. Appointment details are stored in the database.

When creating or editing an appointment, the backend validates the input and checks whether the selected time overlaps with another active appointment on the same date.

Appointments can have the following statuses:

* Scheduled
* Completed
* Cancelled

Cancelled appointments are not deleted. They remain visible on the appointment board and are clearly marked as cancelled.

## Validation

The application performs the following validations:

* All required fields must be filled.
* Date must use the `YYYY-MM-DD` format.
* Time must use the `HH:MM` format.
* End time must be later than start time.
* Two active appointments cannot overlap on the same date.
* Cancelled appointments do not block a new appointment time slot.

## API Endpoints

| Method | Endpoint                         | Description                      |
| ------ | -------------------------------- | -------------------------------- |
| GET    | `/appointments`                  | Get all appointments             |
| GET    | `/appointments?date=YYYY-MM-DD`  | Filter appointments by date      |
| GET    | `/appointments?status=scheduled` | Filter appointments by status    |
| POST   | `/appointments`                  | Create an appointment            |
| PUT    | `/appointments/{id}`             | Edit an appointment              |
| PUT    | `/appointments/{id}/cancel`      | Cancel an appointment            |
| PUT    | `/appointments/{id}/complete`    | Mark an appointment as completed |

## Running the Project Locally

### Backend

Open a terminal and go to the backend folder:

```bash
cd backend
```

Create and activate the Python virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

Backend will run at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

## Assumptions

* Each appointment belongs to a single date and time range.
* Cancelled appointments remain in the database for record keeping.
* Cancelled appointments do not prevent another appointment from using the same time slot.
* Appointments with overlapping active time ranges are not allowed.
* The application is designed for a single-user/local development environment.
* Authentication and user accounts are not included because they are outside the assignment requirements.

## Demo

Demo video:

https://drive.google.com/file/d/1ncX2BXbxR5yW4yELZDo-hnsvH-H3UQiq/view?usp=sharing

## Author

Charishma Akuthota

GitHub: Charishma12301
