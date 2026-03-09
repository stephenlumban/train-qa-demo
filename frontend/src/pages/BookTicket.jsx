import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import TrainSvg from '../components/TrainSvg'

export default function BookTicket() {
  const { trainId } = useParams()
  const navigate = useNavigate()
  const [train, setTrain] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    passengerName: '',
    seatCount: 1,
  })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchTrain()
  }, [trainId])

  const fetchTrain = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/trains/${trainId}`)
      if (!response.ok) {
        throw new Error('Failed to load train')
      }
      const data = await response.json()
      setTrain(data)
    } catch (error) {
      console.error('Error fetching train:', error)
      setStatus({ type: 'error', message: 'Unable to load train details.' })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateInputs = () => {
    const errors = []
    const seatCountNumber = Number(formData.seatCount)
    if (!formData.passengerName.trim()) {
      errors.push('Passenger name is required.')
    }
    if (!Number.isInteger(seatCountNumber) || seatCountNumber <= 0) {
      errors.push('Seat count must be a positive whole number.')
    }
    if (train && seatCountNumber > train.seats_available) {
      errors.push('Seat count exceeds available seats.')
    }
    return { errors, seatCountNumber }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { errors, seatCountNumber } = validateInputs()
    if (errors.length) {
      setStatus({ type: 'error', message: errors.join(' ') })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger_name: formData.passengerName.trim(),
          train_id: Number(trainId),
          seat_count: seatCountNumber,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Failed to book ticket')
      }

      setStatus({ type: 'success', message: 'Ticket booked successfully!' })
      setTrain((prev) =>
        prev
          ? { ...prev, seats_available: prev.seats_available - seatCountNumber }
          : prev
      )
      setTimeout(() => navigate('/tickets'), 1200)
    } catch (error) {
      console.error('Error booking ticket:', error)
      setStatus({ type: 'error', message: error.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (!train) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <TrainSvg className="w-20 h-10" animated={true} />
        <p>Loading train details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-blue-700">Book Ticket</CardTitle>
            <CardDescription>
              {train.name} — {train.origin} to {train.destination}
            </CardDescription>
          </div>
          <TrainSvg className="w-32 h-16" animated={true} />
        </CardHeader>
        <CardContent>
          {status && (
            <div
              className={`mb-4 p-3 rounded-md ${
                status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {status.message}
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Name</label>
              <Input
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seat Count</label>
              <Input
                type="number"
                name="seatCount"
                value={formData.seatCount}
                onChange={handleChange}
                min="1"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available seats: {train.seats_available}
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Booking…' : 'Book Ticket'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
