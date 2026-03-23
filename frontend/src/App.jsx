import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Train, Ticket, Settings } from 'lucide-react'
import TrainList from './pages/TrainList'
import BookTicket from './pages/BookTicket'
import MyTickets from './pages/MyTickets'
import BuySnacks from './pages/BuySnacks'
import AdminTrains from './pages/AdminTrains'
import TrainSvg from './components/TrainSvg'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <TrainSvg className="w-16 h-8" animated={true} />
                <h1 className="text-2xl font-bold text-gray-800">🚆 Train QA Demo</h1>
              </div>
              <div className="flex space-x-6">
                <Link
                  to="/trains"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Train size={20} />
                  <span>Trains</span>
                </Link>
                <Link
                  to="/tickets"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Ticket size={20} />
                  <span>My Tickets</span>
                </Link>
                <Link
                  to="/admin/trains"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Settings size={20} />
                  <span>Admin</span>
                </Link>
                <Link
                  to="/snacks"
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>Snacks</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<TrainList />} />
            <Route path="/trains" element={<TrainList />} />
            <Route path="/book/:trainId" element={<BookTicket />} />
            <Route path="/tickets" element={<MyTickets />} />
            <Route path="/admin/trains" element={<AdminTrains />} />
            <Route path="/snacks" element={<BuySnacks />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App