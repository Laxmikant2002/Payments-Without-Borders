import { apiClient } from './apiClient';
import {
  KYCStatus,
  AMLStatus,
  KYCDocument,
  DocumentType,
  ApiResponse
} from '../types/index';

export class ComplianceService {
  // Get KYC status
  async getKYCStatus(): Promise<{
    kycStatus: KYCStatus;
    amlStatus: AMLStatus;
    canTransact: boolean;
    documents: KYCDocument[];
    nextSteps?: string[];
    estimatedCompletionTime?: string;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/compliance/kyc-status');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('KYC status fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch KYC status');
    }
  }

  // Submit KYC documents
  async submitKYCDocuments(documents: {
    documentType: DocumentType;
    documentNumber: string;
    file?: File;
    expiryDate?: Date;
    additionalData?: Record<string, any>;
  }[]): Promise<KYCDocument[]> {
    try {
      const formData = new FormData();
      
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][documentType]`, doc.documentType);
        formData.append(`documents[${index}][documentNumber]`, doc.documentNumber);
        if (doc.file) {
          formData.append(`documents[${index}][file]`, doc.file);
        }
        if (doc.expiryDate) {
          formData.append(`documents[${index}][expiryDate]`, doc.expiryDate.toISOString());
        }
        if (doc.additionalData) {
          formData.append(`documents[${index}][additionalData]`, JSON.stringify(doc.additionalData));
        }
      });

      const response = await apiClient.post<ApiResponse<KYCDocument[]>>(
        '/compliance/kyc-submit',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('KYC submission failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit KYC documents');
    }
  }

  // Upload single document
  async uploadDocument(
    documentType: DocumentType,
    documentNumber: string,
    file: File,
    expiryDate?: Date
  ): Promise<KYCDocument> {
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('documentNumber', documentNumber);
      formData.append('file', file);
      if (expiryDate) {
        formData.append('expiryDate', expiryDate.toISOString());
      }

      const response = await apiClient.post<ApiResponse<KYCDocument>>(
        '/compliance/upload-document',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Document upload failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  }

  // Get uploaded documents
  async getDocuments(): Promise<KYCDocument[]> {
    try {
      const response = await apiClient.get<ApiResponse<KYCDocument[]>>('/compliance/documents');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.delete<ApiResponse>(`/compliance/documents/${documentId}`);
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete document');
    }
  }

  // Get document by ID
  async getDocumentById(documentId: string): Promise<KYCDocument> {
    try {
      const response = await apiClient.get<ApiResponse<KYCDocument>>(
        `/compliance/documents/${documentId}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Document not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch document');
    }
  }

  // Download document
  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await apiClient.get(`/compliance/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response as unknown as Blob;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to download document');
    }
  }

  // Request KYC review
  async requestKYCReview(): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/compliance/request-review');
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request KYC review');
    }
  }

  // Get compliance requirements by country
  async getComplianceRequirements(countryCode: string): Promise<{
    requiredDocuments: DocumentType[];
    optionalDocuments: DocumentType[];
    minAge: number;
    maxTransactionAmount: number;
    additionalRequirements: string[];
    processingTime: string;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        `/compliance/requirements/${countryCode}`
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Requirements fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance requirements');
    }
  }

  // Verify phone number for KYC
  async verifyPhoneNumber(phoneNumber: string): Promise<{ verificationId: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ verificationId: string }>>(
        '/compliance/verify-phone',
        { phoneNumber }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Phone verification failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify phone number');
    }
  }

  // Confirm phone verification
  async confirmPhoneVerification(verificationId: string, code: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/compliance/confirm-phone', {
        verificationId,
        code
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Phone verification confirmation failed');
    }
  }

  // Verify email for KYC
  async verifyEmail(email: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/compliance/verify-email', {
        email
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify email');
    }
  }

  // Confirm email verification
  async confirmEmailVerification(token: string): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/compliance/confirm-email', {
        token
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification confirmation failed');
    }
  }

  // Submit address verification
  async submitAddressVerification(addressData: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    proofDocument?: File;
  }): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('street', addressData.street);
      formData.append('city', addressData.city);
      if (addressData.state) formData.append('state', addressData.state);
      formData.append('postalCode', addressData.postalCode);
      formData.append('country', addressData.country);
      if (addressData.proofDocument) {
        formData.append('proofDocument', addressData.proofDocument);
      }

      const response = await apiClient.post<ApiResponse>('/compliance/verify-address', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit address verification');
    }
  }

  // Get compliance history
  async getComplianceHistory(): Promise<Array<{
    id: string;
    action: string;
    status: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    documents?: KYCDocument[];
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/compliance/history');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance history');
    }
  }

  // Appeal KYC rejection
  async appealKYCRejection(reason: string, additionalDocuments?: File[]): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      formData.append('reason', reason);
      
      if (additionalDocuments && additionalDocuments.length > 0) {
        additionalDocuments.forEach((file, index) => {
          formData.append(`additionalDocuments[${index}]`, file);
        });
      }

      const response = await apiClient.post<ApiResponse>('/compliance/appeal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit KYC appeal');
    }
  }

  // Check transaction limits
  async getTransactionLimits(): Promise<{
    dailyLimit: number;
    monthlyLimit: number;
    singleTransactionLimit: number;
    currency: string;
    remainingDailyLimit: number;
    remainingMonthlyLimit: number;
    kycLevel: string;
    nextLevelRequirements?: string[];
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/compliance/transaction-limits');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Transaction limits fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction limits');
    }
  }

  // Admin functions

  // Review KYC submission (admin only)
  async reviewKYCSubmission(
    userId: string,
    decision: 'approve' | 'reject',
    notes?: string
  ): Promise<ApiResponse> {
    try {
      const response = await apiClient.post<ApiResponse>('/compliance/admin/review-kyc', {
        userId,
        decision,
        notes
      });
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to review KYC submission');
    }
  }

  // Get pending KYC reviews (admin only)
  async getPendingKYCReviews(): Promise<Array<{
    userId: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    documents: KYCDocument[];
    submittedAt: Date;
    priority: 'low' | 'medium' | 'high';
  }>> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/compliance/admin/pending-reviews');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pending KYC reviews');
    }
  }

  // Get compliance statistics (admin only)
  async getComplianceStats(): Promise<{
    totalUsers: number;
    approvedUsers: number;
    pendingUsers: number;
    rejectedUsers: number;
    approvalRate: number;
    avgProcessingTime: number;
    byCountry: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/compliance/admin/stats');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Compliance stats fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch compliance statistics');
    }
  }

  // Submit KYC application for review
  async submitKycApplication(): Promise<{ status: KYCStatus }> {
    try {
      const response = await apiClient.post<ApiResponse<{ status: KYCStatus }>>('/compliance/submit-kyc');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('KYC submission failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit KYC application');
    }
  }

  // Get AML status
  async getAmlStatus(): Promise<{ status: AMLStatus; riskScore?: number; lastCheck?: Date }> {
    try {
      const response = await apiClient.get<ApiResponse<{ status: AMLStatus; riskScore?: number; lastCheck?: string }>>('/compliance/aml-status');
      if (response.success && response.data) {
        const result: { status: AMLStatus; riskScore?: number; lastCheck?: Date } = {
          status: response.data.status,
        };
        if (response.data.riskScore !== undefined) {
          result.riskScore = response.data.riskScore;
        }
        if (response.data.lastCheck) {
          result.lastCheck = new Date(response.data.lastCheck);
        }
        return result;
      }
      throw new Error('AML status fetch failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch AML status');
    }
  }

  // Request AML check
  async requestAmlCheck(): Promise<{ status: AMLStatus; riskScore?: number }> {
    try {
      const response = await apiClient.post<ApiResponse<{ status: AMLStatus; riskScore?: number }>>('/compliance/request-aml-check');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('AML check request failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request AML check');
    }
  }
}

export const complianceService = new ComplianceService();
