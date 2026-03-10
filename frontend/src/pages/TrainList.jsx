import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import TrainSvg from '../components/TrainSvg'

export default function TrainList() {
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <TrainSvg className="w-32 h-16" animated={true} />
        <p className="ml-4 text-lg text-gray-600">Loading trains...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <TrainSvg className="w-64 h-32 mx-auto mb-6" animated={true} />
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Available Trains</h2>
        <p className="text-gray-600">Choose your destination and book your journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trains.map((train) => (
          <Card key={train.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-blue-700">{train.name}</CardTitle>
                <div className="relative">
                  <TrainSvg className="w-12 h-6" animated={false} />
                </div>
              </div>
              <CardDescription className="flex items-center space-x-2">
                <MapPin size={16} className="text-green-600" />
                <span>{train.origin}</span>
                <span className="text-gray-400">→</span>
                <MapPin size={16} className="text-red-600" />
                <span>{train.destination}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-600">Available Seats</span>
                  </div>
                  <span id={`seats-${train.id}`} className={`font-bold ${
                    train.seats_available > 50 ? 'text-green-600' :
                    train.seats_available > 20 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {train.seats_available} / {train.seats_total}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-purple-600" />
                  <span className="text-sm text-gray-600">Journey Time: 4-6 hours</span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">$89</span>
                    <span className="text-sm text-gray-500">per seat</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button asChild className="flex-1" id={`book-train-${train.id}`}>
                    <Link to={`/book/${train.id}`}>
                      Book Ticket
                    </Link>
                  </Button>
                  <Button variant="outline" className="px-3">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {trains.length === 0 && (
        <div className="text-center py-12">
          <TrainSvg className="w-32 h-16 mx-auto mb-4 opacity-50" animated={false} />
          <p className="text-gray-500">No trains available at the moment.</p>
        </div>
      )}
    </div>
  )
}