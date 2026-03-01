# API Examples

This document provides examples of using the Voix-IA REST API.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. For production use, implement authentication middleware.

## Examples

### Create a Reservation

Create a new reservation for a customer.

**Request:**
```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "phoneNumber": "+12025551234",
    "email": "jane@example.com",
    "date": "2024-12-25",
    "time": "7:00 PM",
    "partySize": 4,
    "specialRequests": "Vegetarian menu please"
  }'
```

**Response:**
```json
{
  "id": "f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f",
  "name": "Jane Doe",
  "phoneNumber": "+12025551234",
  "email": "jane@example.com",
  "date": "2024-12-25",
  "time": "7:00 PM",
  "partySize": 4,
  "specialRequests": "Vegetarian menu please",
  "status": "confirmed",
  "createdAt": "2024-01-04T12:00:00.000Z",
  "updatedAt": "2024-01-04T12:00:00.000Z"
}
```

### Get a Reservation

Retrieve a specific reservation by ID.

**Request:**
```bash
curl http://localhost:3000/api/reservations/f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f
```

**Response:**
```json
{
  "id": "f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f",
  "name": "Jane Doe",
  "phoneNumber": "+12025551234",
  "email": "jane@example.com",
  "date": "2024-12-25",
  "time": "7:00 PM",
  "partySize": 4,
  "specialRequests": "Vegetarian menu please",
  "status": "confirmed",
  "createdAt": "2024-01-04T12:00:00.000Z",
  "updatedAt": "2024-01-04T12:00:00.000Z"
}
```

### Get Reservations by Phone Number

Find all reservations for a specific phone number.

**Request:**
```bash
curl http://localhost:3000/api/reservations/phone/+12025551234
```

**Response:**
```json
[
  {
    "id": "f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f",
    "name": "Jane Doe",
    "phoneNumber": "+12025551234",
    "date": "2024-12-25",
    "time": "7:00 PM",
    "partySize": 4,
    "status": "confirmed",
    "createdAt": "2024-01-04T12:00:00.000Z",
    "updatedAt": "2024-01-04T12:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Jane Doe",
    "phoneNumber": "+12025551234",
    "date": "2024-12-31",
    "time": "8:00 PM",
    "partySize": 2,
    "status": "confirmed",
    "createdAt": "2024-01-03T12:00:00.000Z",
    "updatedAt": "2024-01-03T12:00:00.000Z"
  }
]
```

### Update a Reservation

Modify an existing reservation.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/reservations/f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-12-26",
    "time": "8:00 PM",
    "partySize": 6
  }'
```

**Response:**
```json
{
  "id": "f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f",
  "name": "Jane Doe",
  "phoneNumber": "+12025551234",
  "email": "jane@example.com",
  "date": "2024-12-26",
  "time": "8:00 PM",
  "partySize": 6,
  "specialRequests": "Vegetarian menu please",
  "status": "confirmed",
  "createdAt": "2024-01-04T12:00:00.000Z",
  "updatedAt": "2024-01-04T12:30:00.000Z"
}
```

### Cancel a Reservation

Cancel an existing reservation.

**Request:**
```bash
curl -X DELETE http://localhost:3000/api/reservations/f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f
```

**Response:**
```json
{
  "id": "f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f",
  "name": "Jane Doe",
  "phoneNumber": "+12025551234",
  "email": "jane@example.com",
  "date": "2024-12-26",
  "time": "8:00 PM",
  "partySize": 6,
  "specialRequests": "Vegetarian menu please",
  "status": "cancelled",
  "createdAt": "2024-01-04T12:00:00.000Z",
  "updatedAt": "2024-01-04T12:45:00.000Z"
}
```

### Get All Reservations

Retrieve all active reservations.

**Request:**
```bash
curl http://localhost:3000/api/reservations
```

**Response:**
```json
[
  {
    "id": "f7c3e6d0-9b2a-4c5e-8f1d-3a7b6c8d9e0f",
    "name": "Jane Doe",
    "phoneNumber": "+12025551234",
    "date": "2024-12-25",
    "time": "7:00 PM",
    "partySize": 4,
    "status": "confirmed",
    "createdAt": "2024-01-04T12:00:00.000Z",
    "updatedAt": "2024-01-04T12:00:00.000Z"
  },
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Smith",
    "phoneNumber": "+12025555678",
    "date": "2024-12-26",
    "time": "6:30 PM",
    "partySize": 2,
    "status": "confirmed",
    "createdAt": "2024-01-03T14:00:00.000Z",
    "updatedAt": "2024-01-03T14:00:00.000Z"
  }
]
```

### Check Availability

Check if a specific date/time/party size is available.

**Request:**
```bash
curl "http://localhost:3000/api/availability?date=2024-12-25&time=7:00 PM&partySize=4"
```

**Response:**
```json
{
  "available": true
}
```

or

```json
{
  "available": false
}
```

## Error Responses

### 400 Bad Request

Missing or invalid parameters.

```json
{
  "error": "Missing required fields: name, phoneNumber, date, time, partySize"
}
```

### 404 Not Found

Resource not found.

```json
{
  "error": "Reservation not found"
}
```

### 409 Conflict

No availability for requested time.

```json
{
  "error": "No availability for the requested date and time"
}
```

### 500 Internal Server Error

Server error.

```json
{
  "error": "Internal server error"
}
```

## Health Check

Check if the service is running.

**Request:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "voix-ia",
  "timestamp": "2024-01-04T12:00:00.000Z"
}
```

## JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Create a reservation
async function createReservation() {
  try {
    const response = await axios.post(`${API_BASE}/reservations`, {
      name: 'John Smith',
      phoneNumber: '+12025551234',
      email: 'john@example.com',
      date: '2024-12-25',
      time: '7:00 PM',
      partySize: 4,
      specialRequests: 'Window seat preferred'
    });
    
    console.log('Reservation created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', error.response?.data);
  }
}

// Get reservations for a phone number
async function getReservationsByPhone(phoneNumber) {
  try {
    const response = await axios.get(
      `${API_BASE}/reservations/phone/${encodeURIComponent(phoneNumber)}`
    );
    
    console.log('Reservations:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching reservations:', error.response?.data);
  }
}

// Update a reservation
async function updateReservation(id, updates) {
  try {
    const response = await axios.put(
      `${API_BASE}/reservations/${id}`,
      updates
    );
    
    console.log('Reservation updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating reservation:', error.response?.data);
  }
}

// Cancel a reservation
async function cancelReservation(id) {
  try {
    const response = await axios.delete(`${API_BASE}/reservations/${id}`);
    
    console.log('Reservation cancelled:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error cancelling reservation:', error.response?.data);
  }
}

// Check availability
async function checkAvailability(date, time, partySize) {
  try {
    const response = await axios.get(`${API_BASE}/availability`, {
      params: { date, time, partySize }
    });
    
    console.log('Availability:', response.data);
    return response.data.available;
  } catch (error) {
    console.error('Error checking availability:', error.response?.data);
  }
}
```

## Python Example

```python
import requests
import json

API_BASE = 'http://localhost:3000/api'

def create_reservation():
    data = {
        'name': 'John Smith',
        'phoneNumber': '+12025551234',
        'email': 'john@example.com',
        'date': '2024-12-25',
        'time': '7:00 PM',
        'partySize': 4,
        'specialRequests': 'Window seat preferred'
    }
    
    response = requests.post(f'{API_BASE}/reservations', json=data)
    
    if response.status_code == 201:
        print('Reservation created:', response.json())
        return response.json()
    else:
        print('Error:', response.json())

def get_reservations_by_phone(phone_number):
    response = requests.get(f'{API_BASE}/reservations/phone/{phone_number}')
    
    if response.status_code == 200:
        print('Reservations:', response.json())
        return response.json()
    else:
        print('Error:', response.json())

def check_availability(date, time, party_size):
    params = {
        'date': date,
        'time': time,
        'partySize': party_size
    }
    
    response = requests.get(f'{API_BASE}/availability', params=params)
    
    if response.status_code == 200:
        print('Available:', response.json()['available'])
        return response.json()['available']
    else:
        print('Error:', response.json())
```
