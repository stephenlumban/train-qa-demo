import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import TrainSvg from '../components/TrainSvg'

export default function AdminTrains() {
  const [trains, setTrains] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    origin: '',
    destination: '',
    seats_total: 50,
  })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchTrains()
  }, [])

  const fetchTrains = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/trains')
      const data = await response.json()
      setTrains(data)
    } catch (error) {
      console.error('Error fetching trains:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const statusClasses = {
    success: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  }

  const validateForm = () => {
    const trimmed = {
      name: formData.name.trim(),
      origin: formData.origin.trim(),
      destination: formData.destination.trim(),
    }
    const seatsTotal = Number(formData.seats_total)
    const errors = []
    if (!trimmed.name) errors.push('Train name is required.')
    if (!trimmed.origin) errors.push('Origin is required.')
    if (!trimmed.destination) errors.push('Destination is required.')
    if (!Number.isInteger(seatsTotal) || seatsTotal <= 0) {
      errors.push('Total seats must be a positive whole number.')
    }
    return { trimmed, seatsTotal, errors }
  }

  const handleCreateTrain = async (e) => {
    e.preventDefault()
    const { trimmed, seatsTotal, errors } = validateForm()
    if (errors.length) {
      setStatus({ type: 'error', message: errors.join(' ') })
      return
    }

    try {
      setStatus({ type: 'info', message: 'Creating train…' })
      const response = await fetch('http://localhost:3001/api/trains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed.name,
          origin: trimmed.origin,
          destination: trimmed.destination,
          seats_total: seatsTotal,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create train')
      }
      setStatus({ type: 'success', message: 'Train created successfully.' })
      setFormData({ name: '', origin: '', destination: '', seats_total: 50 })
      fetchTrains()
    } catch (error) {
      console.error('Error creating train:', error)
      setStatus({ type: 'error', message: error.message || 'Error creating train' })
    }
  }

  const handleDeleteTrain = async (id) => {
    try {
      setStatus({ type: 'info', message: 'Deleting train…' })
      const response = await fetch(`http://localhost:3001/api/trains/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete train')
      }
      setStatus({ type: 'success', message: data.message || 'Train deleted' })
      setTrains((prev) => prev.filter((train) => train.id !== id))
    } catch (error) {
      console.error('Error deleting train:', error)
      setStatus({ type: 'error', message: error.message || 'Error deleting train' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Train Management</h2>
          <p className="text-gray-500">Create, update, delete trains (well, mostly)</p>
        </div>
        <TrainSvg className="w-32 h-16" animated={true} />
      </div>

      {status && (
        <div className={`${statusClasses[status.type] ?? statusClasses.info} p-3 rounded-md`}>
          {status.message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add New Train</CardTitle>
          <CardDescription>Fill in the form to create a shiny new train.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateTrain}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Train Name</label>
              <Input name="name" value={formData.name} onChange={handleChange} placeholder="Express Z9" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
              <Input name="origin" value={formData.origin} onChange={handleChange} placeholder="City A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <Input name="destination" value={formData.destination} onChange={handleChange} placeholder="City B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
              <Input
                type="number"
                name="seats_total"
                value={formData.seats_total}
                onChange={handleChange}
                min="1"
                step="1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Enter the total number of seats on the train.</p>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit">Create Train</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {trains.map((train) => (
          <Card key={train.id}>
            <CardHeader className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
              <div>
                <CardTitle className="text-xl text-blue-700">{train.name}</CardTitle>
                <CardDescription>
                  {train.origin} → {train.destination}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Seats: {train.seats_available}/{train.seats_total}</p>
                <p className="text-xs text-gray-400">Train #{train.id}</p>
              </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Created via admin panel</p>
                <p className="text-xs text-gray-400">Keep seats in sync with passenger bookings.</p>
              </div>
              <div className="space-x-2">
                <Button variant="secondary" disabled>
                  Edit (Coming Soon)
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteTrain(train.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
