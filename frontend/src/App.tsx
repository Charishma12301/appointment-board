import { useEffect, useState } from "react"
import "./App.css"

type Appointment = {
  id: number
  title: string
  description: string
  date: string
  start_time: string
  end_time: string
  status: string
}

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("")

  const fetchAppointments = async () => {
    try {
      let url = "http://127.0.0.1:8000/appointments"

      const params = new URLSearchParams()

      if (filterDate) {
        params.append("date", filterDate)
      }

      if (filterStatus) {
        params.append("status", filterStatus)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()

      setAppointments(data)
    } catch {
      alert("Unable to load appointments")
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [filterDate, filterStatus])

  const clearForm = () => {
    setTitle("")
    setDescription("")
    setDate("")
    setStartTime("")
    setEndTime("")
    setEditingId(null)
  }

  const openAddForm = () => {
    clearForm()
    setShowForm(true)
  }

  const closeForm = () => {
    clearForm()
    setShowForm(false)
  }

  const handleEdit = (appointment: Appointment) => {
    setEditingId(appointment.id)
    setTitle(appointment.title)
    setDescription(appointment.description)

    let formattedDate = appointment.date

    const parts = appointment.date.split("-")

    if (
      parts.length === 3 &&
      parts[0].length === 2 &&
      parts[2].length === 4
    ) {
      formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
    }

    setDate(formattedDate)
    setStartTime(appointment.start_time)
    setEndTime(appointment.end_time)

    setShowForm(true)
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    if (
      !title.trim() ||
      !description.trim() ||
      !date ||
      !startTime ||
      !endTime
    ) {
      alert("Please fill all fields")
      return
    }

    if (endTime <= startTime) {
      alert("End time must be after start time")
      return
    }

    try {
      const isEditing = editingId !== null

      const url = isEditing
        ? `http://127.0.0.1:8000/appointments/${editingId}`
        : "http://127.0.0.1:8000/appointments"

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date,
          start_time: startTime,
          end_time: endTime,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || "Something went wrong")
        return
      }

      alert(
        isEditing
          ? "Appointment updated successfully"
          : "Appointment created successfully"
      )

      closeForm()
      fetchAppointments()
    } catch {
      alert("Unable to connect to backend")
    }
  }

  const handleCancel = async (id: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/appointments/${id}/cancel`,
        {
          method: "PUT",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || "Unable to cancel appointment")
        return
      }

      alert("Appointment cancelled successfully")
      fetchAppointments()
    } catch {
      alert("Unable to connect to backend")
    }
  }

  const handleComplete = async (id: number) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/appointments/${id}/complete`,
        {
          method: "PUT",
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.detail || "Unable to complete appointment")
        return
      }

      alert("Appointment marked as completed")
      fetchAppointments()
    } catch {
      alert("Unable to connect to backend")
    }
  }

  const clearFilters = () => {
    setFilterDate("")
    setFilterStatus("")
  }

  return (
    <div className="app-container">

      <header className="header">
        <div>
          <h1>Appointment Board</h1>
          <p>Manage your appointments easily</p>
        </div>

        <button
          className="primary-btn"
          onClick={openAddForm}
        >
          + Add Appointment
        </button>
      </header>

      <section className="filter-card">
        <h2>Filters</h2>

        <div className="filters">

          <div className="filter-group">
            <label htmlFor="filter-date">Date</label>

            <input
              id="filter-date"
              type="date"
              value={filterDate}
              onChange={(event) =>
                setFilterDate(event.target.value)
              }
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-status">Status</label>

            <select
              id="filter-status"
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value)
              }
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button
            className="secondary-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>
      </section>

      <h2 className="appointments-title">
        Appointments
      </h2>

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="appointments-grid">

          {appointments.map((appointment) => (

            <div
              key={appointment.id}
              className={`appointment-card ${
                appointment.status === "cancelled"
                  ? "cancelled-card"
                  : ""
              }`}
            >

              <h3>{appointment.title}</h3>

              <p className="description">
                {appointment.description}
              </p>

              <p className="appointment-info">
                <strong>Date:</strong>{" "}
                {appointment.date}
              </p>

              <p className="appointment-info">
                <strong>Time:</strong>{" "}
                {appointment.start_time} -{" "}
                {appointment.end_time}
              </p>

              <p className="appointment-info">
                <strong>Status:</strong>{" "}

                <span
                  className={`status status-${appointment.status}`}
                >
                  {appointment.status}
                </span>
              </p>

              <div className="actions">

                <button
                  className="action-btn edit-btn"
                  onClick={() =>
                    handleEdit(appointment)
                  }
                >
                  Edit
                </button>

                <button
                  className="action-btn cancel-btn"
                  onClick={() =>
                    handleCancel(appointment.id)
                  }
                  disabled={appointment.status === "cancelled"}
                >
                  Cancel
                </button>

                <button
                  className="action-btn complete-btn"
                  onClick={() =>
                    handleComplete(appointment.id)
                  }
                  disabled={appointment.status === "completed"}
                >
                  Complete
                </button>

              </div>

            </div>

          ))}

        </div>
      )}

      {showForm && (
        <section className="form-card">

          <h2>
            {editingId !== null
              ? "Edit Appointment"
              : "Add Appointment"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="title">Title</label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter appointment title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>

              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
              />
            </div>

            <div className="time-row">

              <div className="form-group">
                <label htmlFor="start-time">
                  Start Time
                </label>

                <input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(event) =>
                    setStartTime(event.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="end-time">
                  End Time
                </label>

                <input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(event) =>
                    setEndTime(event.target.value)
                  }
                />
              </div>

            </div>

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
              >
                {editingId !== null
                  ? "Update Appointment"
                  : "Save Appointment"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
              >
                Close
              </button>

            </div>

          </form>

        </section>
      )}

    </div>
  )
}
export default App