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
      const data = await response.json()
      setTrain(data)
    } catch (error) {
      console.error('Error fetching train:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // BUG 1: Missing validation - intentionally not checking empty name or negative seats

    try {
      const response = await fetch('http://localhost:3001/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passenger_name: formData.passengerName,
          train_id: Number(trainId),
          seat_count: Number(formData.seatCount),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setStatus({ type: 'success', message: 'Ticket booked successfully!' })
        setTimeout(() => navigate('/tickets'), 1200)
      } else {
        setStatus({ type: 'error', message: 'Failed to book ticket.' })
      }
    } catch (error) {
      console.error('Error booking ticket:', error)
      setStatus({ type: 'error', message: 'Error booking ticket.' })
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passenger Name
              </label>
              <Input
                id="passenger-name"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                placeholder="Enter passenger name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seat Count
              </label>
              <Input
                id="seat-count"
                type="number"
                name="seatCount"
                value={formData.seatCount}
                onChange={handleChange}
                min="-10"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
              <Button type="submit">Book Ticket</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
