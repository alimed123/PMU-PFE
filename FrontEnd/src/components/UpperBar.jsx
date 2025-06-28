import React from 'react'
import { Link } from 'react-router-dom'
import umbblogo from '../assets/umbblogo.png' // <-- Import the image

const UpperBar = () => {
  return (
    <div>
      <div className="flex justify-center items-center bg-backgroundlight p-4 rounded-t-lg">
        <img src={umbblogo} alt="Logo" className="h-16 w-16" />

      </div>

      <div className='bg-backgroundlight flex flex-col justify-between items-center shadow-md'>
        <ul className="flex flex-row xl:text-2xl text-lg font-bold justify-around items-center w-2/3 text-textblue">
          <li className="px-4 py-2 rounded-md border-textblue">
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="px-4 py-2 rounded-md">
            <Link to="/events">Events</Link>
          </li>
          <li className="px-4 py-2 rounded-md">
            <Link to="/graphs">Graphs</Link>
          </li>
          <li className="px-4 py-2 rounded-md">
            <Link to="/notifications">Notifications</Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default UpperBar
