export interface Faq {
  _id: string
  question: string
  answer: string
  createdAt?: string
  updatedAt?: string
}

export interface FaqInput {
  question: string
  answer: string
}
