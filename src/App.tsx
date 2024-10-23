import React, { useState, useEffect, ChangeEvent } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Upload } from "lucide-react"
import { cn } from "@/lib/utils"
import AlertDialogAttachment from './components/ui/AlertDialogAttachment'

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

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    setHasUploadedFile(files.length > 0)
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
      // Create FormData object
      const formDataToSend = new FormData();

      // Append JSON data
      formDataToSend.append('request', new Blob([JSON.stringify(changedData)], { type: 'application/json' }));

      // Append files
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append(`uploadedDocuments`, file);
      });

      // Make the actual API call
      // Log FormData entries
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await axios.post(
        'http://localhost:8080/api/v1/financialService/create-service-request',
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Submitting data to server:', changedData);

      if (response.status === 200) {
        // Reset the form and go back to edit mode
        setInitialFormData(formData);
        setUploadedFiles([]);
        setHasUploadedFile(false);
        setStep('edit');

        // Show success alert
        setShowAlert(true);
      }
    } catch (err) {
      setError('Failed to submit changes');
      // Show error alert
      alert('Failed to submit changes. Please try again.');
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

    // Check loanDetails
    for (const key in formData.loanDetails) {
      checkAndAddField(key, formData.loanDetails[key as keyof typeof formData.loanDetails],
        initialFormData.loanDetails[key as keyof typeof initialFormData.loanDetails]);
    }

    // Check memberDetails
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
    if (sumAssured < formData.loanDetails.minSumAssured || sumAssured > formData.loanDetails.maxSumAssured) {
      setSumAssuredError(`Sum Assured must be between ${formData.loanDetails.minSumAssured} and ${formData.loanDetails.maxSumAssured}`)
    } else {
      setSumAssuredError('')
    }
  }, [formData.loanDetails.sumAssured, formData.loanDetails.minSumAssured, formData.loanDetails.maxSumAssured])

  const renderFormContent = () => (
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Member Details</h1>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="loan-info">
          <AccordionTrigger className="text-xl font-semibold">Loan Information</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="loanType">Loan Type</Label>
                <Input id="loanType" name="loanType" value={formData.loanDetails.loanType} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lan">LAN</Label>
                <Input id="lan" name="lan" value={formData.loanDetails.lan} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input id="policyNumber" name="policyNumber" value={formData.loanDetails.policyNumber} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="planNumber">Plan Number</Label>
                <Input id="planNumber" name="planNumber" value={formData.loanDetails.planNumber} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="panNumber">PAN Number</Label>
                <Input id="panNumber" name="panNumber" value={formData.loanDetails.panNumber} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="originalLoanAmount">Original Loan Amount</Label>
                <Input id="originalLoanAmount" name="originalLoanAmount" value={formData.loanDetails.originalLoanAmount} readOnly className="mt-1 bg-white" />
              </div>
              <div>
                <Label htmlFor="sumAssured">Sum Assured</Label>
                <Input
                  id="sumAssured"
                  name="sumAssured"
                  value={formData.loanDetails.sumAssured}
                  onChange={(e) => handleInputChange({ target: { name: 'sumAssured', value: e.target.value } } as ChangeEvent<HTMLInputElement>)}
                  className={`mt-1 ${sumAssuredError ? 'border-red-500' : ''}`}
                />
                {sumAssuredError && <p className="text-red-500 text-sm mt-1">{sumAssuredError}</p>}
              </div>
              <div>
                <Label htmlFor="policyTerm">Policy Term</Label>
                <Select name="policyTerm" value={formData.loanDetails.policyTerm.toString()} onValueChange={(value) => handleSelectChange('policyTerm', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(formData.loanDetails.maxTerm - formData.loanDetails.minTerm + 1)].map((_, i) => (
                      <SelectItem key={i + formData.loanDetails.minTerm} value={(i + formData.loanDetails.minTerm).toString()}>
                        {i + formData.loanDetails.minTerm}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="riskCommencementDate">Risk Commencement Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.loanDetails.riskCommencementDate ? format(new Date(formData.loanDetails.riskCommencementDate), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.loanDetails.riskCommencementDate)}
                      onSelect={(date) => handleDateChange('riskCommencementDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="member-details">
          <AccordionTrigger className="text-xl font-semibold">Member Details</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Select name="title" value={formData.memberDetails.title} onValueChange={(value) => handleSelectChange('title', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Ms">Ms</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.memberDetails.name} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="gender-select">Gender</Label>
                <Select id="gender-select" name="gender" value={formData.memberDetails.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of  Birth</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.memberDetails.dateOfBirth ? format(new Date(formData.memberDetails.dateOfBirth), "dd/MM/yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.memberDetails.dateOfBirth)}
                      onSelect={(date) => handleDateChange('dateOfBirth', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="col-span-full">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.memberDetails.address} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Contact Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={formData.memberDetails.phoneNumber} onChange={handleInputChange} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" value={formData.memberDetails.email} onChange={handleInputChange} className="mt-1" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bank-details">
          <AccordionTrigger className="text-xl font-semibold">Bank Details</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="memberBankAccount">Member Bank Account Number</Label>
                <Input id="memberBankAccount" name="memberBankAccount" value={testBankData.memberBankAccount} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="memberIFSC">Member IFSC Code</Label>
                <Input id="memberIFSC" name="memberIFSC" value={testBankData.memberIFSC} readOnly className="mt-1" />
              </div>
              <div className="col-span-full">
                <Label htmlFor="memberBankAddress">Member Bank Address</Label>
                <Input id="memberBankAddress" name="memberBankAddress" value={testBankData.memberBankAddress} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="mphBankAccount">MPH Bank Account Number</Label>
                <Input id="mphBankAccount" name="mphBankAccount" value={testBankData.mphBankAccount} readOnly className="mt-1" />
              </div>
              <div>
                <Label htmlFor="mphIFSC">MPH IFSC Code</Label>
                <Input id="mphIFSC" name="mphIFSC" value={testBankData.mphIFSC} readOnly className="mt-1" />
              </div>
              <div className="col-span-full">
                <Label htmlFor="mphBankAddress">MPH Bank Address</Label>
                <Input id="mphBankAddress" name="mphBankAddress" value={testBankData.mphBankAddress} readOnly className="mt-1" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Upload Documents</h2>
        <p className="text-sm text-muted-foreground">Upload supporting documents (PDF, JPG, JPEG, PNG, max 100MB each)</p>
        <Input id="fileUpload" data-testid="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={handleFileUpload} />
        {uploadedFiles.length > 0 && (
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                <span>{file.name}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleFileDelete(index)}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>
  }

  if (step === 'edit') {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card shadow-xl rounded-lg overflow-hidden">
            {renderFormContent()}
            <div className="px-4 py-3 bg-muted text-right sm:px-6">
              <Button type="submit" className="w-full sm:w-auto" disabled={!hasUploadedFile || !!sumAssuredError}>Submit for Review</Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'review') {
    const changedFields = prepareDataForSubmission().modifiedFields;

    return (
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
                              <Label>Old Value</Label>
                              <p className="mt-1">
                                {initialFormData.loanDetails[field.serviceRequestType as keyof typeof initialFormData.loanDetails] ||
                                  initialFormData.memberDetails[field.serviceRequestType as keyof typeof initialFormData.memberDetails]}
                              </p>
                            </div>
                            <div>
                              <Label>New Value</Label>
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
                  {uploadedFiles.length > 0 ? (
                    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="bg-gray-50 p-4 rounded-lg flex items-center">
                          <Upload className="mr-2 h-5 w-4 text-gray-400" />
                          <span>{file.name}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-lg">No documents uploaded</p>
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
    )
  }

  return (
    <>
      {/* Render the main component content here */}
      <AlertDialogAttachment
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Success"
        description="Service request created successfully."
        actionLabel="OK"
      />
    </>
  )

  return null
}