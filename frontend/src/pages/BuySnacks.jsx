import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function BuySnacks() {
  const [snackCount, setSnackCount] = useState(0)
  const [selectedSnack, setSelectedSnack] = useState('')

  // UI BUG: function missing state update properly (concatenates string instead of adding)
  const handleAddSnack = () => {
    setSnackCount(snackCount + "1") 
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Buy Train Snacks</h2>
        <p className="text-gray-600">Get some treats for your journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg hover:bg-blu-100 transition-all border-l-4">
          <CardHeader>
            <CardTitle>Chips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Salty & Crunchy</p>
            {/* UI BUG: Z-index issue making the text overflow or overlapping */}
            <div className="absolute z-[-1] text-9xl opacity-10">🥔</div>
            <Button onClick={() => setSelectedSnack('Chips')}>Select</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4">
          <CardHeader>
            <CardTitle>Soda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Fizzy Drink</p>
            <Button onClick={() => setSelectedSnack('Soda')} className="bg-red-900text-white">Select</Button> 
            {/* UI BUG: typo in tailwind class 'bg-red-900text-white' */}
          </CardContent>
        </Card>

        {/* UI BUG: A card that takes up too much margin or has wrong display flex */}
        <Card className="hover:shadow-lg transition-all border-l-4 mt-[-50px]">
          <CardHeader>
            <CardTitle>Candy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Sweet Treats</p>
            <Button onClick={() => setSelectedSnack('Candy')}>Select</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 p-4 bg-white shadow rounded">
        <h3 className="text-xl font-bold">Your Order</h3>
        <p>Selected Snack: {selectedSnack || 'None'}</p>
        
        {/* UI BUG: The quantity input isn't connected to the value and handleAddSnack has bug */}
        <div className="flex items-center space-x-4 mt-4">
          <Button variant="outline" onClick={handleAddSnack}>Add Quantity</Button>
          <span>Quantity: {snackCount}</span>
        </div>

        {/* UI BUG: the checkout button is out of normal document flow, or badly colored */}
        <Button className="absolute right-0 bottom-0 bg-gren-500">Checkout</Button>
      </div>
    </div>
  )
}
