import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import TrainSvg from '../components/TrainSvg'

export default function MyTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('https://train-qa-backend.vercel.app/api/tickets')
      const data = await response.json()
      setTickets(data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (ticketId) => {
    try {
      const response = await fetch(`https://train-qa-backend.vercel.app/api/tickets/${ticketId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      setStatus(data.message || 'Ticket cancelled.')

      // BUG 3: Cancel ticket button broken - backend does nothing, frontend also doesn't refresh list

    } catch (error) {
      console.error('Error cancelling ticket:', error)
      setStatus('Error cancelling ticket')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <TrainSvg className="w-20 h-10" animated={true} />
        <p>Loading tickets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Tickets</h2>
          <p className="text-gray-500">Manage your booked journeys</p>
        </div>
        <TrainSvg className="w-32 h-16" animated={true} />
      </div>

      {status && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md">
          {status}
        </div>
      )}

      {tickets.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Tickets Yet</CardTitle>
            <CardDescription>Book a train to see tickets here.</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-6">
            <TrainSvg className="w-24 h-12 mx-auto opacity-60" animated={false} />
            <p className="text-gray-500 mt-2">Your tickets will appear here after booking.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
                <div>
                  <CardTitle className="text-xl text-blue-700">
                    {ticket.passenger_name || 'Anonymous'}
                  </CardTitle>
                  <CardDescription>
                    {ticket.train_name} — {ticket.origin} to {ticket.destination}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Seats: {ticket.seat_count}</p>
                  <p className="text-sm text-gray-400">Ticket #{ticket.id}</p>
                </div>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Train booking confirmed</p>
                </div>
                <Button
                  id={`cancel-ticket-${ticket.id}`}
                  variant="destructive"
                  onClick={() => handleCancel(ticket.id)}
                >
                  Cancel Ticket
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
