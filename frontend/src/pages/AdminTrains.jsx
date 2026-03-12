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
      const response = await fetch('https://train-qa-backend.vercel.app/api/trains')
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

  const handleCreateTrain = async (e) => {
    e.preventDefault()
    setStatus(null)

    try {
      const response = await fetch('https://train-qa-backend.vercel.app/api/trains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          origin: formData.origin,
          destination: formData.destination,
          seats_total: Number(formData.seats_total),
        }),
      })
      const data = await response.json()
      if (data.success) {
        setStatus('Train created successfully.')
        fetchTrains()
        setFormData({ name: '', origin: '', destination: '', seats_total: 50 })
      } else {
        setStatus('Failed to create train.')
      }
    } catch (error) {
      console.error('Error creating train:', error)
      setStatus('Error creating train.')
    }
  }

  const handleDeleteTrain = async (id) => {
    setStatus(null)
    try {
      const response = await fetch(`https://train-qa-backend.vercel.app/api/trains/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      setStatus(data.message || 'Train deleted.')

      // BUG 5: Delete API broken - backend doesn't delete, and we don't refresh list

    } catch (error) {
      console.error('Error deleting train:', error)
      setStatus('Error deleting train.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Admin Train Management</h2>
          <p className="text-gray-500">Create, update, and delete trains</p>
        </div>
        <TrainSvg className="w-32 h-16" animated={true} />
      </div>

      {status && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-md">
          {status}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add New Train</CardTitle>
          <CardDescription>Fill in the form to create a new train.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleCreateTrain}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Train Name</label>
              <Input id="train-name" name="name" value={formData.name} onChange={handleChange} placeholder="Express Z9" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
              <Input id="train-origin" name="origin" value={formData.origin} onChange={handleChange} placeholder="City A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <Input id="train-destination" name="destination" value={formData.destination} onChange={handleChange} placeholder="City B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Seats</label>
              <Input
                id="train-seats"
                type="number"
                name="seats_total"
                value={formData.seats_total}
                onChange={handleChange}
                min="-100"
              />
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
                <p className="text-sm text-gray-500">Available Seats: {train.seats_available}/{train.seats_total}</p>
                <p className="text-xs text-gray-400">Train #{train.id}</p>
              </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Manage this train from the admin panel</p>
              </div>
              <div className="space-x-2">
                <Button variant="secondary" disabled>
                  Edit
                </Button>
                <Button
                  id={`delete-train-${train.id}`}
                  variant="destructive"
                  onClick={() => handleDeleteTrain(train.id)}
                >
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
