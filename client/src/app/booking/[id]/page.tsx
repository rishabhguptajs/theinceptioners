"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import Toast from "@/components/Toast"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

interface Package {
  _id: string
  title: string
  description: string
  price: number
}

interface BookingFormData {
  customerName: string
  customerEmail: string
  customerPhone: string
  numberOfTravelers: number
  specialRequests: string
}

interface ToastState {
  show: boolean
  message: string
  type: "success" | "error"
}

export default function BookingPage() {
  const id = useParams().id
  const router = useRouter()
  const [packageData, setPackageData] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  })
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    numberOfTravelers: 1,
    specialRequests: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type })
  }

  const generateInvoicePDF = async () => {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])

    const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const boldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)

    page.drawText("TRAVEL BOOKING INVOICE", {
      x: 50,
      y: 750,
      size: 24,
      font: boldFont,
      color: rgb(0.1, 0.1, 0.1),
    })

    page.drawText("Customer Details:", {
      x: 50,
      y: 700,
      size: 14,
      font: boldFont,
    })

    page.drawText(`Name: ${formData.customerName}`, {
      x: 50,
      y: 680,
      size: 12,
      font: font,
    })

    page.drawText(`Email: ${formData.customerEmail}`, {
      x: 50,
      y: 660,
      size: 12,
      font: font,
    })

    page.drawText(`Phone: ${formData.customerPhone}`, {
      x: 50,
      y: 640,
      size: 12,
      font: font,
    })

    page.drawText("Package Details:", {
      x: 50,
      y: 600,
      size: 14,
      font: boldFont,
    })

    page.drawText(`Package: ${packageData?.title}`, {
      x: 50,
      y: 580,
      size: 12,
      font: font,
    })

    page.drawText(`Price per person: Rs. ${packageData?.price}`, {
      x: 50,
      y: 560,
      size: 12,
      font: font,
    })

    page.drawText(`Number of travelers: ${formData.numberOfTravelers}`, {
      x: 50,
      y: 540,
      size: 12,
      font: font,
    })

    page.drawText(
      `Total Amount: Rs. ${
        (packageData?.price || 0) * formData.numberOfTravelers
      }`,
      {
        x: 50,
        y: 500,
        size: 16,
        font: boldFont,
        color: rgb(0.2, 0.2, 0.8),
      }
    )

    const pdfBytes = await pdfDoc.save()
    const blob = new Blob([pdfBytes], { type: "application/pdf" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `invoice-${formData.customerName}.pdf`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/packages/${id}`
        )
        if (response.data.success) {
          setPackageData(response.data.specificPackage)
        } else {
          showToast("Failed to load package details", "error")
          router.push("/")
        }
      } catch (error) {
        console.error("Error fetching package:", error)
        showToast("Failed to load package details", "error")
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchPackage()
  }, [id, router])

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      showToast("Please enter your name", "error")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      showToast("Please enter a valid email address", "error")
      return false
    }
    if (!/^\+?[\d\s-]{10,}$/.test(formData.customerPhone)) {
      showToast("Please enter a valid phone number", "error")
      return false
    }
    if (formData.numberOfTravelers < 1) {
      showToast("Number of travelers must be at least 1", "error")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!packageData || !validateForm()) return

    const lastSubmissionId = localStorage.getItem('lastBookingSubmission')

    if (lastSubmissionId && Date.now() - parseInt(lastSubmissionId) < 2000) {
      console.log('Preventing duplicate submission')
      return
    }

    localStorage.setItem('lastBookingSubmission', Date.now().toString())

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings`,
        {
          ...formData,
          packageId: id,
          totalPrice: packageData.price * formData.numberOfTravelers,
          specialRequests: formData.specialRequests
            ? [formData.specialRequests]
            : [],
        }
      )

      if (response.data.success) {
        showToast("Booking successful!", "success")
        setShowInvoice(true)
        setTimeout(() => {
          router.push("/")
        }, 2000)
      }
    } catch (error: any) {
      console.error("Error creating booking:", error)
      showToast(
        error.response?.data?.message ||
          "Error creating booking. Please try again.",
        "error"
      )
    }
  }

  if (loading || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white text-center mb-12 drop-shadow-lg">
          Book Your Dream Package
        </h1>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 mb-10 transform hover:scale-[1.01] transition-all">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            {packageData.title}
          </h2>
          <p className="text-gray-700 mb-6 text-lg">
            {packageData.description}
          </p>
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-full px-6 py-3">
            <p className="text-2xl font-bold text-white">
              ₹{packageData.price} per person
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="customerName"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="customerName"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="customerEmail"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="customerEmail"
                value={formData.customerEmail}
                onChange={(e) =>
                  setFormData({ ...formData, customerEmail: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="customerPhone"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label
                htmlFor="numberOfTravelers"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Number of Travelers
              </label>
              <input
                type="number"
                id="numberOfTravelers"
                min="1"
                value={formData.numberOfTravelers}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfTravelers: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor="specialRequests"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Special Requests
              </label>
              <textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) =>
                  setFormData({ ...formData, specialRequests: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-lg resize-none"
                placeholder="Any special requests or requirements?"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-xl shadow-inner">
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              Total Price: ₹
              {(packageData.price * formData.numberOfTravelers).toFixed(2)}
            </p>
            <p className="text-gray-700">
              ₹{packageData.price} × {formData.numberOfTravelers} travelers
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold 
                                ${
                                  isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-indigo-700 transform hover:scale-[1.02]"
                                } 
                                transition-all duration-200`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Processing...
                </div>
              ) : (
                "Confirm Booking"
              )}
            </button>

            {showInvoice && (
              <button
                type="button"
                onClick={generateInvoicePDF}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
              >
                Download Invoice
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}