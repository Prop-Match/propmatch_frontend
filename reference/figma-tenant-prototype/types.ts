export type Screen =
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'kyc-id-front'
  | 'kyc-id-back'
  | 'kyc-selfie'
  | 'kyc-processing'
  | 'kyc-success'
  | 'kyc-failure'
  | 'kyc-disclaimer'
  | 'tenant-browse'
  | 'tenant-match-form'
  | 'tenant-match-results'
  | 'tenant-quota-exhausted'
  | 'property-detail'
  | 'legal-chatbot'
  | 'contract-form'
  | 'contract-preview'
  | 'landlord-dashboard'
  | 'add-property'
  | 'publish-pay'
  | 'boost-listing'
  | 'payment-modal'
  | 'landlord-inquiries'
  | 'admin-dashboard'
  | 'admin-property-review'
  | 'admin-user-review'
  | 'profile'

export type UserRole = 'tenant' | 'landlord' | 'admin'

export interface AppState {
  screen: Screen
  role: UserRole
  isLoggedIn: boolean
  isKycVerified: boolean
  freeMatches: number
  paymentContext: 'listing' | 'boost' | 'matches' | null
  showPaymentModal: boolean
}
