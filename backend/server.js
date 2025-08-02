const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const cors = require("cors");

let db;
const app = express();
app.use(express.json());
app.use(cors());

const initializeDBandServer = async () => {
    try {
        db = await open({
            filename: path.join(__dirname, "healthcare.db"),
            driver: sqlite3.Database,
        });

        // Create tables if they don't exist
        await db.exec(`
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                specialization TEXT NOT NULL,
                profileImage TEXT,
                experience TEXT,
                qualification TEXT,
                availabilityStatus TEXT DEFAULT 'Available Today',
                consultationFee INTEGER,
                rating REAL DEFAULT 4.5,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS doctor_schedules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctorId INTEGER,
                dayOfWeek TEXT,
                startTime TEXT,
                endTime TEXT,
                isAvailable BOOLEAN DEFAULT 1,
                FOREIGN KEY (doctorId) REFERENCES doctors (id)
            );

            CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doctorId INTEGER,
                patientName TEXT NOT NULL,
                email TEXT NOT NULL,
                appointmentDate TEXT NOT NULL,
                appointmentTime TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doctorId) REFERENCES doctors (id)
            );
        `);

        // Insert sample doctors if table is empty
        const doctorCount = await db.get("SELECT COUNT(*) as count FROM doctors");
        if (doctorCount.count === 0) {
            await insertSampleData();
        }

        app.listen(3000, () => {
            console.log("Server is running on http://localhost:3000/");
        });
    } catch (error) {
        console.log(`Database error is ${error.message}`);
        process.exit(1);
    }
};

const insertSampleData = async () => {
    const sampleDoctors = [
        {
            name: "Dr. Rajesh Kumar",
            specialization: "Cardiologist",
            profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face",
            experience: "15 years",
            qualification: "MBBS, MD (Cardiology)",
            availabilityStatus: "Available Today",
            consultationFee: 800
        },
        {
            name: "Dr. Priya Sharma",
            specialization: "Dermatologist",
            profileImage: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?crop=faces&fit=crop&w=300&h=300",
            experience: "12 years",
            qualification: "MBBS, MD (Dermatology)",
            availabilityStatus: "Available Today",
            consultationFee: 600
        },
        {
            name: "Dr. Amit Singh",
            specialization: "Orthopedist",
            profileImage: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face",
            experience: "18 years",
            qualification: "MBBS, MS (Orthopedics)",
            availabilityStatus: "Fully Booked",
            consultationFee: 700
        },
        {
            name: "Dr. Sunita Patel",
            specialization: "Pediatrician",
            profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face",
            experience: "10 years",
            qualification: "MBBS, MD (Pediatrics)",
            availabilityStatus: "Available Today",
            consultationFee: 500
        },
        {
            name: "Dr. Vikram Gupta",
            specialization: "Neurologist",
            profileImage: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face",
            experience: "20 years",
            qualification: "MBBS, DM (Neurology)",
            availabilityStatus: "On Leave",
            consultationFee: 1000
        },
        {
            name: "Dr. Kavya Reddy",
            specialization: "Gynecologist",
            profileImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=faces&fit=crop&w=300&h=300",
            experience: "14 years",
            qualification: "MBBS, MD (Gynecology)",
            availabilityStatus: "Available Today",
            consultationFee: 650
        }
    ];

    for (const doctor of sampleDoctors) {
        await db.run(
            `INSERT INTO doctors (name, specialization, profileImage, experience, qualification, availabilityStatus, consultationFee) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [doctor.name, doctor.specialization, doctor.profileImage, doctor.experience, doctor.qualification, doctor.availabilityStatus, doctor.consultationFee]
        );
    }

    // Insert sample schedules
    const doctors = await db.all("SELECT id FROM doctors");
    const timeSlots = [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "17:00" },
        { start: "18:00", end: "20:00" }
    ];
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (const doctor of doctors) {
        for (const day of days) {
            for (const slot of timeSlots) {
                await db.run(
                    `INSERT INTO doctor_schedules (doctorId, dayOfWeek, startTime, endTime) VALUES (?, ?, ?, ?)`,
                    [doctor.id, day, slot.start, slot.end]
                );
            }
        }
    }
};

// GET /api/doctors - Retrieve all doctors
app.get("/api/doctors", async (req, res) => {
    try {
        const doctors = await db.all("SELECT * FROM doctors");
        res.json(doctors);
    } catch (error) {
        console.error("Error retrieving doctors:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/doctors/:id - Get specific doctor details
app.get("/api/doctors/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const doctor = await db.get("SELECT * FROM doctors WHERE id = ?", [id]);
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }
        
        const schedules = await db.all(
            "SELECT * FROM doctor_schedules WHERE doctorId = ?", 
            [id]
        );
        
        res.json({ ...doctor, schedules });
    } catch (error) {
        console.error("Error retrieving doctor:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/appointments - Create a new appointment
app.post("/api/appointments", async (req, res) => {
    const { doctorId, patientName, email, appointmentDate, appointmentTime } = req.body;
    
    if (!doctorId || !patientName || !email || !appointmentDate || !appointmentTime) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        // Check if doctor exists
        const doctor = await db.get("SELECT * FROM doctors WHERE id = ?", [doctorId]);
        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        // Check for existing appointment at the same time
        const existingAppointment = await db.get(
            "SELECT * FROM appointments WHERE doctorId = ? AND appointmentDate = ? AND appointmentTime = ?",
            [doctorId, appointmentDate, appointmentTime]
        );

        if (existingAppointment) {
            return res.status(409).json({ error: "Time slot already booked" });
        }

        const result = await db.run(
            "INSERT INTO appointments (doctorId, patientName, email, appointmentDate, appointmentTime) VALUES (?, ?, ?, ?, ?)",
            [doctorId, patientName, email, appointmentDate, appointmentTime]
        );

        res.json({
            id: result.lastID,
            doctorId,
            patientName,
            email,
            appointmentDate,
            appointmentTime,
            status: "scheduled",
            createdAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Error creating appointment:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/appointments/:doctorId - Get appointments for a specific doctor
app.get("/api/appointments/:doctorId", async (req, res) => {
    const { doctorId } = req.params;
    try {
        const appointments = await db.all(
            "SELECT * FROM appointments WHERE doctorId = ? ORDER BY appointmentDate, appointmentTime",
            [doctorId]
        );
        res.json(appointments);
    } catch (error) {
        console.error("Error retrieving appointments:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

initializeDBandServer();