import React, { useState, useEffect, ChangeEvent, useMemo } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import { Upload } from "lucide-react"
import AlertDialogAttachment from './components/ui/AlertDialogAttachment'
import FileUpload from './components/FileUpload/FileUpload'
import LoanInformationForm from './components/LoanInformationForm/LoanInformationForm'
import MemberDetailsForm from './components/MemberDetailsForm/MemberDetailsForm'
import BankDetailsForm from './components/BankDetailsForm/BankDetailsForm'

interface FormData {
  loanDetails: {
    loanType: string;
    lan: string;
    policyNumber: string;
    planNumber: string;
    panNumber: string;
    originalLoanAmount: number;
    sumAssured: number;
    minSumAssured: number;
    maxSumAssured: number;
    minTerm: number;
    maxTerm: number;
    policyTerm: number;
    riskCommencementDate: string;
  };
  memberDetails: {
    memberNumber: string;
    title: string;
    name: string;
    gender: string;
    dateOfBirth: string;
    address: string;
    phoneNumber: string;
    email: string;
  };
}

const defaultFormData: FormData = {
  loanDetails: {
    loanType: '',
    lan: '',
    policyNumber: '',
    planNumber: '',
    panNumber: '',
    originalLoanAmount: 0,
    sumAssured: 0,
    minSumAssured: 0,
    maxSumAssured: 0,
    minTerm: 0,
    maxTerm: 0,
    policyTerm: 0,
    riskCommencementDate: '',
  },
  memberDetails: {
    memberNumber: '',
    title: '',
    name: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
    email: '',
  },
}

const testBankData = {
  memberBankAccount: '1234567890',
  memberIFSC: 'ABCD0123456',
  memberBankAddress: 'XYZ Bank, 456 Bank St, Anytown, AT 12345',
  mphBankAccount: '0987654321',
  mphIFSC: 'EFGH0987654',
  mphBankAddress: 'ABC Bank, 789 MPH St, Anytown, AT 12345',
}

