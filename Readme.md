
# Doctor Appointment Booking Backend

This project is a backend system for managing doctor appointment bookings. It provides APIs for viewing free slots, creating events, and fetching scheduled appointments. The backend is built using TypeScript and Node.js.

## Features
- **View Free Slots**: Check available appointment slots.
- **Create Appointments**: Book appointments with specified duration.
- **Fetch Events**: Retrieve all scheduled appointments within a date range.

## Prerequisites
- Node.js (v14+)
- npm or yarn
- TypeScript

## Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:rachitbucha/appointment-backend.git
   cd appointment-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `env.example` to `.env` and update with appropriate values.
   ```bash
   cp env.example .env
   ```

## Scripts
The following scripts are available in `package.json`:
- **Start the application**:
  ```bash
  npm start
  ```
- **Development mode**:
  ```bash
  npm run dev
  ```
- **Build the application**:
  ```bash
  npm run build
  ```
- **Run tests**:
  ```bash
  npm run test
  ```

## API Endpoints

### 1. **Get Free Slots**
   - **URL**: `GET /api/appointment/free-slots`
   - **Query Parameters**:
     - `timestamp` (required): The reference time in milliseconds.
     - `timezone` (required): The timezone identifier (e.g., `Asia/Calcutta`).
   - **Example**:
     ```bash
     curl "http://localhost:3000/api/appointment/free-slots?timestamp=1730399400000&timezone=Asia%2FCalcutta"
     ```

### 2. **Create Appointment**
   - **URL**: `POST /api/appointment/create-event`
   - **Query Parameters**:
     - `timestamp` (required): The start time of the appointment in milliseconds.
     - `timezone` (required): The timezone identifier (e.g., `Asia/Calcutta`).
     - `duration` (required): Appointment duration in minutes.
   - **Example**:
     ```bash
     curl -X POST "http://localhost:3000/api/appointment/create-event?timestamp=1730457000000&timezone=Asia%2FCalcutta&duration=30"
     ```

### 3. **Get Appointments**
   - **URL**: `GET /api/appointment/events`
   - **Query Parameters**:
     - `startDate` (required): Start of the date range in milliseconds.
     - `endDate` (required): End of the date range in milliseconds.
     - `timezone` (required): The timezone identifier (e.g., `Asia/Calcutta`).
   - **Example**:
     ```bash
     curl "http://localhost:3000/api/appointment/events?startDate=1731868200000&endDate=1732991399000&timezone=Asia/Calcutta"
     ```

## Debugging
The project includes VSCode configurations for debugging:
- **Development**: Launches the app in development mode.
- **Testing**: Runs the test suite.
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node-terminal",
      "request": "launch",
      "name": "Development",
      "command": "npm run dev"
    },
    {
      "type": "node-terminal",
      "request": "launch",
      "name": "Test",
      "command": "npm run test"
    }
  ]
}
```

## Technologies Used
- **TypeScript**: For type-safe development.
- **Node.js**: Backend runtime environment.
- **Jest**: For testing the application.


---
Happy Coding! 🎉
