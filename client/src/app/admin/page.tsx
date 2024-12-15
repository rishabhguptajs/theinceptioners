"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import Toast from "@/components/Toast"
import AddPackageModal from "@/components/admin/AddPackageModal"
import EditPackageModal from "@/components/admin/EditPackageModal"
import { Package, Booking } from "@/types"

const AnalyticsSection = ({
  bookings,
  packages,
}: {
  bookings: Booking[]
  packages: Package[]
}) => {
  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0
  )
  const averageBookingValue = totalRevenue / (bookings.length || 1)
  const mostPopularPackage = packages.reduce(
    (acc, pkg) => {
      const bookingsCount = bookings.filter(
        (b) => b.package._id === pkg._id
      ).length
      return bookingsCount > acc.count
        ? { id: pkg._id, count: bookingsCount, title: pkg.title }
        : acc
    },
    { id: "", count: 0, title: "" }
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Total Revenue
        </h3>
        <p className="text-3xl font-bold text-green-600">
          ₹{totalRevenue.toLocaleString()}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Average Booking Value
        </h3>
        <p className="text-3xl font-bold text-blue-600">
          ₹{averageBookingValue.toLocaleString()}
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Most Popular Package
        </h3>
        <p className="text-xl font-medium text-gray-900">
          {mostPopularPackage.title}
        </p>
        <p className="text-sm text-gray-600">
          {mostPopularPackage.count} bookings
        </p>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [packages, setPackages] = useState<Package[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success" as "success" | "error",
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 6

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
  }

  const fetchData = async () => {
    try {
      const authString = localStorage.getItem("adminAuth")
      const headers = { Authorization: `Basic ${authString}` }

      const [packagesRes, bookingsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/packages/paginated`, {
          params: {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
          },
          headers,
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, { headers }),
      ])

      if (packagesRes.data.success) {
        setPackages(packagesRes.data.packages)
        setTotalPages(packagesRes.data.totalPages)
        setBookings(bookingsRes.data.bookings)
      } else {
        throw new Error("Failed to fetch packages")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      showToast("Error fetching data", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    const authString = localStorage.getItem("adminAuth")
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/packages/admin/packages/${id}`,
        {
          headers: {
            Authorization: `Basic ${authString}`,
          },
        }
      )
      showToast("Package deleted successfully", "success")
      fetchData()
    } catch (error) {
      console.error("Error deleting package:", error)
      showToast("Error deleting package", "error")
    }
  }

  const paginationControls = (
    <div className="flex justify-center mt-8 space-x-2">
      <button
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 border rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AnalyticsSection bookings={bookings} packages={packages} />
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Packages</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Add New Package
          </button>
        </div>

        {packages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Packages Available
              </h3>
              <p className="text-gray-600">
                Click the "Add New Package" button to create your first package.
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Package
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/packages/${
                        pkg._id
                      }/image?t=${new Date().getTime()}`}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg"
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {pkg.title}
                    </h3>
                    <p className="text-gray-700 mt-1">{pkg.description}</p>
                    <p className="text-lg font-bold text-blue-700 mt-2">
                      ₹{pkg.price}
                    </p>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">
                        Available Dates:
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pkg.availableDates.map((date, index) => (
                          <span
                            key={index}
                            className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded"
                          >
                            {new Date(date).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setEditingPackage(pkg)}
                        className="flex-1 px-3 py-2 bg-blue-200 text-blue-700 rounded hover:bg-blue-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pkg._id)}
                        className="flex-1 px-3 py-2 bg-red-200 text-red-700 rounded hover:bg-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">{paginationControls}</div>
          </>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recent Bookings
        </h2>
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Bookings Yet
              </h3>
              <p className="text-gray-600">
                Bookings will appear here once customers start making
                reservations.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Travelers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-300">
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.customerEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.package.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.numberOfTravelers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ₹{booking.totalPrice}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <AddPackageModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchData}
          showToast={showToast}
        />
      )}

      {editingPackage && (
        <EditPackageModal
          package={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSuccess={fetchData}
          showToast={showToast}
        />
      )}
    </div>
  )
}
