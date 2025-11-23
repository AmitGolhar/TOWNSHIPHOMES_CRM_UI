export interface Payment {
  id?: number;
  clientName: string;
  clientPhone?: string;
  propertyName?: string;

  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  collectionTarget?: number;

  status: 'Pending' | 'Partial' | 'Paid';
  paymentDate?: string;
  nextDueDate?: string;

  paymentMode?: 'Cash' | 'Cheque' | 'Bank Transfer' | 'UPI';
  proofUrl?: string;
  notes?: string;

  
  assignedTo?: string;
  assignedEmployeeName?: string;
}
