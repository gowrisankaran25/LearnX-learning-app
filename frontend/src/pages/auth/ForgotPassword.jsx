import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen app-shell flex items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <div className="w-14 h-14 rounded-xl bg-[#dceee9] text-[#087f73] flex items-center justify-center mb-5">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <p className="eyebrow mb-2">Account access</p>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Reset your password</h1>
        <p className="text-gray-600 mb-6">
          Password reset email delivery is not configured yet. Contact your administrator to reset your local account.
        </p>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#fff7d6] text-[#6e5512] mb-6">
          <Mail className="w-5 h-5 shrink-0" />
          <span className="text-sm font-semibold">Add SMTP settings to enable automatic reset emails.</span>
        </div>
        <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