export default function App() {
  const [step, setStep] = useState<'edit' | 'review'>('edit')
  const [initialFormData, setInitialFormData] = useState<FormData>(defaultFormData)
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [sumAssuredError, setSumAssuredError] = useState<string>('')
  const [hasUploadedFile, setHasUploadedFile] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get<FormData>(
        'http://localhost:8080/api/v1/financialService/get-policy-details',
        {
          params: {
            policyNumber: 'POL001',
            memberNo: 'MEM001'
          }
        }
      )
      setInitialFormData(response.data)
      setFormData(response.data)
      setIsLoading(false)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Failed to fetch user details: ${err.response?.data?.message || err.message}`)
      } else {
        setError('An unexpected error occurred while fetching user details')
      }
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      loanDetails: { ...prev.loanDetails, [name]: value },
      memberDetails: { ...prev.memberDetails, [name]: value }
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'gender') {
      const newTitle = value === 'Male' ? 'Mr' : value === 'Female' ? 'Ms' : formData.memberDetails.title
      setFormData(prev => ({
        ...prev,
        memberDetails: { ...prev.memberDetails, [name]: value, title: newTitle }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        loanDetails: { ...prev.loanDetails, [name]: value },
        memberDetails: { ...prev.memberDetails, [name]: value }
      }))
    }
  }

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        loanDetails: { ...prev.loanDetails, [name]: format(date, "yyyy-MM-dd") },
        memberDetails: { ...prev.memberDetails, [name]: format(date, "yyyy-MM-dd") }
      }))
    }
  }

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files])
    setHasUploadedFile(true)
  }

  const handleFileDelete = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setHasUploadedFile(uploadedFiles.length > 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sumAssuredError) {
      setStep('review')
    }
  }

  const handleConfirmSubmit = async () => {
    const changedData = prepareDataForSubmission();
    try {
      setIsLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('request', new Blob([JSON.stringify(changedData)], { type: 'application/json' }));
      uploadedFiles.forEach((file) => {
        formDataToSend.append(`uploadedDocuments`, file);
      });

      const response = await axios.post(
        'http://localhost:8080/api/v1/financialService/create-service-request',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        setInitialFormData(formData);
        setUploadedFiles([]);
        setHasUploadedFile(false);
        setStep('edit');
        setShowAlert(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to submit changes');
      } else {
        setError('Failed to submit changes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const prepareDataForSubmission = () => {
    const modifiedFields: { serviceRequestType: string; newValue: any }[] = [];
    const addedFields = new Set<string>();

    const checkAndAddField = (key: string, newValue: any, oldValue: any) => {
      if (!addedFields.has(key) && JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        modifiedFields.push({
          serviceRequestType: key,
          newValue: newValue
        });
        addedFields.add(key);
      }
    };

    for (const key in formData.loanDetails) {
      checkAndAddField(key, formData.loanDetails[key as keyof typeof formData.loanDetails],
        initialFormData.loanDetails[key as keyof typeof initialFormData.loanDetails]);
    }

    for (const key in formData.memberDetails) {
      checkAndAddField(key, formData.memberDetails[key as keyof typeof formData.memberDetails],
        initialFormData.memberDetails[key as keyof typeof initialFormData.memberDetails]);
    }

    return {
      policyNumber: formData.loanDetails.policyNumber,
      memberNumber: formData.memberDetails.memberNumber,
      modifiedFields: modifiedFields,
    };
  };

  useEffect(() => {
    const sumAssured = formData.loanDetails.sumAssured
    if (sumAssured === 0 || sumAssured < formData.loanDetails.minSumAssured || sumAssured > formData.loanDetails.maxSumAssured) {
      setSumAssuredError(`Sum Assured must be between ${formData.loanDetails.minSumAssured} and ${formData.loanDetails.maxSumAssured}`)
    } else {
      setSumAssuredError('')
    }
  }, [formData.loanDetails.sumAssured, formData.loanDetails.minSumAssured, formData.loanDetails.maxSumAssured])

  const isFormValid = useMemo(() => {
    return !sumAssuredError && formData.loanDetails.sumAssured !== 0 && hasUploadedFile
  }, [sumAssuredError, formData.loanDetails.sumAssured, hasUploadedFile])

  const changedFields = useMemo(() => prepareDataForSubmission().modifiedFields, [formData, initialFormData]);
  const renderFormContent = () => (
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Member Details</h1>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="loan-info">
          <AccordionTrigger className="text-xl font-semibold">Loan Information</AccordionTrigger>
          <AccordionContent className="pt-4">
            <LoanInformationForm
              loanDetails={formData.loanDetails}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onDateChange={handleDateChange}
              sumAssuredError={sumAssuredError}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="member-details">
          <AccordionTrigger className="text-xl font-semibold">Member Details</AccordionTrigger>
          <AccordionContent className="pt-4">
            <MemberDetailsForm
              memberDetails={formData.memberDetails}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
              onDateChange={handleDateChange}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bank-details">
          <AccordionTrigger className="text-xl font-semibold">Bank Details</AccordionTrigger>
          <AccordionContent className="pt-4">
            <BankDetailsForm bankDetails={testBankData} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Upload Documents</h2>
        <p className="text-sm text-muted-foreground">Upload supporting documents (PDF, JPG, JPEG, PNG, max 100MB each)</p>
        <FileUpload
          onFileUpload={handleFileUpload}
          onFileDelete={handleFileDelete}
          maxFileSize={100}
          acceptedFileTypes={['.pdf', '.jpg', '.jpeg', '.png']}
          uploadedFiles={uploadedFiles}
        />
      </div>
    </div>
  )

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  }

  return (
    <>
      {step === 'edit' && (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-card shadow-xl rounded-lg overflow-hidden">
              {renderFormContent()}
              <div className="px-4 py-3 bg-muted text-right sm:px-6">
                <Button type="submit" className="w-full sm:w-auto" disabled={!isFormValid}>Submit for Review</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Changes</h1>

                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Request Details</h2>
                    {changedFields.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {changedFields.map((field, index) => (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg">
                            <p className="font-medium text-lg mb-2">{field.serviceRequestType} Change</p>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="font-semibold">Old Value</p>
                                <p className="mt-1">
                                  {initialFormData.loanDetails[field.serviceRequestType as keyof typeof initialFormData.loanDetails] ||
                                    initialFormData.memberDetails[field.serviceRequestType as keyof typeof initialFormData.memberDetails]}
                                </p>
                              </div>
                              <div>
                                <p className="font-semibold">New Value</p>
                                <p className="mt-1">{field.newValue}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-lg">No changes made</p>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold mb-4">Uploaded Documents</h2>
                    {uploadedFiles.length > 0 && (
                      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {uploadedFiles.map((file, index) => (
                          <li key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                            <Upload className="mr-2 h-5 w-4 text-gray-400" />
                            <span>{file.name}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 sm:px-6 flex justify-between">
                <Button onClick={() => setStep('edit')} variant="outline">Edit</Button>
                <Button onClick={handleConfirmSubmit}>Confirm and Submit</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialogAttachment
          isOpen={showAlert}
          onClose={() => {
            setShowAlert(false);
            setError(null); // Clear the error message when the dialog is closed
          }}
          title={error ? "Error" : "Success"}
          description={error || "Service request created successfully."}
          actionLabel="OK"
      />
    </>
  )
}